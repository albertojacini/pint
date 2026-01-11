"""Database tools for research agent to interact with PostgreSQL."""

import os
import json
from typing import Optional, List, Dict, Any
from datetime import datetime
import asyncpg
from agents.utils.task_context import get_current_task_id


def sanitize_text(text: Optional[str]) -> Optional[str]:
    """Remove null bytes from text to make it PostgreSQL-compatible."""
    if text is None:
        return None
    return text.replace('\x00', '')


class DatabaseTools:
    """Provides database operations for the research agent."""

    def __init__(self):
        """Initialize database connection pool."""
        self.db_url = os.getenv('DATABASE_URL')
        if not self.db_url:
            raise ValueError("DATABASE_URL environment variable is required")
        self.pool: Optional[asyncpg.Pool] = None

    async def connect(self):
        """Create connection pool."""
        if not self.pool:
            self.pool = await asyncpg.create_pool(self.db_url)

    async def close(self):
        """Close connection pool."""
        if self.pool:
            await self.pool.close()
            self.pool = None

    async def create_research_task(
        self,
        input_text: str
    ) -> str:
        """
        Create a new research in the database.

        Args:
            input_text: The original user question/input

        Returns:
            research_id: UUID of the created research
        """
        if not self.pool:
            await self.connect()

        # Sanitize input text to remove null bytes
        input_text = sanitize_text(input_text)

        async with self.pool.acquire() as conn:
            research_id = await conn.fetchval(
                """
                INSERT INTO resag_researches (input, status, created_at, updated_at)
                VALUES ($1, $2, NOW(), NOW())
                RETURNING id
                """,
                input_text,
                'researching'
            )
            return str(research_id)

    async def save_source(
        self,
        url: str,
        title: str,
        relevance_score: float,
        reliability_score: float,
        evaluation_notes: str,
        researcher_id: str,
        raw_content: Optional[str] = None,
        source_summary: Optional[str] = None,
        source_type: Optional[str] = None,
        content_quality: Optional[str] = None,
        fetch_status: str = 'completed'
    ) -> str:
        """
        Save a web source discovered and evaluated during research.

        Note: research_id is automatically retrieved from context.

        Args:
            url: Source URL
            title: Page title
            relevance_score: How relevant the source is to the input (0.0-1.0)
            reliability_score: How reliable/credible the source is (0.0-1.0)
            evaluation_notes: Agent's notes explaining the evaluation
            researcher_id: Identifier of the evaluator (e.g., "EVALUATOR-1")
            raw_content: Full scraped content (optional, set by tool layer)
            source_summary: LLM-generated summary of the content
            source_type: Type of source ('wikipedia', 'web', 'pdf', 'other')
            content_quality: Quality assessment ('good', 'partial', 'failed')
            fetch_status: Status of content fetch ('pending', 'completed', 'failed')

        Returns:
            source_id: UUID of the saved source
        """
        if not self.pool:
            await self.connect()

        research_id = get_current_task_id()

        # Sanitize text fields to remove null bytes
        raw_content = sanitize_text(raw_content)
        source_summary = sanitize_text(source_summary)
        title = sanitize_text(title)
        evaluation_notes = sanitize_text(evaluation_notes)

        async with self.pool.acquire() as conn:
            source_id = await conn.fetchval(
                """
                INSERT INTO resag_sources (
                    research_id, url, title, researcher_id, raw_content,
                    source_summary, source_type, content_quality,
                    fetch_status, fetched_at, relevance_score, reliability_score, evaluation_notes
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10, $11, $12)
                RETURNING id
                """,
                research_id,
                url,
                title,
                researcher_id,
                raw_content,
                source_summary,
                source_type,
                content_quality,
                fetch_status,
                relevance_score,
                reliability_score,
                evaluation_notes
            )
            return str(source_id)

    async def load_research_data(self) -> Dict[str, Any]:
        """
        Load all sources for a research.

        Note: research_id is automatically retrieved from context.

        Returns:
            Dictionary containing sources with source_summary (preferred) or raw_content
        """
        if not self.pool:
            await self.connect()

        research_id = get_current_task_id()

        async with self.pool.acquire() as conn:
            # Get all successfully fetched sources with good/partial quality
            sources = await conn.fetch(
                """
                SELECT id, url, title, researcher_id, raw_content, source_summary,
                       source_type, content_quality, relevance_score, reliability_score,
                       evaluation_notes, fetched_at
                FROM resag_sources
                WHERE research_id = $1
                  AND fetch_status = 'completed'
                  AND (content_quality IS NULL OR content_quality != 'failed')
                ORDER BY relevance_score DESC NULLS LAST, fetched_at ASC
                """,
                research_id
            )

            return {
                "sources": [dict(row) for row in sources]
            }

    async def get_research_context(self) -> Optional[str]:
        """
        Get the research input/query for the current task.

        Note: research_id is automatically retrieved from context.

        Returns:
            The research input text, or None if not found
        """
        if not self.pool:
            await self.connect()

        research_id = get_current_task_id()

        async with self.pool.acquire() as conn:
            result = await conn.fetchval(
                "SELECT input FROM resag_researches WHERE id = $1",
                research_id
            )
            return result

    async def save_summary(
        self,
        content: str,
        summary_type: str = 'final',
        parent_summary_id: Optional[str] = None,
        order: int = 0
    ) -> str:
        """
        Save a research summary to the database.

        Note: research_id is automatically retrieved from context.

        Args:
            content: Markdown summary content
            summary_type: Ignored (kept for backward compatibility)
            parent_summary_id: Ignored (kept for backward compatibility)
            order: Ignored (kept for backward compatibility)

        Returns:
            research_id: UUID of the updated research
        """
        if not self.pool:
            await self.connect()

        research_id = get_current_task_id()

        # Sanitize content to remove null bytes
        content = sanitize_text(content)

        async with self.pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE resag_researches
                SET summary = $1, updated_at = NOW()
                WHERE id = $2
                """,
                content,
                research_id
            )
            return research_id

    async def update_task_status(self, research_id: str, status: str):
        """
        Update the status of a research.

        Args:
            research_id: UUID of the research
            status: New status ('pending', 'researching', 'completed', 'failed')
        """
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE resag_researches
                SET status = $1, updated_at = NOW()
                WHERE id = $2
                """,
                status,
                research_id
            )

    async def get_task(self, research_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a research by ID.

        Args:
            research_id: UUID of the research

        Returns:
            Research dict or None if not found
        """
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT id, input, summary, status, created_at, updated_at
                FROM resag_researches
                WHERE id = $1
                """,
                research_id
            )
            if row:
                return dict(row)
            return None

    async def get_task_results(self, research_id: str) -> Optional[Dict[str, Any]]:
        """
        Get full research results including sources and summary.

        Args:
            research_id: UUID of the research

        Returns:
            Dict with research info, sources, summary, and counts
        """
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as conn:
            # Get research with summary
            research = await conn.fetchrow(
                """
                SELECT id, input, summary, status, created_at, updated_at
                FROM resag_researches
                WHERE id = $1
                """,
                research_id
            )
            if not research:
                return None

            # Get sources count
            sources_count = await conn.fetchval(
                "SELECT COUNT(*) FROM resag_sources WHERE research_id = $1 AND fetch_status = 'completed'",
                research_id
            )

            return {
                "research_id": str(research["id"]),
                "input": research["input"],
                "status": research["status"],
                "sources_count": sources_count,
                "summary": research["summary"],
                "created_at": research["created_at"].isoformat() if research["created_at"] else None,
                "updated_at": research["updated_at"].isoformat() if research["updated_at"] else None,
            }


# Global instance (lazy initialization)
_db_tools = None

def get_db_tools() -> DatabaseTools:
    """Get or create the global database tools instance."""
    global _db_tools
    if _db_tools is None:
        _db_tools = DatabaseTools()
    return _db_tools

# For backward compatibility
db_tools = None
