"""Provision drafting workflow service with inline LLM calls.

SCOPE: Provision business logic and orchestration
------------------------------------------------------
This service is responsible for:
- Generating research prompts from user input (inline LLM)
- Orchestrating research agents for information gathering
- Generating provision drafts from research summaries (inline LLM)
- Making ALL provision-specific decisions:
  * provision_type (ownership, contract, regulation, etc.)
  * relevance scores (0-10)
  * confidence scores (0.0-1.0)
  * structuring data for provision schema
  * enforcing business constraints (e.g., character limits)

This service acts as the orchestration layer between:
- User input (via API routes)
- Research agents (domain-agnostic information gathering)
- Database (persistence)

The research agents provide raw information; this service transforms it into
structured provisions with all necessary metadata and business logic applied.
"""

from typing import Optional, Dict, Any

from langchain.chat_models import init_chat_model

from models.provisions import ProvisionDraftOutput 
from services.research import create_research_task, get_task_status
from services.research_config import RESEARCH_AGENT


class ProvisionService:
    """Service for provision drafting workflow."""

    def __init__(self):
        # Initialize LangChain chat model for Anthropic
        self.llm = init_chat_model(
            model=RESEARCH_AGENT,
            model_provider="anthropic"
        )

        # Create structured output model for provision drafts
        self.structured_llm = self.llm.with_structured_output(ProvisionDraftOutput)

    async def generate_research_prompt(
        self,
        input_description: str,
        entity_name: str,
    ) -> Dict[str, str]:
        """
        Transform user's quick research topic into a detailed research prompt.

        This is an inline LLM call (not a separate agent).

        Args:
            input_description: User's quick hint (e.g., "Ownership of ATM Spa")
            entity_name: Name of the political entity

        Returns:
            Dict with 'research_prompt' and 'reasoning'
        """
        system_prompt = """You transform brief research topics into detailed research prompts for researching public policy provisions.

Given a short description of a public policy provision, generate a comprehensive research prompt that will help a research agent find accurate, detailed information.

The research prompt should:
1. Clearly state the language the whole research (search keywords, results, summaries) must be performed with
2. Clearly identify what needs to be researched
3. Specify the political entity context
4. Mention key aspects: legal status, history, current state, stakeholders, financial details

A provision is a piece of state infrastructure: laws, regulations, contracts, ownership stakes, allocations, or designations that a political entity maintains.

Keep the prompt focused and under 200 words. Write in a concise, clear, professional tone."""

        user_message = f"""Transform this into a research prompt:

Topic: {input_description}
Political Entity: {entity_name}

Generate a detailed research prompt that will guide comprehensive research on this provision."""

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

A provision is a piece of state infrastructure that a political entity maintains. There are 6 types:
- ownership: Stakes in companies, property, infrastructure
- contract: Service agreements, concessions, partnerships
- regulation: Rules, ordinances, codes, standards
- taxation: Taxes, fees, tariffs
- allocation: Programs, subsidies, budgets, funds
- designation: Zones, landmarks, protected areas, institutions

Given research findings, extract and structure the provision information according to the schema.

CRITICAL CONSTRAINTS:
- description_short MUST be 100 characters or less (hard database constraint - will fail if longer)
- provision_type_codes is an array that can contain multiple types (e.g., ["ownership", "contract"] for a company stake with service agreements)
- Choose ALL provision types that apply - provisions can have multiple types simultaneously
- Ensure all text is factual and based on the research provided

DISPLAY DATA:
- Extract 3-5 key facts from the research for the display_data field
- Select the most important/interesting information: financial figures, percentages, key dates, important numbers
- Format values for display: use currency symbols (€, $), units (km, m²), percentages (%), etc.
- Examples: {"label": "Annual Revenue", "value": "€85M"}, {"label": "Ownership", "value": "100%"}, {"label": "Operational Since", "value": "2012"}
- Keep labels concise (2-4 words) and values formatted for easy reading"""

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


# Global instance
_provision_service: Optional[ProvisionService] = None


def get_provision_service() -> ProvisionService:
    global _provision_service
    if _provision_service is None:
        _provision_service = ProvisionService()
    return _provision_service
