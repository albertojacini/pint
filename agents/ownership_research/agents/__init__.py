"""Agent registry and interface definition."""
from typing import Protocol, Any


class AgentRunner(Protocol):
    """Standard interface for all agent implementations."""

    async def run(self, description: str, debug: bool = False) -> dict[str, Any]:
        """
        Run the agent on a description.

        Args:
            description: Public asset description to research
            debug: Enable debug logging

        Returns:
            Result dict (OwnershipOutput or OwnershipResearchError as dict)
        """
        ...


# Registry
_AGENTS: dict[str, AgentRunner] = {}


def register_agent(name: str, runner: AgentRunner):
    """Register an agent implementation."""
    _AGENTS[name] = runner


def get_agent(name: str) -> AgentRunner:
    """Get agent runner by name."""
    if name not in _AGENTS:
        available = list_agents()
        raise ValueError(
            f"Unknown agent: {name}. Available: {available if available else 'none (agents not yet registered)'}"
        )
    return _AGENTS[name]


def list_agents() -> list[str]:
    """List all registered agents."""
    return list(_AGENTS.keys())


# Auto-register implementations on import
# NOTE: These imports will be activated after agent migration in steps 5-6
try:
    from ownership_research.agents.lcdeep.agent import lcdeep_runner
    from ownership_research.agents.claude.agent import claude_runner

    register_agent("lcdeep", lcdeep_runner)
    register_agent("claude", claude_runner)
except ImportError:
    # Agents not yet migrated - registry will be empty until steps 5-6 complete
    pass
