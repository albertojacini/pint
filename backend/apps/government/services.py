"""Provision drafting workflow service with inline LLM calls.

SCOPE: Provision business logic and orchestration
------------------------------------------------------
This service is responsible for:
- Generating research prompts from user input (inline LLM)
- Orchestrating research agents for information gathering
- Generating provision drafts from research summaries (inline LLM)
- Promoting research sources to sou_documents
- Linking provision drafts to source documents
- Making ALL provision-specific decisions:
  * provision_type (ownership, contract, regulation, etc.)
  * relevance scores (0-10)
  * confidence scores (0.0-1.0)
  * structuring data for provision schema
  * enforcing business constraints (e.g., character limits)
"""

from typing import Optional, Dict, Any, List
from uuid import UUID

from langchain.chat_models import init_chat_model

from apps.government.models import ProvisionDraftOutput
from apps.sources.services import SourcesService
from services.research import create_research_task, get_task_status


class ProvisionService:
    """Service for provision drafting workflow."""

    def __init__(self):
        # Initialize LangChain chat model for Anthropic
        self.llm = init_chat_model(
            model="claude-sonnet-4-5",
            model_provider="anthropic"
        )

        # Create structured output model for provision drafts
        self.structured_llm = self.llm.with_structured_output(ProvisionDraftOutput)

        # Sources service for document management
        self.sources_service = SourcesService()

    async def generate_research_prompt(
        self,
        input_description: str,
        entity_name: str,
        entity_language: str,
    ) -> Dict[str, str]:
        """
        Transform user's quick research topic into a detailed research prompt.

        This is an inline LLM call (not a separate agent).

        Args:
            input_description: User's quick hint (e.g., "Ownership of ATM Spa")
            entity_name: Name of the political entity
            entity_language: BCP 47 language tag (e.g., 'it-IT', 'en-US')

        Returns:
            Dict with 'research_prompt' and 'reasoning'
        """
        system_prompt = f"""You transform brief research topics into detailed research prompts for researching public policy provisions.

Given a short description of a public policy provision, generate a comprehensive research prompt that will help a research agent find accurate, detailed information.

CRITICAL: The research prompt you generate MUST be written entirely in the language specified by the BCP 47 tag: {entity_language}
This means the entire output text must be in that language (e.g., 'it-IT' = Italian, 'de-DE' = German, 'fr-FR' = French, 'es-ES' = Spanish, 'en-US' = English).

The research prompt should:
1. Clearly state that the whole research (search keywords, results, summaries) must be performed in {entity_language}
2. Clearly identify what needs to be researched
3. Specify the political entity context
4. Mention key aspects: legal status, history, current state, stakeholders, financial details

A provision is a distinct policy instrument that a government entity uses to intervene in public life. It represents the mechanism itself, not its specific parameters, zones, or implementation details. See app/src/lib/db/schema/government.ts for the full definition and test criteria.

Keep the prompt focused and under 200 words. Write in a concise, clear, professional tone - all in the {entity_language} language."""

        user_message = f"""Transform this into a research prompt:

Topic: {input_description}
Political Entity: {entity_name}
Language: {entity_language}

Generate a detailed research prompt in {entity_language} that will guide comprehensive research on this provision."""

        # Use LangChain's invoke with system and user messages
        messages = [
            ("system", system_prompt),
            ("user", user_message)
        ]

        response = await self.llm.ainvoke(messages)

        return {
            "research_prompt": response.content,
            "reasoning": f"Generated from topic: {input_description}"
        }

    async def generate_provision_draft(
        self,
        research_summary: str,
        entity_name: str,
        input_description: str
    ) -> Dict[str, Any]:
        """
        Generate provision draft content from research summary.

        This is an inline LLM call (not a separate agent) using structured output.

        Args:
            research_summary: Summary from research agent
            entity_name: Name of the political entity
            input_description: Original user input for context

        Returns:
            Dict with title, descriptions, summary, provision_type, relevance, confidence, source_urls
        """
        system_prompt = """You generate structured provision drafts from research summaries.

A provision is a distinct policy instrument that a government entity uses to intervene in public life. There are 7 types:
- ownership: Stakes in companies, property, infrastructure
- contract: Service agreements, concessions, partnerships
- regulation: Rules, ordinances, codes, standards
- taxation: Taxes, fees, tariffs
- allocation: Programs, subsidies, budgets, funds
- designation: Zones, landmarks, protected areas, institutions
- infrastructure: Public works, utilities, transportation networks, digital systems

Given research findings, extract and structure the provision information according to the schema.

CRITICAL CHARACTER LIMITS (will fail validation if exceeded):
- description_short: MAXIMUM 100 characters (one short sentence)
- description: MAXIMUM 1000 characters (2-3 paragraphs explaining the provision)
- summary_md: MAXIMUM 20000 characters (full markdown with sections)

OTHER CONSTRAINTS:
- provision_type_codes is an array that can contain multiple types (e.g., ["ownership", "contract"] for a company stake with service agreements)
- Choose ALL provision types that apply - provisions can have multiple types simultaneously
- All textual fields (tiles, descriptions, summaries etc.) MUST be in the language of the political entity (which is supposed to be the same as the source research summary)
- Ensure all text is factual and based on the research provided

DISPLAY DATA (REQUIRED):
You MUST populate the display_data field with 3-5 key facts extracted from the research summary.
- Extract the most important quantifiable information: financial figures, ownership percentages, key dates, important numbers, budget amounts, etc.
- Format values for easy reading: use currency symbols (€, $), units (km, m², ha), percentages (%)
- Keep labels concise (2-4 words max)

Examples:
- {"label": "Municipality Ownership", "value": "100%"}
- {"label": "Annual Revenue", "value": "€850M"}
- {"label": "Employees", "value": "3,500"}
- {"label": "Founded", "value": "1931"}
- {"label": "Service Area", "value": "125 km²"}
- {"label": "Daily Users", "value": "1.4M"}

The display_data is shown prominently in the UI, so choose the most striking/important facts that give users immediate insight into the provision's scale and significance."""

        user_message = f"""Generate a provision draft from this research:

Original Topic: {input_description}
Political Entity: {entity_name}

Research Summary:
{research_summary}

Generate the structured provision draft."""

        # Use LangChain's structured output
        messages = [
            ("system", system_prompt),
            ("user", user_message)
        ]

        # Invoke with structured output - returns ProvisionDraftOutput Pydantic model
        result: ProvisionDraftOutput = await self.structured_llm.ainvoke(messages)

        # Convert Pydantic model to dict for backwards compatibility
        return result.model_dump()

    async def start_research(
        self,
        research_prompt: str,
        entity_id: Optional[str] = None,
        entity_name: Optional[str] = None,
    ) -> str:
        """
        Start research using the research agent.

        Delegates to research service (loose coupling via API).
        Agent selection is configured in services/research_config.py.

        Args:
            research_prompt: The approved research prompt
            entity_id: Optional entity UUID
            entity_name: Optional entity name for context

        Returns:
            task_id from research agent
        """
        task_id = await create_research_task(
            query=research_prompt,
            entity_id=entity_id,
            entity_name=entity_name,
        )
        return task_id

    async def get_research_results(self, task_id: str) -> Optional[Dict[str, Any]]:
        """
        Get research results from research agent.

        Args:
            task_id: Research task UUID

        Returns:
            Research results including summary
        """
        return await get_task_status(task_id)

    async def promote_research_sources(
        self,
        research_id: UUID,
        threshold: float = 0.6
    ) -> List[UUID]:
        """
        Promote high-quality research sources to sou_documents.

        Args:
            research_id: UUID of the research task
            threshold: Minimum relevance_score to promote (default 0.6)

        Returns:
            List of promoted sou_document IDs
        """
        return await self.sources_service.promote_research_sources(
            research_id=research_id,
            threshold=threshold
        )

    async def link_draft_to_documents(
        self,
        draft_id: UUID,
        document_ids: List[UUID],
        relevance: str = "primary"
    ) -> None:
        """
        Create propl_draft_documents entries linking a draft to source documents.

        Args:
            draft_id: UUID of the provision draft
            document_ids: List of sou_document UUIDs
            relevance: Relevance level ('primary', 'supporting', 'reference')
        """
        await self.sources_service.link_draft_to_documents(
            draft_id=draft_id,
            document_ids=document_ids,
            relevance=relevance
        )


# Global instance
_provision_service: Optional[ProvisionService] = None


def get_provision_service() -> ProvisionService:
    global _provision_service
    if _provision_service is None:
        _provision_service = ProvisionService()
    return _provision_service
