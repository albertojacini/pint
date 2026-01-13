"""Business logic for the sources app."""

import hashlib
import json
from typing import Optional
from urllib.parse import urlparse
from uuid import UUID

from core.db import db
from apps.sources.models import Document, DocumentCreate, Publisher, PublisherCreate
from apps.sources.document_processor import (
    get_pdf_parser,
    TextChunker,
    EmbeddingGenerator,
)


def parse_json_fields(row_dict: dict, fields: list[str]) -> dict:
    """Parse JSON string fields into dicts."""
    for field in fields:
        if field in row_dict and isinstance(row_dict[field], str):
            row_dict[field] = json.loads(row_dict[field])
    return row_dict


class SourcesService:
    """Service for managing publishers and documents."""

    def __init__(self):
        pass

    # =========================================================================
    # Publisher operations
    # =========================================================================

    async def find_publisher_by_url(self, url: str) -> Optional[Publisher]:
        """Find a publisher by its base URL."""
        async with db.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM sou_publishers WHERE url = $1",
                url
            )
            if row:
                data = parse_json_fields(dict(row), ['coverage', 'metadata'])
                return Publisher(**data)
            return None

    async def find_or_create_publisher_from_url(self, url: str) -> Optional[Publisher]:
        """Extract domain from URL, find or create publisher."""
        parsed = urlparse(url)
        base_url = f"{parsed.scheme}://{parsed.netloc}"

        # Try to find existing publisher
        publisher = await self.find_publisher_by_url(base_url)
        if publisher:
            return publisher

        # Create new publisher with minimal info
        publisher_data = PublisherCreate(
            name=parsed.netloc,
            url=base_url,
            publisher_type="news",  # Default type
            is_active=True
        )
        return await self.create_publisher(publisher_data)

    async def create_publisher(self, publisher: PublisherCreate) -> Publisher:
        """Create a new publisher."""
        async with db.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                INSERT INTO sou_publishers (name, description, url, feed_url, publisher_type,
                    language, reliability_score, update_frequency, access_method, is_active,
                    coverage, metadata)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING *
                """,
                publisher.name,
                publisher.description,
                str(publisher.url) if publisher.url else None,
                str(publisher.feed_url) if publisher.feed_url else None,
                publisher.publisher_type,
                publisher.language,
                publisher.reliability_score,
                publisher.update_frequency,
                publisher.access_method,
                publisher.is_active,
                json.dumps(publisher.coverage or {}),
                json.dumps(publisher.metadata or {})
            )
            data = parse_json_fields(dict(row), ['coverage', 'metadata'])
            return Publisher(**data)

    # =========================================================================
    # Document operations
    # =========================================================================

    async def find_document_by_url(self, url: str) -> Optional[Document]:
        """Find a document by its URL."""
        async with db.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM sou_documents WHERE url = $1",
                url
            )
            if row:
                data = parse_json_fields(dict(row), ['extracted_data', 'metadata'])
                return Document(**data)
            return None

    async def find_document_by_hash(self, content_hash: str) -> Optional[Document]:
        """Find a document by its content hash."""
        async with db.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM sou_documents WHERE content_hash = $1",
                content_hash
            )
            if row:
                data = parse_json_fields(dict(row), ['extracted_data', 'metadata'])
                return Document(**data)
            return None

    async def create_document(self, document: DocumentCreate) -> Document:
        """Create a new document."""
        # Calculate content hash if raw_content is provided
        content_hash = None
        if document.raw_content:
            content_hash = hashlib.sha256(document.raw_content.encode()).hexdigest()

        async with db.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                INSERT INTO sou_documents (publisher_id, url, title, document_type, language,
                    published_at, raw_content, content_hash, summary, extracted_data, metadata)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *
                """,
                document.publisher_id,
                str(document.url) if document.url else None,
                document.title,
                document.document_type,
                document.language,
                document.published_at,
                document.raw_content,
                content_hash or document.content_hash,
                document.summary,
                json.dumps(document.extracted_data or {}),
                json.dumps(document.metadata or {})
            )
            data = parse_json_fields(dict(row), ['extracted_data', 'metadata'])
            return Document(**data)

    # =========================================================================
    # Research source promotion
    # =========================================================================

    async def promote_research_sources(
        self,
        research_id: UUID,
        threshold: float = 0.6,
    ) -> list[UUID]:
        """
        Promote high-quality research sources to sou_documents.

        Finds resag_sources with relevance_score >= threshold that haven't been
        promoted yet, creates sou_documents for them, and updates the
        promoted_document_id field.

        Args:
            research_id: UUID of the research task
            threshold: Minimum relevance_score to promote (default 0.6)

        Returns:
            List of promoted sou_document IDs
        """
        promoted_ids = []

        async with db.pool.acquire() as conn:
            # Get research sources that meet threshold and haven't been promoted
            rows = await conn.fetch(
                """
                SELECT * FROM resag_sources
                WHERE research_id = $1
                    AND relevance_score >= $2
                    AND promoted_document_id IS NULL
                    AND fetch_status = 'completed'
                """,
                research_id,
                threshold
            )

            for row in rows:
                source = dict(row)

                # Check if document already exists (by URL)
                existing = await self.find_document_by_url(source['url']) if source['url'] else None

                if existing:
                    document_id = existing.id
                else:
                    # Map source_type to document_type
                    doc_type_map = {
                        'wikipedia': 'article',
                        'web': 'article',
                        'pdf': 'pdf',
                        'other': 'other'
                    }
                    doc_type = doc_type_map.get(source['source_type'], 'other')

                    # Create new document
                    doc_data = DocumentCreate(
                        url=source['url'],
                        title=source['title'],
                        document_type=doc_type,
                        raw_content=source['raw_content'],
                        summary=source['source_summary'],
                        metadata={
                            'source': 'research_agent',
                            'research_id': str(research_id),
                            'relevance_score': source['relevance_score'],
                            'reliability_score': source['reliability_score']
                        }
                    )

                    # Try to link to publisher
                    if source['url']:
                        publisher = await self.find_or_create_publisher_from_url(source['url'])
                        if publisher:
                            doc_data.publisher_id = publisher.id

                    new_doc = await self.create_document(doc_data)
                    document_id = new_doc.id

                # Update resag_sources with promoted_document_id
                await conn.execute(
                    """
                    UPDATE resag_sources
                    SET promoted_document_id = $1
                    WHERE id = $2
                    """,
                    document_id,
                    source['id']
                )

                promoted_ids.append(document_id)

        return promoted_ids

    # =========================================================================
    # Draft-document linking
    # =========================================================================

    async def link_draft_to_documents(
        self,
        draft_id: UUID,
        document_ids: list[UUID],
        relevance: str = "primary",
    ) -> None:
        """
        Create propl_draft_documents entries linking a draft to source documents.

        Args:
            draft_id: UUID of the provision draft
            document_ids: List of sou_document UUIDs
            relevance: Relevance level ('primary', 'supporting', 'reference')
        """
        async with db.pool.acquire() as conn:
            for doc_id in document_ids:
                await conn.execute(
                    """
                    INSERT INTO propl_draft_documents (draft_id, document_id, relevance)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (draft_id, document_id) DO NOTHING
                    """,
                    draft_id,
                    doc_id,
                    relevance,
                )

    # =========================================================================
    # Document Processing Pipeline
    # =========================================================================

    async def find_document_by_id(self, document_id: UUID) -> Optional[Document]:
        """Find a document by its ID."""
        async with db.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM sou_documents WHERE id = $1",
                document_id,
            )
            if row:
                data = parse_json_fields(dict(row), ["extracted_data", "metadata"])
                return Document(**data)
            return None

    async def process_pdf_upload(
        self,
        file_bytes: bytes,
        filename: str,
        title: Optional[str] = None,
        publisher_id: Optional[UUID] = None,
    ) -> Document:
        """
        Full pipeline: upload PDF -> parse -> chunk -> embed -> store.

        Synchronous processing for small scale (<1000 docs).
        """
        pdf_parser = get_pdf_parser()
        chunker = TextChunker(chunk_size=512, chunk_overlap=50)
        embedder = EmbeddingGenerator()

        # 1. Parse PDF (uses configured parser: pdfplumber or textract)
        parsed = await pdf_parser.parse_pdf(file_bytes)

        # 2. Create document record
        doc = await self.create_document(
            DocumentCreate(
                publisher_id=publisher_id,
                title=title or filename,
                document_type="pdf",
                raw_content=parsed["text"],
                metadata={
                    "filename": filename,
                    "page_count": parsed.get("page_count", 0),
                    "source": "upload",
                },
            )
        )

        # 3. Update status to processing
        await self._update_document_embedding_status(doc.id, "processing")

        # 4. Chunk the text
        chunks = chunker.chunk_text(parsed["text"], metadata={"document_id": str(doc.id)})

        # 5. Generate embeddings
        texts = [c["content"] for c in chunks]
        embeddings = await embedder.generate_embeddings(texts)

        # 6. Store chunks with embeddings
        await self._store_chunks(doc.id, chunks, embeddings)

        # 7. Update document status
        await self._update_document_embedding_status(doc.id, "completed", len(chunks))

        # Refresh document to get updated fields
        return await self.find_document_by_id(doc.id)

    async def _store_chunks(
        self,
        document_id: UUID,
        chunks: list[dict],
        embeddings: list[list[float]],
    ) -> None:
        """Store document chunks with embeddings."""
        async with db.pool.acquire() as conn:
            for chunk, embedding in zip(chunks, embeddings):
                # Convert embedding list to pgvector string format
                embedding_str = "[" + ",".join(str(x) for x in embedding) + "]"
                await conn.execute(
                    """
                    INSERT INTO sou_document_chunks
                    (document_id, chunk_index, content, content_tokens, embedding, metadata)
                    VALUES ($1, $2, $3, $4, $5::vector, $6)
                    """,
                    document_id,
                    chunk["index"],
                    chunk["content"],
                    chunk["tokens"],
                    embedding_str,
                    json.dumps(chunk.get("metadata", {})),
                )

    async def _update_document_embedding_status(
        self,
        document_id: UUID,
        status: str,
        chunk_count: int = 0,
    ) -> None:
        """Update document embedding status."""
        async with db.pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE sou_documents
                SET embedding_status = $2, chunk_count = $3, updated_at = now()
                WHERE id = $1
                """,
                document_id,
                status,
                chunk_count,
            )

    # =========================================================================
    # Semantic Search
    # =========================================================================

    async def semantic_search(
        self,
        query: str,
        limit: int = 10,
        threshold: float = 0.5,
    ) -> list[dict]:
        """
        Search for semantically similar document chunks.

        Args:
            query: Search query text
            limit: Max number of results
            threshold: Minimum similarity score (0-1)

        Returns:
            List of chunks with similarity scores and document info
        """
        embedder = EmbeddingGenerator()
        query_embedding = await embedder.generate_single(query)
        # Convert to pgvector string format
        query_embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"

        async with db.pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT
                    c.id,
                    c.document_id,
                    c.chunk_index,
                    c.content,
                    c.metadata,
                    d.title as document_title,
                    d.url as document_url,
                    1 - (c.embedding <=> $1::vector) as similarity
                FROM sou_document_chunks c
                JOIN sou_documents d ON d.id = c.document_id
                WHERE 1 - (c.embedding <=> $1::vector) >= $2
                ORDER BY c.embedding <=> $1::vector
                LIMIT $3
                """,
                query_embedding_str,
                threshold,
                limit,
            )

            return [
                {
                    "chunk_id": str(row["id"]),
                    "document_id": str(row["document_id"]),
                    "document_title": row["document_title"],
                    "document_url": row["document_url"],
                    "chunk_index": row["chunk_index"],
                    "content": row["content"],
                    "similarity": float(row["similarity"]),
                    "metadata": json.loads(row["metadata"]) if row["metadata"] else {},
                }
                for row in rows
            ]

    async def get_document_chunks(self, document_id: UUID) -> list[dict]:
        """Get all chunks for a document."""
        async with db.pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT id, chunk_index, content, content_tokens, metadata
                FROM sou_document_chunks
                WHERE document_id = $1
                ORDER BY chunk_index
                """,
                document_id,
            )
            return [dict(row) for row in rows]
