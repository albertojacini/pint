"""Business logic for the knowledge app."""

from typing import Optional, List
from uuid import UUID

from core.db import db
from apps.knowledge.models import (
    Artifact,
    ArtifactCreate,
    ArtifactSource,
    ProvisionArtifact,
)


class KnowledgeService:
    """Service for managing artifacts and their relationships."""

    def __init__(self):
        pass

    # =========================================================================
    # Artifact operations
    # =========================================================================

    async def create_artifact(self, artifact: ArtifactCreate) -> Artifact:
        """Create a new artifact."""
        async with db.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                INSERT INTO kno_artifacts (title, description, artifact_type, content)
                VALUES ($1, $2, $3, $4)
                RETURNING *
                """,
                artifact.title,
                artifact.description,
                artifact.artifact_type.value,
                artifact.content,
            )
            return Artifact(**dict(row))

    async def get_artifact_by_id(self, artifact_id: UUID) -> Optional[Artifact]:
        """Get an artifact by ID."""
        async with db.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM kno_artifacts WHERE id = $1",
                artifact_id
            )
            if row:
                return Artifact(**dict(row))
            return None

    async def get_artifacts_by_type(self, artifact_type: str) -> List[Artifact]:
        """Get all artifacts of a given type."""
        async with db.pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT * FROM kno_artifacts WHERE artifact_type = $1 ORDER BY created_at DESC",
                artifact_type
            )
            return [Artifact(**dict(row)) for row in rows]

    async def get_all_artifacts(self) -> List[Artifact]:
        """Get all artifacts."""
        async with db.pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT * FROM kno_artifacts ORDER BY created_at DESC"
            )
            return [Artifact(**dict(row)) for row in rows]

    # =========================================================================
    # Source linking
    # =========================================================================

    async def link_artifact_to_sources(
        self,
        artifact_id: UUID,
        document_ids: List[UUID]
    ) -> List[ArtifactSource]:
        """Link an artifact to source documents."""
        results = []
        async with db.pool.acquire() as conn:
            for doc_id in document_ids:
                row = await conn.fetchrow(
                    """
                    INSERT INTO kno_artifact_sources (artifact_id, document_id)
                    VALUES ($1, $2)
                    ON CONFLICT (artifact_id, document_id) DO NOTHING
                    RETURNING *
                    """,
                    artifact_id,
                    doc_id
                )
                if row:
                    results.append(ArtifactSource(**dict(row)))
        return results

    async def get_artifact_sources(self, artifact_id: UUID) -> List[ArtifactSource]:
        """Get all source documents linked to an artifact."""
        async with db.pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT * FROM kno_artifact_sources WHERE artifact_id = $1",
                artifact_id
            )
            return [ArtifactSource(**dict(row)) for row in rows]

    # =========================================================================
    # Provision linking
    # =========================================================================

    async def link_artifact_to_provision(
        self,
        artifact_id: UUID,
        provision_id: UUID
    ) -> Optional[ProvisionArtifact]:
        """Link an artifact to a provision."""
        async with db.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                INSERT INTO gov_provision_artifacts (artifact_id, provision_id)
                VALUES ($1, $2)
                ON CONFLICT (provision_id, artifact_id) DO NOTHING
                RETURNING *
                """,
                artifact_id,
                provision_id
            )
            if row:
                return ProvisionArtifact(**dict(row))
            return None

    async def get_provision_artifacts(self, provision_id: UUID) -> List[Artifact]:
        """Get all artifacts linked to a provision."""
        async with db.pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT a.* FROM kno_artifacts a
                JOIN gov_provision_artifacts pa ON pa.artifact_id = a.id
                WHERE pa.provision_id = $1
                ORDER BY a.created_at DESC
                """,
                provision_id
            )
            return [Artifact(**dict(row)) for row in rows]


# Global instance
_knowledge_service: Optional[KnowledgeService] = None


def get_knowledge_service() -> KnowledgeService:
    global _knowledge_service
    if _knowledge_service is None:
        _knowledge_service = KnowledgeService()
    return _knowledge_service
