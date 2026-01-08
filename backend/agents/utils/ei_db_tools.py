"""Database tools for event ingestion agent to interact with ei_* tables."""

import os
import json
from typing import Optional, List, Dict, Any
from datetime import datetime
import asyncpg


def sanitize_text(text: Optional[str]) -> Optional[str]:
    """Remove null bytes from text to make it PostgreSQL-compatible."""
    if text is None:
        return None
    return text.replace('\x00', '')


class EiDatabaseTools:
    """Provides database operations for the event ingestion pipeline."""

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

    # =========================================================================
    # SOURCES
    # =========================================================================

    async def get_source(self, source_id: str) -> Optional[Dict[str, Any]]:
        """Get a source by ID."""
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT id, url, title, source_type, source_name, published_at,
                       raw_content, fetch_status, fetch_error, fetched_at,
                       processing_status, ai_summary, ai_extracted_data,
                       created_by, created_at, updated_at
                FROM ei_sources
                WHERE id = $1
                """,
                source_id
            )
            if row:
                result = dict(row)
                # Parse JSON fields
                if result.get('ai_extracted_data'):
                    result['ai_extracted_data'] = json.loads(result['ai_extracted_data'])
                return result
            return None

    async def update_source(
        self,
        source_id: str,
        **kwargs
    ) -> None:
        """Update a source with arbitrary fields."""
        if not self.pool:
            await self.connect()

        # Build dynamic UPDATE query
        set_clauses = []
        values = []
        param_idx = 1

        for key, value in kwargs.items():
            if value is not None:
                # Handle JSON fields
                if key == 'ai_extracted_data' and isinstance(value, dict):
                    value = json.dumps(value)
                # Sanitize text fields
                if isinstance(value, str):
                    value = sanitize_text(value)
                set_clauses.append(f"{key} = ${param_idx}")
                values.append(value)
                param_idx += 1

        # Add updated_at
        set_clauses.append(f"updated_at = ${param_idx}")
        values.append(datetime.utcnow())
        param_idx += 1

        # Add source_id
        values.append(source_id)

        query = f"""
            UPDATE ei_sources
            SET {', '.join(set_clauses)}
            WHERE id = ${param_idx}
        """

        async with self.pool.acquire() as conn:
            await conn.execute(query, *values)

    async def get_pending_sources(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get sources that need processing."""
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT id, url, title, source_type, source_name, published_at,
                       raw_content, fetch_status, processing_status
                FROM ei_sources
                WHERE processing_status = 'unprocessed'
                  AND fetch_status = 'fetched'
                ORDER BY created_at ASC
                LIMIT $1
                """,
                limit
            )
            return [dict(row) for row in rows]

    # =========================================================================
    # CANDIDATES
    # =========================================================================

    async def create_candidate(
        self,
        title: Optional[str] = None,
        description: Optional[str] = None,
        event_type: Optional[str] = None,
        occurred_at: Optional[datetime] = None,
        detected_entity_id: Optional[str] = None,
        detected_administration_id: Optional[str] = None,
        confidence_score: Optional[float] = None,
        ai_reasoning: Optional[str] = None,
        source_ids: Optional[List[str]] = None
    ) -> str:
        """Create a new event candidate and link sources to it."""
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as conn:
            # Create candidate
            candidate_id = await conn.fetchval(
                """
                INSERT INTO ei_candidates (
                    title, description, event_type, occurred_at,
                    detected_entity_id, detected_administration_id,
                    confidence_score, ai_reasoning, status
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
                RETURNING id
                """,
                sanitize_text(title),
                sanitize_text(description),
                event_type,
                occurred_at,
                detected_entity_id,
                detected_administration_id,
                str(confidence_score) if confidence_score is not None else None,
                sanitize_text(ai_reasoning)
            )

            # Link sources
            if source_ids:
                for source_id in source_ids:
                    await conn.execute(
                        """
                        INSERT INTO ei_candidate_sources (candidate_id, source_id, relevance)
                        VALUES ($1, $2, 'primary')
                        ON CONFLICT (candidate_id, source_id) DO NOTHING
                        """,
                        candidate_id,
                        source_id
                    )

            return str(candidate_id)

    async def get_candidate(self, candidate_id: str) -> Optional[Dict[str, Any]]:
        """Get a candidate by ID with its sources."""
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT c.*, pe.name as detected_entity_name
                FROM ei_candidates c
                LEFT JOIN political_entities pe ON c.detected_entity_id = pe.id
                WHERE c.id = $1
                """,
                candidate_id
            )
            if not row:
                return None

            result = dict(row)

            # Get linked sources
            sources = await conn.fetch(
                """
                SELECT s.id, s.url, s.title, s.source_type, s.source_name,
                       s.ai_summary, cs.relevance
                FROM ei_sources s
                JOIN ei_candidate_sources cs ON s.id = cs.source_id
                WHERE cs.candidate_id = $1
                """,
                candidate_id
            )
            result['sources'] = [dict(s) for s in sources]

            # Get candidate changes
            changes = await conn.fetch(
                """
                SELECT * FROM ei_candidate_changes
                WHERE candidate_id = $1
                """,
                candidate_id
            )
            result['changes'] = [dict(c) for c in changes]

            return result

    async def update_candidate(self, candidate_id: str, **kwargs) -> None:
        """Update a candidate with arbitrary fields."""
        if not self.pool:
            await self.connect()

        # Build dynamic UPDATE query
        set_clauses = []
        values = []
        param_idx = 1

        for key, value in kwargs.items():
            if isinstance(value, str):
                value = sanitize_text(value)
            set_clauses.append(f"{key} = ${param_idx}")
            values.append(value)
            param_idx += 1

        # Add updated_at
        set_clauses.append(f"updated_at = ${param_idx}")
        values.append(datetime.utcnow())
        param_idx += 1

        # Add candidate_id
        values.append(candidate_id)

        query = f"""
            UPDATE ei_candidates
            SET {', '.join(set_clauses)}
            WHERE id = ${param_idx}
        """

        async with self.pool.acquire() as conn:
            await conn.execute(query, *values)

    # =========================================================================
    # CANDIDATE CHANGES
    # =========================================================================

    async def create_candidate_change(
        self,
        candidate_id: str,
        target_type: str,
        action: str,
        proposed_data: Dict[str, Any],
        target_id: Optional[str] = None,
        description: Optional[str] = None,
        effective_at: Optional[datetime] = None
    ) -> str:
        """Create a proposed change for a candidate."""
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as conn:
            change_id = await conn.fetchval(
                """
                INSERT INTO ei_candidate_changes (
                    candidate_id, target_type, target_id, action,
                    proposed_data, description, effective_at, status
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
                RETURNING id
                """,
                candidate_id,
                target_type,
                target_id,
                action,
                json.dumps(proposed_data),
                sanitize_text(description),
                effective_at
            )
            return str(change_id)

    # =========================================================================
    # LOOKUPS (for AI to find targets)
    # =========================================================================

    async def search_provisions(
        self,
        entity_id: Optional[str] = None,
        search_term: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Search provisions by entity and/or text."""
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as conn:
            if search_term and entity_id:
                rows = await conn.fetch(
                    """
                    SELECT id, title, description_short, entity_id
                    FROM provisions
                    WHERE entity_id = $1
                      AND (title ILIKE $2 OR description ILIKE $2)
                    LIMIT $3
                    """,
                    entity_id,
                    f"%{search_term}%",
                    limit
                )
            elif entity_id:
                rows = await conn.fetch(
                    """
                    SELECT id, title, description_short, entity_id
                    FROM provisions
                    WHERE entity_id = $1
                    LIMIT $2
                    """,
                    entity_id,
                    limit
                )
            elif search_term:
                rows = await conn.fetch(
                    """
                    SELECT id, title, description_short, entity_id
                    FROM provisions
                    WHERE title ILIKE $1 OR description ILIKE $1
                    LIMIT $2
                    """,
                    f"%{search_term}%",
                    limit
                )
            else:
                rows = await conn.fetch(
                    "SELECT id, title, description_short, entity_id FROM provisions LIMIT $1",
                    limit
                )

            return [dict(row) for row in rows]

    async def search_entities(
        self,
        search_term: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Search political entities by name."""
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as conn:
            if search_term:
                rows = await conn.fetch(
                    """
                    SELECT id, name, type, slug
                    FROM political_entities
                    WHERE name ILIKE $1 OR native_name ILIKE $1
                    LIMIT $2
                    """,
                    f"%{search_term}%",
                    limit
                )
            else:
                rows = await conn.fetch(
                    "SELECT id, name, type, slug FROM political_entities LIMIT $1",
                    limit
                )

            return [dict(row) for row in rows]

    async def get_entity_provisions(self, entity_id: str) -> List[Dict[str, Any]]:
        """Get all provisions for an entity."""
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT id, title, description_short, slug
                FROM provisions
                WHERE entity_id = $1
                ORDER BY title
                """,
                entity_id
            )
            return [dict(row) for row in rows]


# Global instance (lazy initialization)
_ei_db_tools = None


def get_ei_db_tools() -> EiDatabaseTools:
    """Get or create the global event ingestion database tools instance."""
    global _ei_db_tools
    if _ei_db_tools is None:
        _ei_db_tools = EiDatabaseTools()
    return _ei_db_tools
