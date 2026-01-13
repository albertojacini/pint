"""Document processing: PDF parsing, chunking, and embedding generation."""

import asyncio
import io
import re
from abc import ABC, abstractmethod
from typing import Optional

import boto3
import httpx
import pdfplumber
import tiktoken
from openai import AsyncOpenAI

from core.config import settings


# ============================================================================
# PDF Parser Interface & Implementations
# ============================================================================


class BasePDFParser(ABC):
    """Abstract base class for PDF parsers. Implement this to add new parsers."""

    @abstractmethod
    async def parse_pdf(self, file_bytes: bytes) -> dict:
        """
        Parse PDF and extract text.

        Returns:
            dict with 'text' (full text), 'page_count', and 'pages' (list of text per page)
        """
        pass


class PdfPlumberParser(BasePDFParser):
    """PDF text extraction using pdfplumber (local, no cloud dependency)."""

    async def parse_pdf(self, file_bytes: bytes) -> dict:
        loop = asyncio.get_event_loop()

        def _extract_text():
            pages_text = []
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    text = page.extract_text() or ""
                    pages_text.append(text)
            return pages_text

        pages_text = await loop.run_in_executor(None, _extract_text)

        return {
            "text": "\n\n".join(pages_text),
            "pages": pages_text,
            "page_count": len(pages_text),
        }


class TextractParser(BasePDFParser):
    """
    PDF text extraction using AWS Textract.

    Note: Textract's sync API only supports single-page PDFs or images.
    For multi-page PDFs, documents must be uploaded to S3 and processed async.
    This implementation uses the sync API for simplicity - use for single-page
    docs or switch to async flow for multi-page support.
    """

    def __init__(self):
        self.client = boto3.client(
            "textract",
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.aws_region,
        )

    async def parse_pdf(self, file_bytes: bytes) -> dict:
        loop = asyncio.get_event_loop()

        def _call_textract():
            response = self.client.detect_document_text(Document={"Bytes": file_bytes})
            return response

        response = await loop.run_in_executor(None, _call_textract)

        # Extract text with page metadata
        pages_dict: dict[int, list[str]] = {}

        for block in response.get("Blocks", []):
            if block["BlockType"] == "LINE":
                text = block.get("Text", "")
                page = block.get("Page", 1)
                if page not in pages_dict:
                    pages_dict[page] = []
                pages_dict[page].append(text)

        # Convert to list format
        page_count = max(pages_dict.keys()) if pages_dict else 0
        pages = []
        for i in range(1, page_count + 1):
            pages.append("\n".join(pages_dict.get(i, [])))

        return {
            "text": "\n\n".join(pages),
            "pages": pages,
            "page_count": page_count,
        }


def get_pdf_parser() -> BasePDFParser:
    """
    Factory function to get the configured PDF parser.

    Set PDF_PARSER env var to switch:
    - "pdfplumber" (default): Local parsing, handles multi-page PDFs
    - "textract": AWS Textract (requires AWS credentials, single-page only for sync)
    """
    parser_type = getattr(settings, "pdf_parser", "pdfplumber")

    if parser_type == "textract":
        return TextractParser()
    else:
        return PdfPlumberParser()


# ============================================================================
# URL Content Extractor Interface & Implementations
# ============================================================================


class BaseURLExtractor(ABC):
    """Abstract base class for URL content extractors."""

    @abstractmethod
    async def extract(self, url: str) -> dict:
        """
        Extract content from URL.

        Returns:
            dict with 'text', 'title', 'url' (final URL after redirects)
        """
        pass


