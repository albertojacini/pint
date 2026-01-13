"""Business logic for the sources app."""

import hashlib
import json
import re
from typing import Optional
from uuid import UUID

from anthropic import AsyncAnthropic

from core.config import settings
from core.db import db
from apps.sources.models import Document, DocumentCreate, Publisher, PublisherCreate
from apps.sources.document_processor import (
    get_pdf_parser,
    TextChunker,
    EmbeddingGenerator,
)


# Unknown publisher UUID (per SPEC.md)
UNKNOWN_PUBLISHER_ID = UUID("00000000-0000-0000-0000-000000000000")


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

    async def get_publisher_by_id(self, publisher_id: UUID) -> Optional[Publisher]:
        """Get a publisher by ID."""
        async with db.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM sou_publishers WHERE id = $1",
                publisher_id
            )
            if row:
                data = parse_json_fields(dict(row), ['metadata'])
                return Publisher(**data)
            return None

    async def find_publisher_by_url(self, url: str) -> Optional[Publisher]:
        """Find a publisher by its base URL."""
        async with db.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM sou_publishers WHERE url = $1",
                url
            )
            if row:
                data = parse_json_fields(dict(row), ['metadata'])
                return Publisher(**data)
            return None

    async def list_publishers(self) -> list[dict]:
        """List all publishers with document counts."""
        async with db.pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT
                    p.id,
                    p.name,
                    p.publisher_type,
                    p.reliability_tier,
                    p.reliability_score,
                    COUNT(d.id) as document_count
                FROM sou_publishers p
                LEFT JOIN sou_documents d ON d.publisher_id = p.id
                WHERE p.is_active = true
                GROUP BY p.id, p.name, p.publisher_type, p.reliability_tier, p.reliability_score
                ORDER BY p.name
                """
            )
            return [
                {
                    "id": str(row["id"]),
                    "name": row["name"],
                    "publisher_type": row["publisher_type"],
                    "reliability_tier": row["reliability_tier"],
                    "reliability_score": float(row["reliability_score"]) if row["reliability_score"] else 0.5,
                    "document_count": row["document_count"],
                }
                for row in rows
            ]

    async def get_unknown_publisher_id(self) -> UUID:
        """Get the unknown publisher UUID."""
        return UNKNOWN_PUBLISHER_ID

    async def create_publisher(self, publisher: PublisherCreate) -> Publisher:
        """Create a new publisher."""
        async with db.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                INSERT INTO sou_publishers (
                    name, description, url, publisher_type, reliability_tier,
                    reliability_score, is_active, metadata
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
                """,
                publisher.name,
                publisher.description,
                str(publisher.url) if publisher.url else None,
                publisher.publisher_type,
                publisher.reliability_tier,
                publisher.reliability_score,
                publisher.is_active,
                json.dumps(publisher.metadata or {}),
            )
            data = parse_json_fields(dict(row), ['metadata'])
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
                data = parse_json_fields(dict(row), ['metadata'])
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
                data = parse_json_fields(dict(row), ['metadata'])
                return Document(**data)
            return None

    async def find_document_by_id(self, document_id: UUID) -> Optional[Document]:
        """Find a document by its ID."""
        async with db.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM sou_documents WHERE id = $1",
                document_id,
            )
            if row:
                data = parse_json_fields(dict(row), ["metadata"])
                return Document(**data)
            return None

    async def get_document_with_publisher(self, document_id: UUID) -> Optional[dict]:
        """Get document with publisher info for API response."""
        async with db.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT
                    d.id, d.title, d.document_category, d.administrative_level,
                    d.fiscal_year, d.embedding_status, d.chunk_count, d.created_at,
                    p.id as publisher_id, p.name as publisher_name,
                    p.reliability_tier, p.reliability_score
                FROM sou_documents d
                LEFT JOIN sou_publishers p ON p.id = d.publisher_id
                WHERE d.id = $1
                """,
                document_id,
            )
            if not row:
                return None
            return {
                "id": str(row["id"]),
                "title": row["title"],
                "publisher": {
                    "id": str(row["publisher_id"]) if row["publisher_id"] else None,
                    "name": row["publisher_name"],
                    "reliability_tier": row["reliability_tier"],
                    "reliability_score": float(row["reliability_score"]) if row["reliability_score"] else None,
                } if row["publisher_id"] else None,
                "document_category": row["document_category"],
                "administrative_level": row["administrative_level"],
                "fiscal_year": row["fiscal_year"],
                "embedding_status": row["embedding_status"],
                "chunk_count": row["chunk_count"],
                "created_at": row["created_at"],
            }

    async def create_document(self, document: DocumentCreate) -> Document:
        """Create a new document."""
        content_hash = None
        if document.raw_content:
            content_hash = hashlib.sha256(document.raw_content.encode()).hexdigest()

        async with db.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                INSERT INTO sou_documents (
                    publisher_id, url, title, document_type, document_category,
                    administrative_level, fiscal_year, classification_method,
                    language, published_at, raw_content, content_hash, summary, metadata
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING *
                """,
                document.publisher_id,
                str(document.url) if document.url else None,
                document.title,
                document.document_type,
                document.document_category,
                document.administrative_level,
                document.fiscal_year,
                document.classification_method,
                document.language,
                document.published_at,
                document.raw_content,
                content_hash or document.content_hash,
                document.summary,
                json.dumps(document.metadata or {}),
            )
            data = parse_json_fields(dict(row), ['metadata'])
            return Document(**data)

    # =========================================================================
    # Document Classification (LLM-assisted)
    # =========================================================================

    async def classify_document(self, text: str, title: str) -> dict:
        """
        LLM-assisted document classification.

        Uses Claude Haiku to classify document category, administrative level,
        and extract fiscal year if applicable.
        """
        # Use first 2000 characters for classification
        text_sample = text[:2000] if len(text) > 2000 else text

        prompt = f"""Analyze this Italian public policy document and classify it.

Title: {title}

Text excerpt:
{text_sample}

Respond with ONLY a JSON object (no other text) with these fields:
- document_category: one of "budget", "regulation", "contract", "report", "minutes", "announcement", "other"
- administrative_level: one of "municipal", "regional", "national", "eu", "other" (based on the issuing authority)
- fiscal_year: integer year if this is a budget document, otherwise null

Example response:
{{"document_category": "budget", "administrative_level": "municipal", "fiscal_year": 2024}}
"""

        client = AsyncAnthropic(api_key=settings.anthropic_api_key)
        response = await client.messages.create(
            model="claude-3-5-haiku-latest",
            max_tokens=256,
            messages=[{"role": "user", "content": prompt}],
        )

        # Parse the JSON response
        response_text = response.content[0].text.strip()
        # Extract JSON from potential markdown code blocks
        if "```" in response_text:
            match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", response_text, re.DOTALL)
            if match:
                response_text = match.group(1)

        try:
            result = json.loads(response_text)
            return {
                "document_category": result.get("document_category", "other"),
                "administrative_level": result.get("administrative_level"),
                "fiscal_year": result.get("fiscal_year"),
            }
        except json.JSONDecodeError:
            # Fallback if parsing fails
            return {
                "document_category": "other",
                "administrative_level": None,
                "fiscal_year": None,
            }

    # =========================================================================
    # Document Processing Pipeline
    # =========================================================================

    async def process_pdf_upload(
        self,
        file_bytes: bytes,
        filename: str,
        title: Optional[str] = None,
        publisher_id: Optional[UUID] = None,
        document_category: Optional[str] = None,
        administrative_level: Optional[str] = None,
        fiscal_year: Optional[int] = None,
    ) -> Document:
        """
        Full pipeline: upload PDF -> parse -> classify -> chunk -> embed -> store.
        """
        pdf_parser = get_pdf_parser()
        chunker = TextChunker(chunk_size=512, chunk_overlap=50)
        embedder = EmbeddingGenerator()

        # 1. Use unknown publisher if none provided
        if publisher_id is None:
            publisher_id = await self.get_unknown_publisher_id()

        # 2. Parse PDF
        parsed = await pdf_parser.parse_pdf(file_bytes)
        doc_title = title or filename

        # 3. Classify document if enabled and no overrides provided
        classification = {}
        if settings.sources_app__classify_on_upload:
            if document_category is None or administrative_level is None:
                classification = await self.classify_document(parsed["text"], doc_title)

        # Use overrides or classification results
        final_category = document_category or classification.get("document_category")
        final_level = administrative_level or classification.get("administrative_level")
        final_year = fiscal_year or classification.get("fiscal_year")
        classification_method = "llm" if classification else ("manual" if document_category else None)

        # 4. Create document record
        doc = await self.create_document(
            DocumentCreate(
                publisher_id=publisher_id,
                title=doc_title,
                document_type="pdf",
                document_category=final_category,
                administrative_level=final_level,
                fiscal_year=final_year,
                classification_method=classification_method,
                raw_content=parsed["text"],
                metadata={
                    "filename": filename,
                    "page_count": parsed.get("page_count", 0),
                    "source": "upload",
                },
            )
        )

        # 5. Update status to processing
        await self._update_document_embedding_status(doc.id, "processing")

        # 6. Chunk the text
        chunks = chunker.chunk_text(parsed["text"], metadata={"document_id": str(doc.id)})

        # 7. Generate embeddings
        texts = [c["content"] for c in chunks]
        embeddings = await embedder.generate_embeddings(texts)

        # 8. Store chunks with embeddings
        await self._store_chunks(doc.id, chunks, embeddings)

        # 9. Update document status
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
        filters: Optional[dict] = None,
    ) -> list[dict]:
        """
        Search for semantically similar document chunks with optional filters.

        Filters:
        - publisher_id: Filter by publisher UUID
        - document_category: Filter by category
        - administrative_level: Filter by admin level
        - min_reliability: Minimum publisher reliability score
        """
        embedder = EmbeddingGenerator()
        query_embedding = await embedder.generate_single(query)
        query_embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"

        # Build dynamic WHERE clause
        where_clauses = ["1 - (c.embedding <=> $1::vector) >= $2"]
        params = [query_embedding_str, threshold]
        param_idx = 3

        if filters:
            if filters.get("publisher_id"):
                where_clauses.append(f"d.publisher_id = ${param_idx}")
                params.append(UUID(filters["publisher_id"]))
                param_idx += 1

            if filters.get("document_category"):
                where_clauses.append(f"d.document_category = ${param_idx}")
                params.append(filters["document_category"])
                param_idx += 1

            if filters.get("administrative_level"):
                where_clauses.append(f"d.administrative_level = ${param_idx}")
                params.append(filters["administrative_level"])
                param_idx += 1

            if filters.get("min_reliability"):
                where_clauses.append(f"p.reliability_score >= ${param_idx}")
                params.append(filters["min_reliability"])
                param_idx += 1

        where_sql = " AND ".join(where_clauses)
        params.append(limit)

        async with db.pool.acquire() as conn:
            rows = await conn.fetch(
                f"""
                SELECT
                    c.id,
                    c.document_id,
                    c.chunk_index,
                    c.content,
                    c.metadata,
                    d.title as document_title,
                    d.url as document_url,
                    p.name as publisher_name,
                    p.reliability_score,
                    1 - (c.embedding <=> $1::vector) as similarity
                FROM sou_document_chunks c
                JOIN sou_documents d ON d.id = c.document_id
                LEFT JOIN sou_publishers p ON p.id = d.publisher_id
                WHERE {where_sql}
                ORDER BY c.embedding <=> $1::vector
                LIMIT ${param_idx}
                """,
                *params,
            )

            return [
                {
                    "chunk_id": str(row["id"]),
                    "document_id": str(row["document_id"]),
                    "document_title": row["document_title"],
                    "document_url": row["document_url"],
                    "publisher_name": row["publisher_name"],
                    "reliability_score": float(row["reliability_score"]) if row["reliability_score"] else None,
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
