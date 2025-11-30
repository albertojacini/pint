"""Database operations for the search provision resources agent."""

import psycopg2
from typing import List
from search_provision_resources_agent.config import DATABASE_URL
from search_provision_resources_agent.models import EntityInfo


def get_entity_by_name(entity_name: str) -> EntityInfo:
    """
    Fetch political entity by name.

    Args:
        entity_name: Name of the political entity

    Returns:
        EntityInfo with id, name, and language

    Raises:
        ValueError: If entity not found
    """
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, name, identity_data
                FROM political_entities
                WHERE name = %s
                """,
                (entity_name,)
            )
            row = cur.fetchone()
            if not row:
                raise ValueError(f"Entity not found: {entity_name}")

            # Infer language from entity name or identity data
            language = 'en'  # default
            identity_data = row[2] or {}

            # Check for Italian entities
            if 'Comune' in entity_name or 'Italia' in entity_name:
                language = 'it'
            elif identity_data.get('countryCode') == 'IT':
                language = 'it'
            elif identity_data.get('countryCode') == 'ES':
                language = 'es'
            elif identity_data.get('countryCode') == 'FR':
                language = 'fr'

            return EntityInfo(id=str(row[0]), name=row[1], language=language)
    finally:
        conn.close()


def url_exists_for_entity(entity_id: str, url: str) -> bool:
    """
    Check if URL already exists for this entity.

    Args:
        entity_id: UUID of the political entity
        url: URL to check

    Returns:
        True if URL exists, False otherwise
    """
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT COUNT(*) FROM provision_resources
                WHERE entity_id = %s AND url = %s
                """,
                (entity_id, url)
            )
            return cur.fetchone()[0] > 0
    finally:
        conn.close()


def insert_provision_resource(entity_id: str, url: str) -> str:
    """
    Insert a new provision resource with status='pending'.

    Args:
        entity_id: UUID of the political entity
        url: URL to insert

    Returns:
        UUID of the inserted resource
    """
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO provision_resources (entity_id, url, status)
                VALUES (%s, %s, 'pending')
                RETURNING id
                """,
                (entity_id, url)
            )
            resource_id = cur.fetchone()[0]
        conn.commit()
        return str(resource_id)
    finally:
        conn.close()


def batch_insert_resources(entity_id: str, urls: List[str]) -> int:
    """
    Batch insert multiple URLs, skip duplicates.

    Args:
        entity_id: UUID of the political entity
        urls: List of URLs to insert

    Returns:
        Number of URLs inserted (excludes duplicates)
    """
    inserted = 0
    for url in urls:
        if not url_exists_for_entity(entity_id, url):
            insert_provision_resource(entity_id, url)
            inserted += 1
    return inserted
