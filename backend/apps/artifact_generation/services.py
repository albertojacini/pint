"""Artifact generation service - extracts structured artifacts from documents for provisions."""

import json
import re
from typing import Optional
from uuid import UUID

from langchain_anthropic import ChatAnthropic

from core.config import settings
from core.db import db
from apps.knowledge.models import ArtifactCreate, Artifact, ArtifactType, ArtifactState
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
            model=settings.artifact_generation_app__model,
            temperature=settings.artifact_generation_app__temperature,
            max_tokens=settings.artifact_generation_app__max_tokens,
        )
        self.sources_service = SourcesService()
        self.knowledge_service = get_knowledge_service()
        self.chunk_limit = settings.artifact_generation_app__chunk_limit
        self.similarity_threshold = settings.artifact_generation_app__similarity_threshold

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

Your task is to identify STRUCTURED FACTS that can be extracted as artifacts.

== WHAT IS AN ARTIFACT? ==
An artifact is a structured fact that would make a meaningful TABLE or DIAGRAM in a printed report.
- It describes REALITY (actual data, facts), not policy intent
- It must have enough structure to visualize (not just a single number)
- Examples: pricing schemas, time series of entries, budget breakdowns by category

== ARTIFACT TYPES ==
- evolution: How something changed over time (CSV with date column) → renders as line/area chart
- distribution: How something is divided across categories (CSV) → renders as bar/pie chart
- table: Multi-dimensional structured data (CSV with multiple columns) → renders as data table
- parameters: Configuration/rules/thresholds (YAML) → renders as structured table
- narrative: Qualitative summary of facts (Markdown prose) → renders as text block

== PRINTABILITY TEST ==
Before planning an artifact, ask: "Would this make a good table or chart in a report?"
✓ GOOD: "Tariffe Area C per Categoria Veicolo" (table with vehicle types × fees × restrictions)
✓ GOOD: "Ingressi per Anno" (time series suitable for line chart)
✓ GOOD: "Composizione Spesa per Categoria" (breakdown suitable for pie chart)
✗ BAD: "Budget totale: €142M" (just a number, not structured enough)
✗ BAD: "Overview of the policy" (too vague, not factual data)

== QUANTITY GUIDELINES ==
- Plan 2-3 artifacts for typical provisions (the essential facts)
- Maximum 10 artifacts even for complex provisions
- Quality over quantity - only plan if it passes the printability test

== STATE TRACKING ==
For each artifact, assess data completeness:
- complete: All data available in the sources
- partial: Data available but with gaps (missing years, incomplete categories)
- draft: Data found but may need validation or has conflicting sources

For each artifact, specify:
- title: descriptive name (in source language)
- type: one of evolution, distribution, table, parameters, narrative
- description: what factual data this captures (in source language)
- relevant_chunk_indices: list of chunk indices (0-based) to use
- expected_state: complete, partial, or draft
- state_notes: if partial/draft, explain what's missing or uncertain (in source language)

Return a JSON array. Example (if documents are in Italian):
[
  {{"title": "Tariffe per Categoria Veicolo", "type": "table", "description": "Schema tariffario con categoria veicolo, tariffa e restrizioni", "relevant_chunk_indices": [0, 2], "expected_state": "complete", "state_notes": null}},
  {{"title": "Ingressi Annuali", "type": "evolution", "description": "Serie storica degli ingressi in Area C", "relevant_chunk_indices": [1, 3], "expected_state": "partial", "state_notes": "Dati 2020-2021 anomali per COVID"}}
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
                # Parse state, defaulting to draft
                expected_state = ArtifactState.DRAFT
                if "expected_state" in plan_data:
                    try:
                        expected_state = ArtifactState(plan_data["expected_state"])
                    except ValueError:
                        pass
                plans.append(
                    ArtifactPlan(
                        title=plan_data["title"],
                        artifact_type=artifact_type,
                        description=plan_data["description"],
                        relevant_chunk_indices=plan_data["relevant_chunk_indices"],
                        expected_state=expected_state,
                        state_notes=plan_data.get("state_notes"),
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

IMPORTANT - LANGUAGE: All text content (labels, categories, narratives, etc.) MUST be in the same language as the source documents. Only use technical terms (like column headers: date, value, category, percentage) in their standard form.

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
            state=plan.expected_state,
            state_notes=plan.state_notes,
        )

    def _get_format_instructions(self, artifact_type: ArtifactType) -> str:
        """Return format instructions for each artifact type."""
        formats = {
            ArtifactType.EVOLUTION: """CSV with header row. First column must be 'date' (YYYY or YYYY-MM-DD format).
Additional columns for the metric(s) being tracked over time.
If data is missing for certain periods, include the row with empty values to show the gap.
Example:
date,ingressi,ricavi_eur
2018,45000000,28000000
2019,42000000,26000000
2020,,
2021,,
2022,38000000,24000000
2023,40000000,25000000""",

            ArtifactType.DISTRIBUTION: """CSV with header row. Columns: category (in source language), value, percentage (optional).
Categories should be mutually exclusive and cover the full breakdown.
Example:
categoria,valore,percentuale
Trasporto pubblico,500000000,45.5
Manutenzione strade,300000000,27.3
Verde urbano,150000000,13.6
Altro,150000000,13.6""",

            ArtifactType.TABLE: """CSV with header row. Multiple columns representing different dimensions.
Use for structured data with 2+ dimensions (e.g., category × attributes, or time × category).
Example (pricing schema):
categoria_veicolo,tariffa_eur,orario,esenzioni
Euro 6 benzina,5.00,07:30-19:30,residenti -40%
Euro 5 diesel,7.50,07:30-19:30,nessuna
Elettrico,0.00,sempre,esente
Ibrido plug-in,2.50,07:30-19:30,residenti -40%""",

            ArtifactType.PARAMETERS: """YAML format with key-value pairs, can be nested.
Use for configuration, rules, thresholds, eligibility criteria.
Keys and values in source language where applicable.
Example:
orari:
  feriale: '07:30-19:30'
  festivo: chiuso
tariffe:
  base: 5.00
  ridotta: 2.50
requisiti_esenzione:
  residenti: true
  disabili: true
  veicoli_servizio: true""",

            ArtifactType.NARRATIVE: """Markdown prose in source language, 2-4 paragraphs.
Summarize factual findings from the sources. Be specific and cite numbers.
Do not describe policy intent - describe what the data shows.
No headers needed, just flowing paragraphs.""",
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
                    state=artifact.state,
                    state_notes=artifact.state_notes,
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
