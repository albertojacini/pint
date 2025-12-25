"""Database tools for research agent to interact with PostgreSQL."""

import os
import json
from typing import Optional, List, Dict, Any
from datetime import datetime
import asyncpg


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
        query: str,
        subtopics: List[str],
        entity_id: Optional[str] = None
    ) -> str:
        """
        Create a new research task in the database.

        Args:
            query: The original user question
            subtopics: List of research angles/subtopics
            entity_id: Optional UUID of the entity being researched (set by API)

        Returns:
            task_id: UUID of the created task
        """
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as conn:
            task_id = await conn.fetchval(
                """
                INSERT INTO ra_research_tasks (query, entity_id, status, subtopics, created_at, updated_at)
                VALUES ($1, $2, $3, $4, NOW(), NOW())
                RETURNING id
                """,
                query,
                entity_id,
                'researching',
                json.dumps(subtopics)
            )
            return str(task_id)

    async def save_source(
        self,
        task_id: str,
        url: str,
        title: str,
        content: str,
        researcher_id: str
    ) -> str:
        """
        Save a web source discovered during research.

        Args:
            task_id: UUID of the research task
            url: Source URL from WebSearch
            title: Page title
            content: Relevant excerpt from the source
            researcher_id: Identifier of the researcher (e.g., "RESEARCHER-1")

        Returns:
            source_id: UUID of the saved source
        """
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as conn:
            source_id = await conn.fetchval(
                """
                INSERT INTO ra_sources (task_id, url, title, content, researcher_id, fetched_at)
                VALUES ($1, $2, $3, $4, $5, NOW())
                RETURNING id
                """,
                task_id,
                url,
                title,
                content,
                researcher_id
            )
            return str(source_id)

    async def save_finding(
        self,
        task_id: str,
        source_id: str,
        content: str,
        finding_type: str = 'general',
        confidence: float = 0.8,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Save a research finding extracted from a source.

        Args:
            task_id: UUID of the research task
            source_id: UUID of the source this finding came from
            content: The finding/fact/claim
            finding_type: Type of finding ('statistic', 'policy', 'event', 'general')
            confidence: Confidence score (0.0-1.0)
            metadata: Extra structured data

        Returns:
            finding_id: UUID of the saved finding
        """
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as conn:
            finding_id = await conn.fetchval(
                """
                INSERT INTO ra_findings (task_id, source_id, content, finding_type, confidence, metadata, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW())
                RETURNING id
                """,
                task_id,
                source_id,
                content,
                finding_type,
                confidence,
                json.dumps(metadata) if metadata else None
            )
            return str(finding_id)

    async def load_research_data(self, task_id: str) -> Dict[str, Any]:
        """
        Load all sources and findings for a research task.

        Args:
            task_id: UUID of the research task

        Returns:
            Dictionary containing sources and findings
        """
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as conn:
            # Get all sources
            sources = await conn.fetch(
                """
                SELECT id, url, title, content, researcher_id, fetched_at
                FROM ra_sources
                WHERE task_id = $1
                ORDER BY fetched_at ASC
                """,
                task_id
            )

            # Get all findings
            findings = await conn.fetch(
                """
                SELECT f.id, f.source_id, f.content, f.finding_type, f.confidence, f.metadata, s.url as source_url
                FROM ra_findings f
                JOIN ra_sources s ON s.id = f.source_id
                WHERE f.task_id = $1
                ORDER BY f.created_at ASC
                """,
                task_id
            )

            return {
                "sources": [dict(row) for row in sources],
                "findings": [dict(row) for row in findings]
            }

    async def save_summary(
        self,
        task_id: str,
        content: str,
        summary_type: str = 'final',
        finding_ids: Optional[List[str]] = None,
        parent_summary_id: Optional[str] = None,
        order: int = 0
    ) -> str:
        """
        Save a research summary to the database.

        Args:
            task_id: UUID of the research task
            content: Markdown summary content
            summary_type: Type of summary ('overview', 'section', 'final')
            finding_ids: List of finding UUIDs to link
            parent_summary_id: UUID of parent summary (for hierarchical summaries)
            order: Display order

        Returns:
            summary_id: UUID of the saved summary
        """
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as conn:
            # Insert summary
            summary_id = await conn.fetchval(
                """
                INSERT INTO ra_summaries (task_id, summary_type, content, parent_summary_id, "order", created_at)
                VALUES ($1, $2, $3, $4, $5, NOW())
                RETURNING id
                """,
                task_id,
                summary_type,
                content,
                parent_summary_id,
                order
            )

            # Link findings if provided
            if finding_ids:
                for finding_id in finding_ids:
                    await conn.execute(
                        """
                        INSERT INTO ra_summary_findings (summary_id, finding_id)
                        VALUES ($1, $2)
                        """,
                        summary_id,
                        finding_id
                    )

            return str(summary_id)

    async def update_task_status(self, task_id: str, status: str):
        """
        Update the status of a research task.

        Args:
            task_id: UUID of the research task
            status: New status ('pending', 'researching', 'completed', 'failed')
        """
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE ra_research_tasks
                SET status = $1, updated_at = NOW()
                WHERE id = $2
                """,
                status,
                task_id
            )


# Global instance
db_tools = DatabaseTools()
