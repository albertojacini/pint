"""CLI entry point for the taxation research agent."""

import argparse
import asyncio
import json
import os
import re
from datetime import datetime

from taxation_research.agent import create_taxation_research_agent
from taxation_research.config import OUTPUT_DIR
from taxation_research.models import TaxationOutput, TaxationResearchError


def slugify(text: str) -> str:
    """Convert text to a URL-friendly slug."""
    return re.sub(r'[^a-z0-9]+', '_', text.lower())[:50].strip('_')


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


def save_result(result: dict, description: str) -> str:
    """Save result to output directory and return filepath."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    desc_slug = slugify(description)

    filename = f'{desc_slug}_{timestamp}.json'
    filepath = os.path.join(OUTPUT_DIR, filename)

    with open(filepath, 'w') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    return filepath


async def run_agent(description: str, debug: bool = False) -> dict | None:
    """
    Run the taxation research agent.

    Args:
        description: Description of the tax to research

    Returns:
        The research result or error object, or None if extraction failed
    """
    print(f"\n{'='*60}")
    print(f"Taxation Research Agent")
    print(f"{'='*60}")
    print(f"Description: {description}")
    print(f"{'='*60}\n")

    # Create the agent
    agent, mcp_client = await create_taxation_research_agent(debug=debug)

    # Prepare the user message
    user_message = f"""Research the following tax/fee/tariff:

**Description**: {description}"""

    # Run the agent
    result = await agent.ainvoke({
        "messages": [{"role": "user", "content": user_message}]
    })

    # Extract the final message content
    messages = result.get("messages", [])
    final_message = messages[-1] if messages else None

    if final_message:
        print("\n" + "="*60)
        print("Agent Response:")
        print("="*60)
        content = final_message.content if hasattr(final_message, 'content') else str(final_message)
        print(content)

        # Try to get structured output first
        if hasattr(final_message, 'parsed') and final_message.parsed:
            print(f"Returning structured response: {final_message.parsed}")
            parsed = final_message.parsed
            if isinstance(parsed, (TaxationOutput, TaxationResearchError)):
                return parsed.model_dump()
            return parsed

        # Check if result has structured_response attribute (deepagents pattern)
        if hasattr(result, 'structured_response') and result.structured_response:
            print(f"Found structured_response: {result.structured_response}")
            sr = result.structured_response
            if isinstance(sr, (TaxationOutput, TaxationResearchError)):
                return sr.model_dump()
            return sr

        # Check result dict for structured output
        if 'structured_response' in result:
            print(f"Found structured_response in result dict")
            sr = result['structured_response']
            if isinstance(sr, (TaxationOutput, TaxationResearchError)):
                return sr.model_dump()
            if hasattr(sr, 'model_dump'):
                return sr.model_dump()
            return sr

        # Fallback to regex extraction
        return extract_json_from_response(content)

    return None


async def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Research taxes using AI"
    )
    parser.add_argument(
        "--description", "-d",
        required=True,
        help="Description of the tax to research (e.g., 'Milan tourist tax')"
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable debug mode for the agent"
    )

    args = parser.parse_args()

    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Run the agent
    result = await run_agent(args.description, debug=args.debug)

    print("\n" + "="*60)

    if result:
        if "error" in result:
            print("Error:")
            print(json.dumps(result, indent=2))
            filepath = save_result(result, args.description)
            print(f"\nError saved to: {filepath}")
        else:
            filepath = save_result(result, args.description)
            print("Success!")
            print(f"Result saved to: {filepath}")
    else:
        print("Failed to extract result from agent response.")

    print("="*60)


if __name__ == "__main__":
    asyncio.run(main())
