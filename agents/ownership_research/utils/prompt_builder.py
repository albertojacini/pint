"""Build agent-specific prompts from shared base + addenda."""
from pathlib import Path


def build_prompt(agent_type: str) -> str:
    """
    Assemble prompt from base + agent-specific addendum.

    Args:
        agent_type: Agent implementation name ('lcdeep' or 'claude')

    Returns:
        Complete prompt string with base knowledge + agent-specific tools/workflow

    Raises:
        FileNotFoundError: If prompt files don't exist
    """
    base_dir = Path(__file__).parent.parent / "prompts"

    base_path = base_dir / "base_prompt.md"
    addendum_path = base_dir / f"{agent_type}_addendum.md"

    if not base_path.exists():
        raise FileNotFoundError(f"Base prompt not found: {base_path}")

    if not addendum_path.exists():
        raise FileNotFoundError(f"Addendum not found for agent '{agent_type}': {addendum_path}")

    base = base_path.read_text()
    addendum = addendum_path.read_text()

    return f"{base}\n\n{addendum}"
