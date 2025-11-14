"""Database operations for entity_info_agent."""

import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor, Json
from typing import Dict, Any, Optional


def connect_to_db():
    """Create a connection to PostgreSQL database."""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable not set")

    return psycopg2.connect(database_url)


def upsert_entity(entity_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Insert or update entity in the database.
    If entity with same name exists, update it. Otherwise insert new.

    Args:
        entity_data: Dictionary containing entity information with keys:
            - name: str
            - description: Optional[str]
            - type: str
            - population: Optional[int]
            - identity_data: Dict
            - essential_stats: Dict

    Returns:
        Dictionary with operation result
    """
    conn = None
    try:
        conn = connect_to_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Check if entity exists
        cursor.execute(
            "SELECT id FROM political_entities WHERE name = %s",
            (entity_data['name'],)
        )
        existing = cursor.fetchone()

        if existing:
            # Update existing entity
            entity_id = existing['id']
            cursor.execute("""
                UPDATE political_entities
                SET description = %s,
                    type = %s,
                    population = %s,
                    identity_data = %s,
                    essential_stats = %s,
                    updated_at = NOW()
                WHERE id = %s
                RETURNING id, name
            """, (
                entity_data.get('description'),
                entity_data.get('type'),
                entity_data.get('population'),
                Json(entity_data.get('identity_data', {})),
                Json(entity_data.get('essential_stats', {})),
                entity_id
            ))
            result = cursor.fetchone()
            conn.commit()

            return {
                "success": True,
                "operation": "update",
                "entity_id": str(result['id']),
                "entity_name": result['name']
            }
        else:
            # Insert new entity
            cursor.execute("""
                INSERT INTO political_entities
                (name, description, type, population, identity_data, essential_stats)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, name
            """, (
                entity_data['name'],
                entity_data.get('description'),
                entity_data.get('type'),
                entity_data.get('population'),
                Json(entity_data.get('identity_data', {})),
                Json(entity_data.get('essential_stats', {}))
            ))
            result = cursor.fetchone()
            conn.commit()

            return {
                "success": True,
                "operation": "insert",
                "entity_id": str(result['id']),
                "entity_name": result['name']
            }

    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Database error: {e}")
        return {
            "success": False,
            "error": str(e)
        }

    finally:
        if conn:
            cursor.close()
            conn.close()
