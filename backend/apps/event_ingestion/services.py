"""Event ingestion service - orchestrates the event ingestion pipeline."""

import httpx
from typing import Optional, List
from uuid import UUID
from datetime import datetime

from agents.utils.ei_db_tools import get_ei_db_tools
from apps.sources.services import SourcesService
from apps.sources.models import DocumentCreate


class EventIngestionService:
    """Service for managing event ingestion workflow."""

    def __init__(self):
        self.db_tools = get_ei_db_tools()
        self.sources_service = SourcesService()

    async def fetch_source_content(self, source_id: str) -> dict:
        """
        Fetch content from a source URL.

        Args:
            source_id: UUID of the source

        Returns:
            dict with status and fetched content
        """
        await self.db_tools.connect()

        try:
            source = await self.db_tools.get_source(source_id)
            if not source:
                return {"status": "error", "error": "Source not found"}

            url = source.get('url')
            if not url:
                return {"status": "error", "error": "Source has no URL"}

            # Update status to fetching
            await self.db_tools.update_source(source_id, fetch_status='fetching')

            # Fetch content
            async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
                response = await client.get(url, headers={
                    'User-Agent': 'Mozilla/5.0 (compatible; PintBot/1.0)'
                })
                response.raise_for_status()
                content = response.text

            # Update source with content
            await self.db_tools.update_source(
                source_id,
                raw_content=content,
                fetch_status='fetched',
                fetched_at=datetime.utcnow()
            )

            return {
                "status": "success",
                "source_id": source_id,
                "content_length": len(content)
            }

        except httpx.HTTPError as e:
            await self.db_tools.update_source(
                source_id,
                fetch_status='failed',
                fetch_error=str(e)
            )
            return {"status": "error", "error": f"HTTP error: {e}"}

        except Exception as e:
            await self.db_tools.update_source(
                source_id,
                fetch_status='failed',
                fetch_error=str(e)
            )
            return {"status": "error", "error": str(e)}

    async def process_source(self, source_id: str) -> dict:
        """
        Process a source with AI to extract structured data.

        After processing, promotes the source to sou_documents.

        Args:
            source_id: UUID of the source

        Returns:
            dict with status
        """
        from agents.event_ingestion.agent import process_source
        result = await process_source(source_id)

        # After successful processing, promote to sou_documents
        source = await self.db_tools.get_source(source_id)
        if source and source.get('processing_status') == 'processed':
            await self.promote_source_to_document(source_id)

        return result

    async def promote_source_to_document(self, source_id: str) -> Optional[UUID]:
        """
        Promote an ing_sources record to sou_documents.

        Called after source is processed (ai_summary populated).
        Returns document_id (existing or newly created).
        """
        await self.db_tools.connect()

        source = await self.db_tools.get_source(source_id)
        if not source or source.get('processing_status') != 'processed':
            return None

        # Check if already promoted
        if source.get('promoted_document_id'):
            return UUID(source['promoted_document_id'])

        # Check for existing document by URL
        url = source.get('url')
        if url:
            existing = await self.sources_service.find_document_by_url(url)
            if existing:
                document_id = existing.id
                # Update ing_sources with promoted_document_id
                await self.db_tools.update_source(
                    source_id,
                    promoted_document_id=str(document_id)
                )
                return document_id

        # Find or create publisher from source URL
        publisher = None
        if url:
            publisher = await self.sources_service.find_or_create_publisher_from_url(url)

        # Map source_type to document_type
        doc_type_map = {
            'news': 'article',
            'official_gazette': 'gazette_issue',
            'press_release': 'press_release',
            'council_minutes': 'minutes',
            'social': 'post',
            'manual': 'other'
        }

        # Create document
        doc = await self.sources_service.create_document(DocumentCreate(
            publisher_id=publisher.id if publisher else None,
            url=url,
            title=source.get('title'),
            document_type=doc_type_map.get(source.get('source_type'), 'article'),
            published_at=source.get('published_at'),
            raw_content=source.get('raw_content'),
            summary=source.get('ai_summary'),
            extracted_data=source.get('ai_extracted_data'),
            metadata={
                'source': 'event_ingestion',
                'source_id': source_id,
                'source_name': source.get('source_name')
            }
        ))
        document_id = doc.id

        # Update ing_sources with promoted_document_id
        await self.db_tools.update_source(
            source_id,
            promoted_document_id=str(document_id)
        )

        return document_id

    async def generate_candidate(self, source_ids: List[str]) -> dict:
        """
        Generate an event candidate from processed sources.

        Ensures all sources are promoted to documents first, then
        passes document_ids to the candidate generator.

        Args:
            source_ids: List of source UUIDs

        Returns:
            dict with status and candidate_id
        """
        await self.db_tools.connect()

        # Ensure all sources are promoted to documents
        document_ids = []
        for source_id in source_ids:
            source = await self.db_tools.get_source(source_id)
            if not source:
                continue

            # Promote if not already promoted
            if not source.get('promoted_document_id'):
                doc_id = await self.promote_source_to_document(source_id)
                if doc_id:
                    document_ids.append(str(doc_id))
            else:
                document_ids.append(source['promoted_document_id'])

        if not document_ids:
            return {"status": "error", "error": "No documents to process"}

        # Call agent with document_ids
        from agents.event_ingestion.agent import generate_candidate
        return await generate_candidate(source_ids, document_ids)

    async def link_candidate_to_documents(
        self,
        candidate_id: str,
        document_ids: List[str],
        relevance: str = 'primary'
    ) -> None:
        """Link candidate to sou_documents via ingpl_candidate_documents."""
        await self.db_tools.connect()
        await self.db_tools.link_candidate_documents(candidate_id, document_ids, relevance)

    async def get_source(self, source_id: str) -> Optional[dict]:
        """Get a source by ID."""
        await self.db_tools.connect()
        return await self.db_tools.get_source(source_id)

    async def get_candidate(self, candidate_id: str) -> Optional[dict]:
        """Get a candidate by ID."""
        await self.db_tools.connect()
        return await self.db_tools.get_candidate(candidate_id)


# Global instance
_service: Optional[EventIngestionService] = None


def get_event_ingestion_service() -> EventIngestionService:
    """Get or create the event ingestion service instance."""
    global _service
    if _service is None:
        _service = EventIngestionService()
    return _service
