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

        Two-phase approach:
        - Phase 1: Plan IDEAL artifacts based on the phenomenon itself (source-agnostic)
        - Phase 2: Populate artifacts with data from available sources

        This ensures ambitious, insightful artifact definitions that aren't
        limited by incomplete source material.
        """
        # Load provision with context
        provision = await self._load_provision(provision_id)
        if not provision:
            raise ValueError(f"Provision not found: {provision_id}")

        print(f"  Loaded provision: {provision.title}")

        # PHASE 1: Plan ideal artifacts (source-agnostic)
        # Ask LLM what the most important facts/metrics are for this phenomenon
        print("  Phase 1: Planning ideal artifacts...")
        artifact_plans = await self._plan_ideal_artifacts(provision)
        print(f"  Planned {len(artifact_plans)} ideal artifacts")

        if not artifact_plans:
            print("  No artifacts planned")
            return []

        # PHASE 2: Populate artifacts with available data
        # Search for relevant chunks and extract what we can find
        print("  Phase 2: Populating with available data...")
        chunks = await self._search_relevant_chunks(provision)
        print(f"  Found {len(chunks)} relevant chunks")

        extracted = []
        for plan in artifact_plans:
            print(f"    Populating: {plan.title} ({plan.artifact_type.value})")
            artifact = await self._populate_artifact(plan, chunks, provision)
            extracted.append(artifact)

        # Persist and link
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

    async def _plan_ideal_artifacts(
        self, provision: ProvisionContext
    ) -> list[ArtifactPlan]:
        """
        Phase 1: Plan ideal artifacts based on the phenomenon itself.

        This is SOURCE-AGNOSTIC - we don't look at available documents.
        Instead, we ask: "What are the most important facts to know about this phenomenon?"
        """
        prompt = f"""You are planning what IDEAL data artifacts should exist for a public policy provision.

== PROVISION ==
Title: {provision.title}
Description: {provision.description or 'N/A'}
Short description: {provision.description_short or 'N/A'}
Type(s): {', '.join(provision.provision_types) if provision.provision_types else 'unknown'}
Entity: {provision.entity_name}

== YOUR TASK ==
Think about this policy phenomenon and identify the MOST IMPORTANT FACTS that would help
citizens, researchers, and policymakers understand it. Focus on what data SHOULD exist,
not what we might have available.

== ARTIFACT SPECIFICATION ==

An artifact is a structured data expression of ONE DIMENSION of a phenomenon.
It describes FACTS/REALITY, not policy intent or goals.

CRITICAL CONSTRAINTS:
1. ONE DIMENSION per data artifact (evolution, distribution, table):
   ✓ "Traffic entries by year" (dimension: time)
   ✓ "Revenue by vehicle category" (dimension: category)
   ✗ "Traffic vs revenue correlation" (multiple dimensions mixed)

   Exception: "parameters" artifacts can group related configuration settings
   (tariffs, schedules, exemptions) as they describe system configuration holistically.

2. NO CROSS-PHENOMENON COMPARISONS: Artifacts describe THIS phenomenon only
   ✗ Comparisons with other cities
   ✗ Benchmarking against similar policies elsewhere
   ✗ International standards comparisons

3. NO COMPLEX ANALYSIS: Artifacts are raw structured facts, not derived insights
   ✗ Correlation analyses
   ✗ Impact assessments (cause-effect)
   ✗ Predictive models

== ARTIFACT TYPES ==
- evolution: How something changed over time → line/area chart
- distribution: How something is divided across categories → bar/pie chart
- table: Multi-dimensional structured data → data table
- parameters: Configuration/rules/thresholds → structured table
- narrative: Qualitative factual summary → text block

== PRINTABILITY TEST ==
Ask: "Would this make a good table or chart in a printed report?"
✓ GOOD: "Tariffe per Categoria Veicolo" (table with structure)
✓ GOOD: "Ingressi Annuali" (time series for line chart)
✓ GOOD: "Ripartizione Entrate per Destinazione" (breakdown for pie chart)
✗ BAD: "Budget totale: €142M" (single number, not structured)
✗ BAD: "Policy overview" (too vague)

== QUANTITY ==
- 3-5 artifacts for typical provisions (the essential defining facts)
- Maximum 10 for complex provisions
- Quality over quantity

