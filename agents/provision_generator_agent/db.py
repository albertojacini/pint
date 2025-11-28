"""Database operations for the provision generator agent."""

import psycopg2
from provision_generator_agent.config import DATABASE_URL


def get_pending_resources(entity_name: str, limit: int = 10) -> list[dict]:
    """
    Fetch pending provision resources for an entity.

    Args:
        entity_name: Name of the political entity
        limit: Maximum number of resources to fetch

    Returns:
        List of dicts with id, url, entity_id
    """
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT pr.id, pr.url, pr.entity_id
                FROM provision_resources pr
                JOIN political_entities pe ON pr.entity_id = pe.id
                WHERE pe.name = %s AND pr.status = 'pending'
                ORDER BY pr.created_at
                LIMIT %s
                """,
                (entity_name, limit),
            )
            rows = cur.fetchall()
            return [{"id": str(row[0]), "url": row[1], "entity_id": str(row[2])} for row in rows]
    finally:
        conn.close()


def update_resource_status(resource_id: str, status: str) -> None:
    """
    Update the status of a provision resource.

    Args:
        resource_id: UUID of the resource
        status: New status ('pending', 'scraped', 'processed', 'failed')
    """
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE provision_resources SET status = %s WHERE id = %s",
                (status, resource_id),
            )
        conn.commit()
    finally:
        conn.close()
