"""Storage node - database operations for provisions."""

import psycopg2
from psycopg2.extras import RealDictCursor, Json

from provision_generator_agent.config import DATABASE_URL
from provision_generator_agent.models import CandidateProvision


def get_connection():
    """Get database connection."""
    return psycopg2.connect(DATABASE_URL)


def get_entity_id(entity_name: str) -> str | None:
    """Get entity ID by name."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id FROM political_entities WHERE name = %s",
                (entity_name,),
            )
            row = cur.fetchone()
            return str(row[0]) if row else None


def get_existing_provisions(entity_id: str) -> list[dict]:
    """Get all existing provisions for an entity."""
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id, title, type, description, status, effective_from, effective_until
                FROM provisions
                WHERE entity_id = %s
                ORDER BY title
                """,
                (entity_id,),
            )
            return [dict(row) for row in cur.fetchall()]


def store(candidate: CandidateProvision, entity_id: str) -> str:
    """
    Store a provision in the database.

    Args:
        candidate: The candidate provision to store
        entity_id: UUID of the political entity

    Returns:
        UUID of the created provision
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO provisions (entity_id, title, description, type, status, effective_from, extra_data)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (
                    entity_id,
                    candidate.title,
                    candidate.description,
                    candidate.type.value,
                    "active",
                    candidate.effective_from,
                    Json({"source_url": candidate.source_url, "source_snippet": candidate.source_snippet}),
                ),
            )
            provision_id = cur.fetchone()[0]
            conn.commit()
            return str(provision_id)


def provision_exists(entity_id: str, title: str) -> bool:
    """Check if a provision with the same title already exists."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT 1 FROM provisions WHERE entity_id = %s AND title = %s",
                (entity_id, title),
            )
            return cur.fetchone() is not None
