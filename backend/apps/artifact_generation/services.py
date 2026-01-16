"""Artifact generation service - extracts structured artifacts from documents for provisions."""

import json
import re
from typing import Optional
from uuid import UUID

from langchain_anthropic import ChatAnthropic

from core.db import db
from apps.knowledge.models import ArtifactCreate, Artifact, ArtifactType
from apps.knowledge.services import get_knowledge_service
from apps.sources.services import SourcesService
from apps.artifact_generation.models import (
    ProvisionContext,
    ChunkResult,
    ArtifactPlan,
    ExtractedArtifact,
)


class ArtifactGenerator:
    """Generates artifacts for a provision using RAG search and LLM extraction."""

    def __init__(self):
        self.model = ChatAnthropic(
            model="claude-sonnet-4-5",
            temperature=0,
            max_tokens=4096,
        )
        self.sources_service = SourcesService()
        self.knowledge_service = get_knowledge_service()
        self.chunk_limit = 20
        self.similarity_threshold = 0.3

    async def generate_for_provision(self, provision_id: UUID) -> list[Artifact]:
        """
        Main entry point - generates all artifacts for a provision.

        Steps:
        1. Load provision with context
        2. RAG search for relevant chunks
        3. Plan artifacts based on available content
        4. Extract each artifact
        5. Persist and link
        """
        # 1. Load provision with context
        provision = await self._load_provision(provision_id)
        if not provision:
            raise ValueError(f"Provision not found: {provision_id}")

        print(f"  Loaded provision: {provision.title}")

        # 2. RAG search for relevant chunks
        chunks = await self._search_relevant_chunks(provision)
        print(f"  Found {len(chunks)} relevant chunks")

        if not chunks:
            print("  No relevant chunks found, skipping artifact generation")
            return []

        # 3. Plan artifacts based on available content
        artifact_plans = await self._plan_artifacts(provision, chunks)
        print(f"  Planned {len(artifact_plans)} artifacts")

        if not artifact_plans:
            print("  No artifacts planned, skipping extraction")
            return []

        # 4. Extract each artifact
        extracted = []
        for plan in artifact_plans:
            print(f"    Extracting: {plan.title} ({plan.artifact_type.value})")
            artifact = await self._extract_artifact(plan, chunks)
            extracted.append(artifact)

        # 5. Persist and link
        persisted = await self._persist_artifacts(extracted, provision_id)
        print(f"  Persisted {len(persisted)} artifacts")

        return persisted

    async def _load_provision(self, provision_id: UUID) -> Optional[ProvisionContext]:
        """Load provision with entity context and provision types."""
        async with db.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT
                    p.id, p.title, p.slug, p.description, p.description_short,
                    p.summary_md, p.entity_id,
                    e.name as entity_name
                FROM gov_provisions p
                JOIN gov_entities e ON e.id = p.entity_id
                WHERE p.id = $1
                """,
                provision_id,
            )
            if not row:
                return None

            # Get provision types
            type_rows = await conn.fetch(
                """
                SELECT t.code
                FROM gov_provision_type_assocs pta
                JOIN gov_provision_types t ON t.id = pta.type_id
                WHERE pta.provision_id = $1
                """,
                provision_id,
            )
            provision_types = [r["code"] for r in type_rows]

            return ProvisionContext(
                id=row["id"],
                title=row["title"],
                slug=row["slug"],
                description=row["description"],
                description_short=row["description_short"],
                summary_md=row["summary_md"],
                entity_id=row["entity_id"],
                entity_name=row["entity_name"],
                provision_types=provision_types,
            )

    async def _search_relevant_chunks(
        self, provision: ProvisionContext
    ) -> list[ChunkResult]:
        """Search documents for chunks relevant to this provision."""
        # Build search query from provision context
        query = self._build_search_query(provision)

        # Use existing semantic_search from sources service
        results = await self.sources_service.semantic_search(
            query=query,
            limit=self.chunk_limit,
            threshold=self.similarity_threshold,
        )

        return [ChunkResult(**r) for r in results]

    def _build_search_query(self, provision: ProvisionContext) -> str:
        """Build semantic search query from provision."""
        parts = [provision.title]
        if provision.description:
            parts.append(provision.description)
        if provision.provision_types:
            parts.append(f"Provision types: {', '.join(provision.provision_types)}")
        parts.append(f"Entity: {provision.entity_name}")
        return " ".join(parts)

    async def _plan_artifacts(
        self, provision: ProvisionContext, chunks: list[ChunkResult]
    ) -> list[ArtifactPlan]:
        """Use LLM to analyze chunks and plan which artifacts to extract."""
        chunks_text = self._format_chunks(chunks)

        prompt = f"""Analyze the following document excerpts related to the provision "{provision.title}".