class JinaExtractor(BaseURLExtractor):
    """
    Extract webpage content using Jina Reader API.

    API: GET https://r.jina.ai/{url}
    Returns clean markdown content suitable for chunking and embedding.
    """

    def __init__(self):
        self.base_url = "https://r.jina.ai"
        self.api_key = settings.jina_api_key

    async def extract(self, url: str) -> dict:
        headers = {
            "Accept": "text/plain",
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(
                f"{self.base_url}/{url}",
                headers=headers,
                follow_redirects=True,
            )
            response.raise_for_status()
            content = response.text

        # Jina returns markdown with title as first H1
        title = None
        lines = content.split("\n")
        for line in lines:
            if line.startswith("# "):
                title = line[2:].strip()
                break

        return {
            "text": content,
            "title": title,
            "url": url,
        }


def get_url_extractor() -> BaseURLExtractor:
    """
    Factory function to get the configured URL extractor.

    Set SOURCES_APP__URL_EXTRACTOR env var to switch:
    - "jina" (default): Jina Reader API
    """
    extractor_type = settings.sources_app__url_extractor

    if extractor_type == "jina":
        return JinaExtractor()
    else:
        raise ValueError(f"Unknown URL extractor: {extractor_type}")


# ============================================================================
# Text Chunking
# ============================================================================


class TextChunker:
    """Split text into chunks for embedding."""

    def __init__(
        self,
        chunk_size: int = 512,
        chunk_overlap: int = 50,
    ):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.encoding = tiktoken.encoding_for_model("gpt-4")

    def chunk_text(
        self,
        text: str,
        metadata: Optional[dict] = None,
    ) -> list[dict]:
        """
        Split text into overlapping chunks.

        Strategy:
        1. Split by paragraphs first (preserve semantic boundaries)
        2. Merge small paragraphs until reaching chunk_size
        3. Split large paragraphs if needed
        4. Add overlap between chunks

        Returns:
            List of dicts with 'content', 'tokens', 'index', 'metadata'
        """
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

        chunks = []
        current_chunk = []
        current_tokens = 0

        for para in paragraphs:
            para_tokens = len(self.encoding.encode(para))

            # If paragraph alone exceeds chunk size, split it
            if para_tokens > self.chunk_size:
                # Flush current chunk first
                if current_chunk:
                    chunks.append(self._create_chunk(current_chunk, len(chunks), metadata))
                    current_chunk = []
                    current_tokens = 0

                # Split large paragraph by sentences
                sentences = self._split_sentences(para)
                for sentence in sentences:
                    sent_tokens = len(self.encoding.encode(sentence))
                    if current_tokens + sent_tokens > self.chunk_size and current_chunk:
                        chunks.append(self._create_chunk(current_chunk, len(chunks), metadata))
                        # Keep overlap
                        overlap_text = self._get_overlap(current_chunk)
                        current_chunk = [overlap_text] if overlap_text else []
                        current_tokens = len(self.encoding.encode(overlap_text)) if overlap_text else 0

                    current_chunk.append(sentence)
                    current_tokens += sent_tokens

            # Normal paragraph - try to add to current chunk
            elif current_tokens + para_tokens <= self.chunk_size:
                current_chunk.append(para)
                current_tokens += para_tokens
            else:
                # Chunk is full, create it and start new one with overlap
                chunks.append(self._create_chunk(current_chunk, len(chunks), metadata))
                overlap_text = self._get_overlap(current_chunk)
                current_chunk = [overlap_text, para] if overlap_text else [para]
                current_tokens = len(self.encoding.encode(" ".join(current_chunk)))

        # Don't forget the last chunk
        if current_chunk:
            chunks.append(self._create_chunk(current_chunk, len(chunks), metadata))

        return chunks

    def _create_chunk(
        self,
        parts: list[str],
        index: int,
        metadata: Optional[dict],
    ) -> dict:
        content = "\n\n".join(parts)
        return {
            "content": content,
            "tokens": len(self.encoding.encode(content)),
            "index": index,
            "metadata": metadata or {},
        }

    def _get_overlap(self, parts: list[str]) -> str:
        """Get the last ~chunk_overlap tokens worth of text."""
        full_text = " ".join(parts)
        tokens = self.encoding.encode(full_text)
        if len(tokens) <= self.chunk_overlap:
            return full_text
        overlap_tokens = tokens[-self.chunk_overlap :]
        return self.encoding.decode(overlap_tokens)

    def _split_sentences(self, text: str) -> list[str]:
        """Simple sentence splitter."""
        sentences = re.split(r"(?<=[.!?])\s+", text)
        return [s.strip() for s in sentences if s.strip()]


# ============================================================================
# Embedding Generation
# ============================================================================


class EmbeddingGenerator:
    """Generate embeddings using OpenAI."""

    def __init__(self, model: str = "text-embedding-3-small"):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = model
        self.batch_size = 100

    async def generate_embeddings(self, texts: list[str]) -> list[list[float]]:
        """
        Generate embeddings for a list of texts.

        Batches requests for efficiency.
        """
        all_embeddings = []

        for i in range(0, len(texts), self.batch_size):
            batch = texts[i : i + self.batch_size]
            response = await self.client.embeddings.create(model=self.model, input=batch)
            batch_embeddings = [e.embedding for e in response.data]
            all_embeddings.extend(batch_embeddings)

        return all_embeddings

    async def generate_single(self, text: str) -> list[float]:
        """Generate embedding for a single text (for queries)."""
        response = await self.client.embeddings.create(model=self.model, input=text)
        return response.data[0].embedding
