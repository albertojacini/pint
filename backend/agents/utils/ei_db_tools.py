"""Database tools for event ingestion agent to interact with ing_* and ingpl_* tables."""

import os
import json
import asyncio
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
        self._lock = asyncio.Lock()

    async def connect(self):
        """Create connection pool (thread-safe)."""
        if self.pool:
            return
        async with self._lock:
            # Double-check after acquiring lock
            if not self.pool:
                # Limit pool size to avoid exhausting Supabase connection limits
                # Supabase session mode has strict limits (~15-20 connections)
                self.pool = await asyncpg.create_pool(
                    self.db_url,
                    min_size=1,
                    max_size=5,
                )

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
                       promoted_document_id, created_by, created_at, updated_at
                FROM ing_sources
                WHERE id = $1
                """,
                source_id
            )
            if row:
                result = dict(row)
                # Parse JSON fields
                if result.get('ai_extracted_data'):
                    result['ai_extracted_data'] = json.loads(result['ai_extracted_data'])
                # Convert UUID to string
                if result.get('promoted_document_id'):
                    result['promoted_document_id'] = str(result['promoted_document_id'])
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
            UPDATE ing_sources
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
                FROM ing_sources
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
        detected_entity_id: Optional[str] = None,
        detected_administration_id: Optional[str] = None,
        confidence_score: Optional[float] = None,
        ai_reasoning: Optional[str] = None,
        document_ids: Optional[List[str]] = None
    ) -> str:
        """Create a new event candidate and link documents to it."""
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as conn:
            # Create candidate
            # Convert confidence_score to float for database
            conf_score = None
            if confidence_score is not None:
                conf_score = float(confidence_score) if isinstance(confidence_score, (int, float, str)) else None

            candidate_id = await conn.fetchval(
                """
                INSERT INTO ingpl_event_candidates (
                    title, description, event_type,
                    detected_entity_id, detected_administration_id,
                    confidence_score, ai_reasoning, status
                )
                VALUES ($1, $2, $3, $4, $5, $6::numeric, $7, 'pending')
                RETURNING id
                """,
                sanitize_text(title),
                sanitize_text(description),
                event_type,
                detected_entity_id,
                detected_administration_id,
                conf_score,
                sanitize_text(ai_reasoning)
            )

            # Link documents (sou_documents, not raw sources)
            if document_ids:
                for document_id in document_ids:
                    await conn.execute(
                        """
                        INSERT INTO ingpl_candidate_documents (candidate_id, document_id, relevance)
                        VALUES ($1, $2, 'primary')
                        ON CONFLICT (candidate_id, document_id) DO NOTHING
                        """,
                        candidate_id,
                        document_id
                    )

            return str(candidate_id)

    async def link_candidate_documents(
        self,
        candidate_id: str,
        document_ids: List[str],
        relevance: str = 'primary'
    ) -> None:
        """Link a candidate to sou_documents via ingpl_candidate_documents."""
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as conn:
            for document_id in document_ids:
                await conn.execute(
                    """
                    INSERT INTO ingpl_candidate_documents (candidate_id, document_id, relevance)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (candidate_id, document_id) DO NOTHING
                    """,
                    candidate_id,
                    document_id,
                    relevance
                )

    async def get_candidate(self, candidate_id: str) -> Optional[Dict[str, Any]]:
        """Get a candidate by ID with its documents."""
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT c.*, pe.name as detected_entity_name
                FROM ingpl_event_candidates c
                LEFT JOIN gov_entities pe ON c.detected_entity_id = pe.id
                WHERE c.id = $1
                """,
                candidate_id
            )
            if not row:
                return None

            result = dict(row)

            # Get linked documents (from sou_documents via ingpl_candidate_documents)
            documents = await conn.fetch(
                """
                SELECT d.id, d.url, d.title, d.document_type, d.summary,
                       cd.relevance
                FROM sou_documents d
                JOIN ingpl_candidate_documents cd ON d.id = cd.document_id
                WHERE cd.candidate_id = $1
                """,
                candidate_id
            )
            result['documents'] = [dict(d) for d in documents]

            # Get candidate changes
            changes = await conn.fetch(
                """
                SELECT * FROM ingpl_change_candidates
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
            UPDATE ingpl_event_candidates
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
        description: Optional[str] = None
    ) -> str:
        """Create a proposed change for a candidate."""
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as conn:
            change_id = await conn.fetchval(
                """
                INSERT INTO ingpl_change_candidates (
                    candidate_id, target_type, target_id, action,
                    proposed_data, description, status
                )
                VALUES ($1, $2, $3, $4, $5, $6, 'pending')
                RETURNING id
                """,
                candidate_id,
                target_type,
                target_id,
                action,
                json.dumps(proposed_data),
                sanitize_text(description)
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
                    SELECT id, title, tagline, entity_id
                    FROM gov_provisions
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
                    SELECT id, title, tagline, entity_id
                    FROM gov_provisions
                    WHERE entity_id = $1
                    LIMIT $2
                    """,
                    entity_id,
                    limit
                )
            elif search_term:
                rows = await conn.fetch(
                    """
                    SELECT id, title, tagline, entity_id
                    FROM gov_provisions
                    WHERE title ILIKE $1 OR description ILIKE $1
                    LIMIT $2
                    """,
                    f"%{search_term}%",
                    limit
                )
            else:
                rows = await conn.fetch(
                    "SELECT id, title, tagline, entity_id FROM gov_provisions LIMIT $1",
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
                    FROM gov_entities
                    WHERE name ILIKE $1 OR native_name ILIKE $1
                    LIMIT $2
                    """,
                    f"%{search_term}%",
                    limit
                )
            else:
                rows = await conn.fetch(
                    "SELECT id, name, type, slug FROM gov_entities LIMIT $1",
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
                SELECT id, title, tagline, slug
                FROM gov_provisions
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
