"""Business logic for the sources app."""

import hashlib
from typing import Optional, List
from urllib.parse import urlparse
from uuid import UUID

from core.db import db
from apps.sources.models import Document, DocumentCreate, Publisher, PublisherCreate


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
                return Publisher(**dict(row))
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
                publisher.coverage or {},
                publisher.metadata or {}
            )
            return Publisher(**dict(row))

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
                return Document(**dict(row))
            return None

    async def find_document_by_hash(self, content_hash: str) -> Optional[Document]:
        """Find a document by its content hash."""
        async with db.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM sou_documents WHERE content_hash = $1",
                content_hash
            )
            if row:
                return Document(**dict(row))
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
                document.extracted_data or {},
                document.metadata or {}
            )
            return Document(**dict(row))

    # =========================================================================
    # Research source promotion
    # =========================================================================

    async def promote_research_sources(
        self,
        research_id: UUID,
        threshold: float = 0.6
    ) -> List[UUID]:
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
        document_ids: List[UUID],
        relevance: str = "primary"
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
                    relevance
                )
