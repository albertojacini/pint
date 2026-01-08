"""Event ingestion agents for processing sources and generating candidates.

This module provides two agents:
1. SourceProcessor: Analyzes source content and extracts structured data
2. CandidateGenerator: Creates event candidates from processed sources
"""

import asyncio
import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage

from agents.event_ingestion.config import MAIN_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS
from agents.event_ingestion.tools import get_source_processor_tools, get_candidate_generator_tools
from agents.utils.ei_db_tools import get_ei_db_tools

# Paths
PROMPTS_DIR = Path(__file__).parent / "prompts"

# Load environment variables from backend root
backend_dir = Path(__file__).parent.parent.parent
load_dotenv(backend_dir / ".env")


def load_prompt(filename: str) -> str:
    """Load a prompt from the prompts directory."""
    prompt_path = PROMPTS_DIR / filename
    with open(prompt_path, "r", encoding="utf-8") as f:
        return f.read().strip()


async def process_source(source_id: str) -> dict:
    """
    Process a single source: analyze content and extract structured data.

    Args:
        source_id: UUID of the source to process

    Returns:
        dict with status and any error message
    """
    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise ValueError("ANTHROPIC_API_KEY not found")

    db_tools = get_ei_db_tools()
    await db_tools.connect()

    try:
        # Get source
        source = await db_tools.get_source(source_id)
        if not source:
            return {"status": "error", "error": f"Source not found: {source_id}"}

        if not source.get('raw_content'):
            return {"status": "error", "error": "Source has no content"}

        # Mark as processing
        await db_tools.update_source(source_id, processing_status='processing')

        # Load prompt and create model
        system_prompt = load_prompt("source_processor.md")
        model = ChatAnthropic(
            model=MAIN_MODEL,
            temperature=DEFAULT_TEMPERATURE,
            max_tokens=DEFAULT_MAX_TOKENS
        )

        # Bind tools
        tools = get_source_processor_tools()
        model_with_tools = model.bind_tools(tools)

        # Create message with source info
        user_message = f"""Process the following source:

Source ID: {source_id}
Title: {source.get('title', 'Untitled')}
Source Type: {source.get('source_type', 'unknown')}
URL: {source.get('url', 'N/A')}

Use GetSource to read the full content, then analyze and update with your findings."""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_message)
        ]

        # Run agent loop (tool calling)
        max_iterations = 5
        for _ in range(max_iterations):
            response = await model_with_tools.ainvoke(messages)
            messages.append(response)

            # Check for tool calls
            if not response.tool_calls:
                break

            # Execute tool calls
            for tool_call in response.tool_calls:
                tool_name = tool_call["name"]
                tool_args = tool_call["args"]

                # Find and execute tool
                tool = next((t for t in tools if t.name == tool_name), None)
                if tool:
                    result = await tool.ainvoke(tool_args)
                    from langchain_core.messages import ToolMessage
                    messages.append(ToolMessage(
                        content=str(result),
                        tool_call_id=tool_call["id"]
                    ))

        return {"status": "success", "source_id": source_id}

    except Exception as e:
        # Mark as failed (back to unprocessed)
        await db_tools.update_source(source_id, processing_status='unprocessed')
        return {"status": "error", "error": str(e)}

    finally:
        await db_tools.close()


async def generate_candidate(source_ids: list[str]) -> dict:
    """
    Generate an event candidate from one or more processed sources.

    Args:
        source_ids: List of source UUIDs to create candidate from

    Returns:
        dict with status, candidate_id (if created), and any error message
    """
    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise ValueError("ANTHROPIC_API_KEY not found")

    if not source_ids:
        return {"status": "error", "error": "No source IDs provided"}

    db_tools = get_ei_db_tools()
    await db_tools.connect()

    try:
        # Verify sources exist and are processed
        sources_info = []
        for sid in source_ids:
            source = await db_tools.get_source(sid)
            if not source:
                return {"status": "error", "error": f"Source not found: {sid}"}
            if source.get('processing_status') != 'processed':
                return {"status": "error", "error": f"Source {sid} is not processed yet"}
            sources_info.append({
                "id": sid,
                "title": source.get('title'),
                "ai_summary": source.get('ai_summary'),
                "ai_extracted_data": source.get('ai_extracted_data')
            })

        # Load prompt and create model
        system_prompt = load_prompt("candidate_generator.md")
        model = ChatAnthropic(
            model=MAIN_MODEL,
            temperature=DEFAULT_TEMPERATURE,
            max_tokens=DEFAULT_MAX_TOKENS
        )

        # Bind tools
        tools = get_candidate_generator_tools()
        model_with_tools = model.bind_tools(tools)

        # Create message with sources info
        sources_text = "\n\n".join([
            f"### Source: {s['title']}\n- ID: {s['id']}\n- Summary: {s['ai_summary']}\n- Extracted: {s['ai_extracted_data']}"
            for s in sources_info
        ])

        user_message = f"""Create an event candidate from these sources:

{sources_text}

Steps:
1. Use GetSource to read full details if needed
2. Use SearchEntities to find the political entity
3. Use SearchProvisions to find affected provisions
4. Use CreateCandidate to create the event
5. Use CreateCandidateChange to propose changes to affected provisions

Source IDs to use: {source_ids}"""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_message)
        ]

        # Run agent loop
        max_iterations = 10
        candidate_id = None

        for _ in range(max_iterations):
            response = await model_with_tools.ainvoke(messages)
            messages.append(response)

            # Check for tool calls
            if not response.tool_calls:
                break

            # Execute tool calls
            for tool_call in response.tool_calls:
                tool_name = tool_call["name"]
                tool_args = tool_call["args"]

                # Find and execute tool
                tool = next((t for t in tools if t.name == tool_name), None)
                if tool:
                    result = await tool.ainvoke(tool_args)

                    # Capture candidate_id if created
                    if tool_name == "CreateCandidate" and "Created candidate" in str(result):
                        # Extract ID from "Created candidate UUID..."
                        parts = str(result).split()
                        if len(parts) >= 3:
                            candidate_id = parts[2]

                    from langchain_core.messages import ToolMessage
                    messages.append(ToolMessage(
                        content=str(result),
                        tool_call_id=tool_call["id"]
                    ))

        if candidate_id:
            return {"status": "success", "candidate_id": candidate_id}
        else:
            return {"status": "no_candidate", "message": "Agent did not create a candidate"}

    except Exception as e:
        return {"status": "error", "error": str(e)}

    finally:
        await db_tools.close()


# CLI entry point for testing
if __name__ == "__main__":
    import sys

    async def main():
        if len(sys.argv) < 3:
            print("Usage:")
            print("  python -m agents.event_ingestion.agent process <source_id>")
            print("  python -m agents.event_ingestion.agent generate <source_id> [source_id2 ...]")
            return

        command = sys.argv[1]

        if command == "process":
            source_id = sys.argv[2]
            print(f"Processing source: {source_id}")
            result = await process_source(source_id)
            print(f"Result: {result}")

        elif command == "generate":
            source_ids = sys.argv[2:]
            print(f"Generating candidate from sources: {source_ids}")
            result = await generate_candidate(source_ids)
            print(f"Result: {result}")

        else:
            print(f"Unknown command: {command}")

    asyncio.run(main())