== OUTPUT FORMAT ==
For each artifact:
- title: descriptive name (in the language appropriate for the entity's country)
- type: evolution | distribution | table | parameters | narrative
- description: what factual data this should capture
- search_query: what to search for in documents to find this data

Return JSON array:
[
  {{"title": "Ingressi Annuali in Area C", "type": "evolution", "description": "Serie storica del numero di veicoli che entrano in Area C per anno", "search_query": "ingressi veicoli area c anno statistiche"}},
  {{"title": "Tariffe per Categoria Veicolo", "type": "table", "description": "Schema tariffario con importi per ogni classe di veicolo", "search_query": "tariffa costo euro veicolo categoria classe"}}
]

Return ONLY the JSON array."""

        response = await self.model.ainvoke(prompt)
        response_text = response.content.strip()
        return self._parse_ideal_plans(response_text)

    def _parse_ideal_plans(self, response_text: str) -> list[ArtifactPlan]:
        """Parse Phase 1 LLM response into ArtifactPlan objects."""
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
                        search_query=plan_data.get("search_query", plan_data["title"]),
                    )
                )
            except (KeyError, ValueError) as e:
                print(f"    Warning: Skipping invalid plan: {e}")
                continue

        return plans

    async def _populate_artifact(
        self, plan: ArtifactPlan, all_chunks: list[ChunkResult], provision: ProvisionContext
    ) -> ExtractedArtifact:
        """
        Phase 2: Populate an artifact plan with data from available sources.

        Searches for relevant data using the plan's search_query and extracts what's available.
        Sets state based on data availability.
        """
        # Search for chunks relevant to this specific artifact
        relevant_chunks = await self._search_artifact_chunks(plan, provision)

        # If no specific chunks found, fall back to general provision chunks
        if not relevant_chunks:
            # Use top chunks from the general search, filtered by some relevance
            relevant_chunks = all_chunks[:5] if all_chunks else []

        # Determine state based on data availability
        if not relevant_chunks:
            # No data found - create draft artifact with placeholder
            return ExtractedArtifact(
                title=plan.title,
                description=plan.description,
                artifact_type=plan.artifact_type,
                content="[Dati non ancora disponibili]",
                source_document_ids=[],
                state=ArtifactState.DRAFT,
                state_notes="Nessun dato trovato nelle fonti disponibili",
            )

        # Extract content from available chunks
        chunks_text = self._format_chunks(relevant_chunks)
        format_instructions = self._get_format_instructions(plan.artifact_type)

        prompt = f"""Extract a {plan.artifact_type.value} artifact titled "{plan.title}".

Expected data: {plan.description}

Available source content:
{chunks_text}

Format requirements:
{format_instructions}

== INSTRUCTIONS ==
1. Extract ONLY factual data that exists in the sources above
2. If the sources contain partial data, extract what's available
3. Do NOT invent or estimate missing values
4. Use the same language as the source documents for all labels and text

== STATE ASSESSMENT ==
After extracting, assess the data completeness:
- If you found comprehensive data covering the full scope: state is "complete"
- If you found data but with gaps (missing periods, categories): state is "partial"
- If data is sparse or uncertain: state is "draft"

Return a JSON object with:
- content: the extracted data in the specified format
- state: "complete", "partial", or "draft"
- state_notes: if not complete, brief explanation of what's missing (in source language, max 100 chars)

Example:
{{"content": "date,value\\n2020,100\\n2021,150", "state": "partial", "state_notes": "Dati mancanti per 2022-2023"}}

Return ONLY the JSON object."""

        response = await self.model.ainvoke(prompt)
        response_text = response.content.strip()

        # Parse response
        content, state, state_notes = self._parse_population_response(
            response_text, plan.artifact_type
        )

        # Collect unique document IDs from relevant chunks
        source_doc_ids = list(set(c.document_id for c in relevant_chunks))

        return ExtractedArtifact(
            title=plan.title,
            description=plan.description,
            artifact_type=plan.artifact_type,
            content=content,
            source_document_ids=source_doc_ids,
            state=state,
            state_notes=state_notes,
        )

    async def _search_artifact_chunks(
        self, plan: ArtifactPlan, provision: ProvisionContext
    ) -> list[ChunkResult]:
        """Search for chunks relevant to a specific artifact using its search query."""
        # Combine artifact search query with provision context
        query = f"{provision.title} {plan.search_query}"

        results = await self.sources_service.semantic_search(
            query=query,
            limit=10,  # Fewer chunks per artifact
            threshold=self.similarity_threshold,
        )

        return [ChunkResult(**r) for r in results]

    def _parse_population_response(
        self, response_text: str, artifact_type: ArtifactType
    ) -> tuple[str, ArtifactState, Optional[str]]:
        """Parse the population response into content, state, and state_notes."""
        # Extract JSON from potential markdown code blocks
        if "```" in response_text:
            match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", response_text, re.DOTALL)
            if match:
                response_text = match.group(1)

        try:
            data = json.loads(response_text)
            content = data.get("content", response_text)
            state_str = data.get("state", "draft")
            state_notes = data.get("state_notes")

            try:
                state = ArtifactState(state_str)
            except ValueError:
                state = ArtifactState.DRAFT

            return content, state, state_notes

        except json.JSONDecodeError:
            # Fallback: treat entire response as content
            return response_text, ArtifactState.DRAFT, None

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
