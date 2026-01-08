"""Event ingestion service - orchestrates the event ingestion pipeline."""

import httpx
from typing import Optional
from agents.utils.ei_db_tools import get_ei_db_tools


class EventIngestionService:
    """Service for managing event ingestion workflow."""

    def __init__(self):
        self.db_tools = get_ei_db_tools()

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
            from datetime import datetime
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

        finally:
            await self.db_tools.close()

    async def process_source(self, source_id: str) -> dict:
        """
        Process a source with AI to extract structured data.

        Args:
            source_id: UUID of the source

        Returns:
            dict with status
        """
        from agents.event_ingestion.agent import process_source
        return await process_source(source_id)

    async def generate_candidate(self, source_ids: list[str]) -> dict:
        """
        Generate an event candidate from processed sources.

        Args:
            source_ids: List of source UUIDs

        Returns:
            dict with status and candidate_id
        """
        from agents.event_ingestion.agent import generate_candidate
        return await generate_candidate(source_ids)

    async def get_source(self, source_id: str) -> Optional[dict]:
        """Get a source by ID."""
        await self.db_tools.connect()
        try:
            return await self.db_tools.get_source(source_id)
        finally:
            await self.db_tools.close()

    async def get_candidate(self, candidate_id: str) -> Optional[dict]:
        """Get a candidate by ID."""
        await self.db_tools.connect()
        try:
            return await self.db_tools.get_candidate(candidate_id)
        finally:
            await self.db_tools.close()


# Global instance
_service: Optional[EventIngestionService] = None


def get_event_ingestion_service() -> EventIngestionService:
    """Get or create the event ingestion service instance."""
    global _service
    if _service is None:
        _service = EventIngestionService()
    return _service