Provision type(s): {', '.join(provision.provision_types) if provision.provision_types else 'unknown'}
Entity: {provision.entity_name}

Document excerpts:
{chunks_text}

Based on available information, plan which artifacts should be extracted.
Artifact types available:
- metric: Single quantifiable fact (JSON format: {{"label": "...", "value": ..., "unit": "...", "year": ...}})
- time_series: Historical data over time (CSV format with date column)
- breakdown: Distribution by category (CSV format with category, value, percentage columns)
- parameters: Configuration/specifications (YAML format)
- narrative: Qualitative analysis (Markdown prose, 2-4 paragraphs)

For each artifact, specify:
- title: descriptive name
- type: one of metric, time_series, breakdown, parameters, narrative
- description: what this artifact captures
- relevant_chunk_indices: list of chunk indices (0-based) to use for extraction

IMPORTANT:
- Only plan artifacts for which there is sufficient source data in the excerpts
- Prefer specific metrics over vague narratives
- If financial data is available, extract it as metrics or time_series
- If there are categorical breakdowns (by type, by year, etc.), use breakdown type

Return a JSON array of artifact plans. Example:
[
  {{"title": "Annual Budget 2023", "type": "metric", "description": "Total budget allocation for 2023", "relevant_chunk_indices": [0, 2]}},
  {{"title": "Revenue Sources", "type": "breakdown", "description": "Distribution of revenue by category", "relevant_chunk_indices": [1, 3, 4]}}
]

Return ONLY the JSON array, no other text."""

        response = await self.model.ainvoke(prompt)
        response_text = response.content.strip()
        return self._parse_artifact_plans(response_text)

    def _parse_artifact_plans(self, response_text: str) -> list[ArtifactPlan]:
        """Parse LLM response into ArtifactPlan objects."""
        # Extract JSON from potential markdown code blocks
        if "```" in response_text:
            match = re.search(r"```(?:json)?\s*(\[.*?\])\s*```", response_text, re.DOTALL)
            if match:
                response_text = match.group(1)

        try:
            plans_data = json.loads(response_text)
        except json.JSONDecodeError as e:
            print(f"    Warning: Failed to parse artifact plans: {e}")
            return []

        plans = []
        for plan_data in plans_data:
            try:
                artifact_type = ArtifactType(plan_data["type"])
                plans.append(
                    ArtifactPlan(
                        title=plan_data["title"],
                        artifact_type=artifact_type,
                        description=plan_data["description"],
                        relevant_chunk_indices=plan_data["relevant_chunk_indices"],
                    )
                )
            except (KeyError, ValueError) as e:
                print(f"    Warning: Skipping invalid plan: {e}")
                continue

        return plans

    async def _extract_artifact(
        self, plan: ArtifactPlan, chunks: list[ChunkResult]
    ) -> ExtractedArtifact:
        """Extract artifact content from chunks using LLM."""
        # Get relevant chunks
        relevant_chunks = []
        for idx in plan.relevant_chunk_indices:
            if 0 <= idx < len(chunks):
                relevant_chunks.append(chunks[idx])

        if not relevant_chunks:
            # Fallback to all chunks if indices are invalid
            relevant_chunks = chunks[:5]

        chunks_text = self._format_chunks(relevant_chunks)
        format_instructions = self._get_format_instructions(plan.artifact_type)

        prompt = f"""Extract a {plan.artifact_type.value} artifact titled "{plan.title}".

