"""Research agent configuration.

Configure which research agent to use here by commenting/uncommenting.
Both agents have identical interfaces (run(task_id: str) -> str).
"""

from typing import Literal

# ============================================================================
# AGENT SELECTION - Comment/uncomment to switch
# ============================================================================

# Option 1: Claude SDK research agent (default)
RESEARCH_AGENT: Literal["claude", "lcdeep"] = "claude"

# Option 2: LangChain Deep Agents research agent
# RESEARCH_AGENT: Literal["claude", "lcdeep"] = "lcdeep"
