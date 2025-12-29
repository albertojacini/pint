"""Database tools for research agent to interact with PostgreSQL."""

import os
import json
from typing import Optional, List, Dict, Any
from datetime import datetime
import asyncpg
from agents.utils.task_context import get_current_task_id


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
        url: str,
        title: str,
        content: str,
        researcher_id: str
    ) -> str:
        """
        Save a web source discovered during research.

        Note: task_id is automatically retrieved from context.

        Args:
            url: Source URL from WebSearch
            title: Page title
            content: Relevant excerpt from the source
            researcher_id: Identifier of the researcher (e.g., "RESEARCHER-1")

        Returns:
            source_id: UUID of the saved source
        """
        if not self.pool:
            await self.connect()

        task_id = get_current_task_id()

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
        source_id: str,
        content: str,
        confidence: float = 0.8,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Save a research finding extracted from a source.

        Note: task_id is automatically retrieved from context.

        Args:
            source_id: UUID of the source this finding came from
            content: The finding/fact/claim
            confidence: Confidence score (0.0-1.0)
            metadata: Extra structured data

        Returns:
            finding_id: UUID of the saved finding
        """
        if not self.pool:
            await self.connect()

        task_id = get_current_task_id()

        async with self.pool.acquire() as conn:
            finding_id = await conn.fetchval(
                """
                INSERT INTO ra_findings (task_id, source_id, content, confidence, metadata, created_at)
                VALUES ($1, $2, $3, $4, $5, NOW())
                RETURNING id
                """,
                task_id,
                source_id,
                content,
                confidence,
                json.dumps(metadata) if metadata else None
            )
            return str(finding_id)

    async def load_research_data(self) -> Dict[str, Any]:
        """
        Load all sources and findings for a research task.

        Note: task_id is automatically retrieved from context.

        Returns:
            Dictionary containing sources and findings
        """
        if not self.pool:
            await self.connect()

        task_id = get_current_task_id()

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
                SELECT f.id, f.source_id, f.content, f.confidence, f.metadata, s.url as source_url
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
        content: str,
        summary_type: str = 'final',
        finding_ids: Optional[List[str]] = None,
        parent_summary_id: Optional[str] = None,
        order: int = 0
    ) -> str:
        """
        Save a research summary to the database.

        Note: task_id is automatically retrieved from context.

        Args:
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

        task_id = get_current_task_id()

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

    async def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a research task by ID.

        Args:
            task_id: UUID of the research task

        Returns:
            Task dict or None if not found
        """
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT id, query, entity_id, status, subtopics, metadata, created_at, updated_at
                FROM ra_research_tasks
                WHERE id = $1
                """,
                task_id
            )
            if row:
                return dict(row)
            return None

    async def get_task_results(self, task_id: str) -> Optional[Dict[str, Any]]:
        """
        Get full research results for a task including sources, findings, and summaries.

        Args:
            task_id: UUID of the research task

        Returns:
            Dict with task info, sources, findings, summaries, and counts
        """
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as conn:
            # Get task
            task = await conn.fetchrow(
                """
                SELECT id, query, entity_id, status, subtopics, metadata, created_at, updated_at
                FROM ra_research_tasks
                WHERE id = $1
                """,
                task_id
            )
            if not task:
                return None

            # Get sources count
            sources_count = await conn.fetchval(
                "SELECT COUNT(*) FROM ra_sources WHERE task_id = $1",
                task_id
            )

            # Get findings count
            findings_count = await conn.fetchval(
                "SELECT COUNT(*) FROM ra_findings WHERE task_id = $1",
                task_id
            )

            # Get final summary
            summary = await conn.fetchrow(
                """
                SELECT id, content, summary_type, created_at
                FROM ra_summaries
                WHERE task_id = $1 AND summary_type = 'final'
                ORDER BY created_at DESC
                LIMIT 1
                """,
                task_id
            )

            return {
                "task_id": str(task["id"]),
                "query": task["query"],
                "entity_id": str(task["entity_id"]) if task["entity_id"] else None,
                "status": task["status"],
                "subtopics": json.loads(task["subtopics"]) if task["subtopics"] else [],
                "sources_count": sources_count,
                "findings_count": findings_count,
                "summary": summary["content"] if summary else None,
                "created_at": task["created_at"].isoformat() if task["created_at"] else None,
                "updated_at": task["updated_at"].isoformat() if task["updated_at"] else None,
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