Description: {plan.description}

Source content:
{chunks_text}

Format requirements:
{format_instructions}

Return ONLY the artifact content in the specified format, no other text or explanation."""

        response = await self.model.ainvoke(prompt)
        content = response.content.strip()

        # Clean up content if wrapped in code blocks
        if "```" in content:
            match = re.search(r"```(?:\w+)?\s*([\s\S]*?)\s*```", content)
            if match:
                content = match.group(1).strip()

        # Collect unique document IDs from relevant chunks
        source_doc_ids = list(set(c.document_id for c in relevant_chunks))

        return ExtractedArtifact(
            title=plan.title,
            description=plan.description,
            artifact_type=plan.artifact_type,
            content=content,
            source_document_ids=source_doc_ids,
        )

    def _get_format_instructions(self, artifact_type: ArtifactType) -> str:
        """Return format instructions for each artifact type."""
        formats = {
            ArtifactType.METRIC: 'JSON object with keys: label (string), value (number), unit (string), year (optional integer), context (optional string). Example: {"label": "Annual Revenue", "value": 142000000, "unit": "EUR", "year": 2023}',
            ArtifactType.TIME_SERIES: "CSV with header row. First column must be 'date' in ISO format (YYYY-MM-DD or YYYY). Additional columns for metric values. Example:\ndate,value\n2020,1000000\n2021,1200000\n2022,1500000",
            ArtifactType.BREAKDOWN: "CSV with header row. Columns: category, value, percentage (optional). Example:\ncategory,value,percentage\nTransport,500000,45.5\nEducation,300000,27.3\nHealth,300000,27.2",
            ArtifactType.PARAMETERS: "YAML format with key-value pairs, can be nested. Example:\nservice_hours:\n  weekday: '08:00-18:00'\n  weekend: '10:00-14:00'\nfleet_size: 150",
            ArtifactType.NARRATIVE: "Markdown prose, 2-4 paragraphs. Be factual and cite specific numbers from the source content. No headers needed.",
            ArtifactType.DATASET: "CSV with header row and any relevant columns extracted from the source.",
        }
        return formats.get(artifact_type, "Plain text")

    def _format_chunks(self, chunks: list[ChunkResult]) -> str:
        """Format chunks for LLM prompt."""
        formatted = []
        for i, chunk in enumerate(chunks):
            header = f"[Chunk {i}] From: {chunk.document_title}"
            if chunk.publisher_name:
                header += f" (Publisher: {chunk.publisher_name})"
            formatted.append(f"{header}\n{chunk.content}")
        return "\n\n---\n\n".join(formatted)

    async def _persist_artifacts(
        self, artifacts: list[ExtractedArtifact], provision_id: UUID
    ) -> list[Artifact]:
        """Persist artifacts and create links to sources and provision."""
        persisted = []

        for artifact in artifacts:
            # Create artifact
            created = await self.knowledge_service.create_artifact(
                ArtifactCreate(
                    title=artifact.title,
                    description=artifact.description,
                    artifact_type=artifact.artifact_type,
                    content=artifact.content,
                )
            )

            # Link to source documents
            doc_uuids = [UUID(doc_id) for doc_id in artifact.source_document_ids]
            await self.knowledge_service.link_artifact_to_sources(
                artifact_id=created.id,
                document_ids=doc_uuids,
            )

            # Link to provision
            await self.knowledge_service.link_artifact_to_provision(
                artifact_id=created.id,
                provision_id=provision_id,
            )

            persisted.append(created)

        return persisted


# Global instance
_artifact_generator: Optional[ArtifactGenerator] = None


def get_artifact_generator() -> ArtifactGenerator:
    global _artifact_generator
    if _artifact_generator is None:
        _artifact_generator = ArtifactGenerator()
    return _artifact_generator
