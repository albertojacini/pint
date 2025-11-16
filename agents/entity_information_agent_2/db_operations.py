"""Database operations for PostgreSQL/Supabase interactions."""

import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor, Json
from typing import Dict, Any, Optional, List
from datetime import datetime
from models import CompleteEntityInfo


def get_db_connection():
    """Create and return a database connection."""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        # Default for local Supabase
        database_url = "postgresql://postgres:postgres@127.0.0.1:54322/postgres"

    try:
        conn = psycopg2.connect(database_url)
        return conn
    except psycopg2.Error as e:
        print(f"❌ Database connection failed: {e}")
        raise


def entity_exists(entity_name: str) -> bool:
    """
    Check if an entity already exists in the database.

    Args:
        entity_name: Name of the entity to check

    Returns:
        True if entity exists, False otherwise
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id FROM political_entities WHERE name = %s",
                (entity_name,)
            )
            result = cursor.fetchone()
            return result is not None
    except psycopg2.Error as e:
        print(f"❌ Error checking entity existence: {e}")
        return False
    finally:
        conn.close()


def upsert_entity(entity_data: CompleteEntityInfo) -> Dict[str, Any]:
    """
    Insert or update a political entity in the database.

    Args:
        entity_data: CompleteEntityInfo object with entity data

    Returns:
        Dictionary with operation result
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Convert Pydantic models to dictionaries
            identity_data = entity_data.identity_data.dict() if entity_data.identity_data else {}
            essential_stats = entity_data.essential_stats.dict() if entity_data.essential_stats else {}
            political_landscape = entity_data.political_landscape.dict() if entity_data.political_landscape else {}
            performance_indicators = entity_data.performance_indicators.dict() if entity_data.performance_indicators else {}
            community_metrics = entity_data.community_metrics.dict() if entity_data.community_metrics else {}

            # Check if entity exists
            cursor.execute(
                "SELECT id FROM political_entities WHERE name = %s",
                (entity_data.name,)
            )
            existing = cursor.fetchone()

            if existing:
                # Update existing entity
                cursor.execute("""
                    UPDATE political_entities SET
                        description = %s,
                        type = %s,
                        population = %s,
                        avatar_url = %s,
                        identity_data = %s,
                        essential_stats = %s,
                        political_landscape = %s,
                        performance_indicators = %s,
                        community_metrics = %s,
                        score_innovation = %s,
                        score_sustainability = %s,
                        score_impact = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING id, name, updated_at
                """, (
                    entity_data.description,
                    entity_data.type,
                    entity_data.population,
                    entity_data.avatar_url,
                    Json(identity_data),
                    Json(essential_stats),
                    Json(political_landscape),
                    Json(performance_indicators),
                    Json(community_metrics),
                    entity_data.score_innovation,
                    entity_data.score_sustainability,
                    entity_data.score_impact,
                    existing['id']
                ))
                result = cursor.fetchone()
                conn.commit()
                print(f"✅ Updated entity: {result['name']}")
                return {
                    "operation": "update",
                    "entity_id": result['id'],
                    "entity_name": result['name'],
                    "timestamp": result['updated_at'].isoformat()
                }
            else:
                # Insert new entity
                cursor.execute("""
                    INSERT INTO political_entities (
                        name, description, type, population, avatar_url,
                        identity_data, essential_stats, political_landscape,
                        performance_indicators, community_metrics,
                        score_innovation, score_sustainability, score_impact
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id, name, created_at
                """, (
                    entity_data.name,
                    entity_data.description,
                    entity_data.type,
                    entity_data.population,
                    entity_data.avatar_url,
                    Json(identity_data),
                    Json(essential_stats),
                    Json(political_landscape),
                    Json(performance_indicators),
                    Json(community_metrics),
                    entity_data.score_innovation,
                    entity_data.score_sustainability,
                    entity_data.score_impact
                ))
                result = cursor.fetchone()
                conn.commit()
                print(f"✅ Created new entity: {result['name']}")
                return {
                    "operation": "insert",
                    "entity_id": result['id'],
                    "entity_name": result['name'],
                    "timestamp": result['created_at'].isoformat()
                }

    except psycopg2.Error as e:
        conn.rollback()
        print(f"❌ Database upsert failed: {e}")
        return {
            "operation": "error",
            "error": str(e)
        }
    finally:
        conn.close()


