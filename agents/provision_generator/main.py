"""CLI entry point for the provision generator agent."""

import argparse
import asyncio
import json
import os
import re
from datetime import datetime

from provision_generator.agent import create_provision_generator_agent
from provision_generator.config import OUTPUT_DIR


def slugify(text: str) -> str:
    """Convert text to a URL-friendly slug."""
    return re.sub(r'[^a-z0-9]+', '_', text.lower())[:30].strip('_')


def extract_json_from_response(content: str) -> dict | None:
    """Extract JSON object from agent response text."""
    # Try to find JSON in code blocks first
    json_match = re.search(r'```(?:json)?\s*(\{[\s\S]*?\})\s*```', content)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError:
            pass

    # Try to find raw JSON object
    json_match = re.search(r'(\{[\s\S]*"entityId"[\s\S]*\})', content)
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


def save_provision(provision: dict, entity: str) -> str:
    """Save provision to output directory and return filepath."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    entity_slug = slugify(entity)
    provision_type = provision.get('type', 'unknown')

    filename = f'{entity_slug}_{provision_type}_{timestamp}.json'
    filepath = os.path.join(OUTPUT_DIR, filename)

    with open(filepath, 'w') as f:
        json.dump(provision, f, indent=2, ensure_ascii=False)

    return filepath


async def run_agent(description: str, entity: str) -> dict | None:
    """
    Run the provision generator agent.

    Args:
        description: Short description of the provision to search for
        entity: Name of the political entity

    Returns:
        The generated provision or error object, or None if extraction failed
    """
    print(f"\n{'='*60}")
    print(f"Provision Generator Agent")
    print(f"{'='*60}")
    print(f"Description: {description}")
    print(f"Entity: {entity}")
    print(f"{'='*60}\n")

    # Create the agent
    agent, mcp_client = await create_provision_generator_agent()

    # Prepare the user message
    user_message = f"""Find and document the following provision:

**Provision Description**: {description}
**Political Entity**: {entity}

Please follow your workflow:
1. Classify the provision type
2. Research general information using the general-researcher subagent
3. Research type-specific details using the type-researcher subagent
4. Validate and structure the output

IMPORTANT: At the end, output the final provision as a JSON object in a code block like this:
```json
{{
  "entityId": "placeholder-uuid",
  "title": "...",
  "description": "...",
  "type": "...",
  "status": "...",
  "effectiveFrom": "...",
  "effectiveUntil": null,
  "extraData": {{ ... }},
  "sourceUrls": ["..."],
  "confidence": 0.0
}}
```

If you cannot find reliable information or the description doesn't describe a valid provision, output an error JSON:
```json
{{
  "error": "ERROR_CODE",
  "reason": "...",
  "suggestions": ["..."]
}}
```"""

    # Run the agent (MCP client no longer needs context manager)
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

        # Extract JSON from response
        provision_data = extract_json_from_response(content)
        return provision_data

    return None


async def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Generate provision documentation using AI research"
    )
    parser.add_argument(
        "--description", "-d",
        required=True,
        help="Short description of the provision (e.g., 'Milan congestion charge')"
    )
    parser.add_argument(
        "--entity", "-e",
        required=True,
        help="Political entity name (e.g., 'Comune di Milano')"
    )

    args = parser.parse_args()

    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Run the agent
    provision_data = await run_agent(args.description, args.entity)

    print("\n" + "="*60)

    if provision_data:
        if "error" in provision_data:
            print("Error:")
            print(json.dumps(provision_data, indent=2))
            # Still save error to output
            filepath = save_provision(provision_data, args.entity)
            print(f"\nError saved to: {filepath}")
        else:
            filepath = save_provision(provision_data, args.entity)
            print("Success!")
            print(f"Provision saved to: {filepath}")
    else:
        print("Failed to extract provision data from agent response.")
        print("Check the agent output above for details.")

    print("="*60)


if __name__ == "__main__":
    asyncio.run(main())
