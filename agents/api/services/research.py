"""Research service that orchestrates the existing agents."""

import asyncio
import json
import re
from typing import Any

from api.services.job_manager import job_manager, JobStatus


def extract_json_from_response(content: str) -> dict | None:
    """Extract JSON object from agent response text."""
    # Try to find JSON in code blocks first
    json_match = re.search(r'```(?:json)?\s*(\{[\s\S]*?\})\s*```', content)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError:
            pass

    # Try to find raw JSON object with title field
    json_match = re.search(r'(\{[\s\S]*"title"[\s\S]*\})', content)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError:
            pass

    # Try to find error JSON
    json_match = re.search(r'(\{[\s\S]*"error"[\s\S]*\})', content)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError:
            pass

    return None


async def run_taxation_agent(description: str) -> dict[str, Any] | None:
    """Run the taxation research agent."""
    from taxation_research.agent import create_taxation_research_agent
    from taxation_research.models import TaxationOutput, TaxationResearchError

    agent, mcp_client = await create_taxation_research_agent(debug=False)

    user_message = f"""Research the following tax/fee/tariff:

**Description**: {description}"""

    result = await agent.ainvoke({
        "messages": [{"role": "user", "content": user_message}]
    })

    messages = result.get("messages", [])
    final_message = messages[-1] if messages else None

    if final_message:
        content = final_message.content if hasattr(final_message, 'content') else str(final_message)

        # Try structured output first
        if hasattr(final_message, 'parsed') and final_message.parsed:
            parsed = final_message.parsed
            if isinstance(parsed, (TaxationOutput, TaxationResearchError)):
                return parsed.model_dump()
            return parsed

        if 'structured_response' in result:
            sr = result['structured_response']
            if hasattr(sr, 'model_dump'):
                return sr.model_dump()
            return sr

        # Fallback to regex
        return extract_json_from_response(content)

    return None


async def run_regulation_agent(description: str) -> dict[str, Any] | None:
    """Run the regulation research agent."""
    from regulation_research.agent import create_regulation_research_agent
    from regulation_research.models import RegulationOutput, RegulationResearchError

    agent, mcp_client = await create_regulation_research_agent(debug=False)

    user_message = f"""Research the following regulation/ordinance/code:

**Description**: {description}"""

    result = await agent.ainvoke({
        "messages": [{"role": "user", "content": user_message}]
    })

    messages = result.get("messages", [])
    final_message = messages[-1] if messages else None

    if final_message:
        content = final_message.content if hasattr(final_message, 'content') else str(final_message)

        if hasattr(final_message, 'parsed') and final_message.parsed:
            parsed = final_message.parsed
            if isinstance(parsed, (RegulationOutput, RegulationResearchError)):
                return parsed.model_dump()
            return parsed

        if 'structured_response' in result:
            sr = result['structured_response']
            if hasattr(sr, 'model_dump'):
                return sr.model_dump()
            return sr

        return extract_json_from_response(content)

    return None


async def run_ownership_agent(description: str) -> dict[str, Any] | None:
    """Run the ownership research agent."""
    from ownership_research.agent import create_ownership_research_agent
    from ownership_research.models import OwnershipOutput, OwnershipResearchError

    agent, mcp_client = await create_ownership_research_agent(debug=False)

    user_message = f"""Research the following public ownership/asset:

**Description**: {description}"""

    result = await agent.ainvoke({
        "messages": [{"role": "user", "content": user_message}]
    })

    messages = result.get("messages", [])
    final_message = messages[-1] if messages else None

    if final_message:
        content = final_message.content if hasattr(final_message, 'content') else str(final_message)

        if hasattr(final_message, 'parsed') and final_message.parsed:
            parsed = final_message.parsed
            if isinstance(parsed, (OwnershipOutput, OwnershipResearchError)):
                return parsed.model_dump()
            return parsed

        if 'structured_response' in result:
            sr = result['structured_response']
            if hasattr(sr, 'model_dump'):
                return sr.model_dump()
            return sr

        return extract_json_from_response(content)

    return None


async def run_research_job(job_id: str):
    """
    Run a research job in the background.

    This function is designed to be run as a background task.
    """
    job = job_manager.get_job(job_id)
    if not job:
        return

    job_manager.update_job_status(job_id, JobStatus.RUNNING)

    try:
        provision_type = job.provision_type
        description = f"{job.description} ({job.entity_name})"

        result = None

        if provision_type == "taxation":
            result = await run_taxation_agent(description)
        elif provision_type == "regulation":
            result = await run_regulation_agent(description)
        elif provision_type == "ownership":
            result = await run_ownership_agent(description)
        else:
            # For unsupported types, return a placeholder error
            job_manager.set_job_error(
                job_id,
                f"Agent for provision type '{provision_type}' is not yet implemented. "
                f"Currently supported: taxation, regulation, ownership."
            )
            return

        if result:
            if "error" in result:
                job_manager.set_job_error(job_id, result.get("reason", str(result)))
            else:
                job_manager.set_job_result(job_id, result)
        else:
            job_manager.set_job_error(job_id, "Agent did not return a valid result")

    except Exception as e:
        job_manager.set_job_error(job_id, str(e))
