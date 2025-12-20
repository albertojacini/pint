"""Claude SDK agent for ownership research."""

import sys
import os
from pathlib import Path
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions
import re
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ownership_research_sdk.models import OwnershipOutput, OwnershipResearchError


def load_prompt(filename: str) -> str:
    """Load prompt from prompts directory."""
    prompt_path = Path(__file__).parent / "prompts" / filename
    return prompt_path.read_text()


def extract_json_from_response(content: str) -> dict | None:
    """
    Extract JSON object from agent response text.

    Tries multiple patterns to find JSON in the response.
    Reused from api/services/research.py for consistency.
    """
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


def extract_structured_output(messages) -> dict | None:
    """
    Extract JSON from AssistantMessage text blocks.

    Args:
        messages: List of messages from client.receive_response()

    Returns:
        Validated dict (from OwnershipOutput or OwnershipResearchError) or None
    """
    full_text = ""

    # Accumulate all text from AssistantMessage blocks
    for message in messages:
        # Check message type by class name (avoid circular import issues)
        if type(message).__name__ == "AssistantMessage":
            # Extract text from content blocks
            if hasattr(message, 'content'):
                for block in message.content:
                    if type(block).__name__ == "TextBlock":
                        full_text += block.text

    if not full_text:
        return None

    # Extract JSON using regex patterns
    json_data = extract_json_from_response(full_text)

    if json_data:
        # Validate with Pydantic models
        try:
            if "error" in json_data:
                validated = OwnershipResearchError(**json_data)
            else:
                validated = OwnershipOutput(**json_data)
            return validated.model_dump()
        except Exception as e:
            print(f"⚠️  Validation error: {e}")
            # Return raw JSON if validation fails (for debugging)
            return json_data

    return None


async def run_ownership_research_sdk(
    description: str,
    debug: bool = False
) -> dict | None:
    """
    Run ownership research using Claude SDK with built-in tools only.

    Args:
        description: Public asset description to research
        debug: Enable debug logging

    Returns:
        OwnershipOutput or OwnershipResearchError as dict, or None if extraction failed
    """
    system_prompt = load_prompt("system_prompt.md")

    # Configure Claude SDK options
    options = ClaudeAgentOptions(
        system_prompt=system_prompt,
        allowed_tools=["WebSearch", "WebFetch"],  # SDK built-in tools only
        permission_mode="bypassPermissions",  # Auto-approve tools for research
        model="claude-sonnet-4-5-20250929",  # Latest Sonnet model
    )

    # Build user message
    user_message = f"""Research the following public asset/holding:

**Description**: {description}

Your task is to:
1. Use WebSearch to find authoritative sources (official sites, Wikipedia, annual reports)
2. Use WebFetch to extract detailed information from the most promising sources
3. Synthesize all findings into a complete OwnershipOutput JSON object

Return a JSON object matching the OwnershipOutput schema, or an OwnershipResearchError if the research cannot be completed."""

    if debug:
        print(f"\n{'='*80}")
        print("SYSTEM PROMPT (first 300 chars):")
        print(f"{system_prompt[:300]}...")
        print(f"\n{'='*80}")
        print("USER MESSAGE:")
        print(user_message)
        print(f"{'='*80}\n")

    # Run agent with streaming
    messages = []

    try:
        async with ClaudeSDKClient(options=options) as client:
            await client.query(user_message)

            if debug:
                print("📡 Receiving response...\n")

            async for message in client.receive_response():
                messages.append(message)

                # Print debug info for interesting message types
                if debug:
                    msg_type = type(message).__name__
                    if msg_type == "AssistantMessage":
                        for block in message.content if hasattr(message, 'content') else []:
                            if type(block).__name__ == "TextBlock":
                                text = block.text[:200] if len(block.text) > 200 else block.text
                                print(f"💬 Assistant: {text}...")
                    elif msg_type == "ToolUseMessage":
                        tool_name = message.name if hasattr(message, 'name') else 'unknown'
                        print(f"🔧 Tool: {tool_name}")

    except Exception as e:
        print(f"❌ Error during agent execution: {e}")
        if debug:
            import traceback
            traceback.print_exc()
        return None

    if debug:
        print(f"\n{'='*80}")
        print(f"📊 Received {len(messages)} messages")
        print(f"{'='*80}\n")

    # Extract and return structured output
    result = extract_structured_output(messages)

    if debug and result:
        print("✅ Extracted structured output:")
        print(json.dumps(result, indent=2, ensure_ascii=False)[:500])
        print("...\n")

    return result