def get_entity(entity_name: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve a political entity from the database.

    Args:
        entity_name: Name of the entity

    Returns:
        Dictionary with entity data or None if not found
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                "SELECT * FROM political_entities WHERE name = %s",
                (entity_name,)
            )
            result = cursor.fetchone()
            if result:
                # Convert datetime objects to strings for JSON serialization
                if result.get('created_at'):
                    result['created_at'] = result['created_at'].isoformat()
                if result.get('updated_at'):
                    result['updated_at'] = result['updated_at'].isoformat()
            return dict(result) if result else None
    except psycopg2.Error as e:
        print(f"❌ Error retrieving entity: {e}")
        return None
    finally:
        conn.close()


def list_entities(
    entity_type: Optional[str] = None,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """
    List political entities from the database.

    Args:
        entity_type: Filter by entity type (e.g., 'city', 'region')
        limit: Maximum number of results

    Returns:
        List of entity dictionaries
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            if entity_type:
                cursor.execute(
                    "SELECT * FROM political_entities WHERE type = %s ORDER BY name LIMIT %s",
                    (entity_type, limit)
                )
            else:
                cursor.execute(
                    "SELECT * FROM political_entities ORDER BY name LIMIT %s",
                    (limit,)
                )
            results = cursor.fetchall()
            # Convert datetime objects
            for result in results:
                if result.get('created_at'):
                    result['created_at'] = result['created_at'].isoformat()
                if result.get('updated_at'):
                    result['updated_at'] = result['updated_at'].isoformat()
            return [dict(r) for r in results]
    except psycopg2.Error as e:
        print(f"❌ Error listing entities: {e}")
        return []
    finally:
        conn.close()


def delete_entity(entity_name: str) -> bool:
    """
    Delete a political entity from the database.

    Args:
        entity_name: Name of the entity to delete

    Returns:
        True if deleted, False otherwise
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "DELETE FROM political_entities WHERE name = %s RETURNING id",
                (entity_name,)
            )
            result = cursor.fetchone()
            conn.commit()
            if result:
                print(f"✅ Deleted entity: {entity_name}")
                return True
            else:
                print(f"⚠️ Entity not found: {entity_name}")
                return False
    except psycopg2.Error as e:
        conn.rollback()
        print(f"❌ Error deleting entity: {e}")
        return False
    finally:
        conn.close()


def update_entity_scores(
    entity_name: str,
    innovation_score: Optional[float] = None,
    sustainability_score: Optional[float] = None,
    impact_score: Optional[float] = None
) -> bool:
    """
    Update the performance scores for an entity.

    Args:
        entity_name: Name of the entity
        innovation_score: Innovation score (0-100)
        sustainability_score: Sustainability score (0-100)
        impact_score: Impact score (0-100)

    Returns:
        True if updated, False otherwise
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Build dynamic update query
            updates = []
            values = []

            if innovation_score is not None:
                updates.append("score_innovation = %s")
                values.append(innovation_score)
            if sustainability_score is not None:
                updates.append("score_sustainability = %s")
                values.append(sustainability_score)
            if impact_score is not None:
                updates.append("score_impact = %s")
                values.append(impact_score)

            if not updates:
                print("⚠️ No scores to update")
                return False

            updates.append("updated_at = CURRENT_TIMESTAMP")
            values.append(entity_name)

            query = f"UPDATE political_entities SET {', '.join(updates)} WHERE name = %s RETURNING id"
            cursor.execute(query, values)

            result = cursor.fetchone()
            conn.commit()

            if result:
                print(f"✅ Updated scores for: {entity_name}")
                return True
            else:
                print(f"⚠️ Entity not found: {entity_name}")
                return False

    except psycopg2.Error as e:
        conn.rollback()
        print(f"❌ Error updating scores: {e}")
        return False
    finally:
        conn.close()


def test_connection() -> bool:
    """
    Test the database connection.

    Returns:
        True if connection successful, False otherwise
    """
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            conn.close()
            print("✅ Database connection successful")
            return result[0] == 1
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False