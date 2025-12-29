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

import json
from typing import Optional, Dict, Any, Literal

from anthropic import Anthropic

from services.research import create_research_task, get_task_status, run_research_job


class ProvisionService:
    """Service for provision drafting workflow."""

    def __init__(self):
        self.client = Anthropic()

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
1. Clearly identify what needs to be researched
2. Specify the political entity context
3. List 3-5 specific questions to investigate
4. Mention key aspects: legal status, history, current state, stakeholders, financial details

A provision is a piece of state infrastructure: laws, regulations, contracts, ownership stakes, allocations, or designations that a political entity maintains.

Keep the prompt focused and under 500 words. Write in a clear, professional tone."""

        user_message = f"""Transform this into a research prompt:

Topic: {input_description}
Political Entity: {entity_name}

Generate a detailed research prompt that will guide comprehensive research on this provision."""

        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}]
        )

        return {
            "research_prompt": response.content[0].text,
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

        This is an inline LLM call (not a separate agent).

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

Given research findings, extract and structure the provision information.

Respond with valid JSON only (no markdown code blocks, no extra text):
{
  "title": "Official name of the provision (clear, concise)",
  "description_short": "One-sentence summary (STRICT LIMIT: exactly 100 characters or less)",
  "description": "Detailed description explaining what this provision is (max 1000 chars)",
  "summary_md": "Full markdown summary with sections: Overview, Key Details, History, Current Status (max 20000 chars)",
  "provision_type": "one of: ownership, contract, regulation, taxation, allocation, designation",
  "relevance": 0-10 (how important is this provision to the entity),
  "confidence": 0.0-1.0 (confidence in accuracy of information),
  "source_urls": ["list", "of", "source", "urls"]
}

CRITICAL CONSTRAINTS:
- description_short MUST be 100 characters or less (hard database constraint - will fail if longer)
- Choose the provision_type that best matches the nature of what's being described
- Ensure all text is factual and based on the research provided"""

        user_message = f"""Generate a provision draft from this research:

Original Topic: {input_description}
Political Entity: {entity_name}

Research Summary:
{research_summary}

Generate the structured provision draft as JSON."""

        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}]
        )

        # Parse JSON response
        response_text = response.content[0].text.strip()
        # Handle case where response might be wrapped in markdown code block
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            response_text = "\n".join(lines[1:-1])

        result = json.loads(response_text)

        # Enforce database constraint: description_short must be <= 100 chars
        if "description_short" in result and len(result["description_short"]) > 100:
            # Truncate to 97 chars and add ellipsis
            result["description_short"] = result["description_short"][:97] + "..."

        return result

    async def start_research(
        self,
        research_prompt: str,
        entity_id: Optional[str] = None,
        entity_name: Optional[str] = None,
        agent_type: Literal["claude", "lcdeep"] = "claude"
    ) -> str:
        """
        Start research using the research agent.

        Delegates to research service (loose coupling via API).

        Args:
            research_prompt: The approved research prompt
            entity_id: Optional entity UUID
            entity_name: Optional entity name for context
            agent_type: Which agent to use - "claude" or "lcdeep"

        Returns:
            task_id from research agent
        """
        task_id, _agent_type = await create_research_task(
            query=research_prompt,
            entity_id=entity_id,
            entity_name=entity_name,
            agent_type=agent_type
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
