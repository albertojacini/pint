"""Domain loader for research agents.

Each domain provides:
- OutputModel: Pydantic model for successful research output
- ErrorModel: Pydantic model for error responses
- system_prompt: The system prompt text for the agent
- domain_name: Human-readable name for the domain
- user_message_template: Template for wrapping user description
"""

import importlib
from pathlib import Path
from typing import Type, Union
from pydantic import BaseModel


# Available domains (maps CLI arg to module name)
AVAILABLE_DOMAINS = {
    "regulation": "regulation",
    "taxation": "taxation",
    "ownership": "ownership",
}


class DomainConfig:
    """Configuration loaded from a domain module."""

    def __init__(
        self,
        name: str,
        output_model: Type[BaseModel],
        error_model: Type[BaseModel],
        system_prompt: str,
        user_message_template: str,
    ):
        self.name = name
        self.output_model = output_model
        self.error_model = error_model
        self.system_prompt = system_prompt
        self.user_message_template = user_message_template

    @property
    def response_format(self):
        """Return Union type for structured output."""
        return Union[self.output_model, self.error_model]


def load_domain(domain_key: str) -> DomainConfig:
    """
    Load a domain module and return its configuration.

    Args:
        domain_key: The domain identifier (e.g., 'regulation', 'taxation')

    Returns:
        DomainConfig with all domain-specific settings

    Raises:
        ValueError: If domain is not found
    """
    if domain_key not in AVAILABLE_DOMAINS:
        available = ", ".join(AVAILABLE_DOMAINS.keys())
        raise ValueError(f"Unknown domain '{domain_key}'. Available: {available}")

    module_name = AVAILABLE_DOMAINS[domain_key]

    # Import the domain module
    domain_module = importlib.import_module(f"research.domains.{module_name}")

    # Load system prompt from file
    prompt_path = Path(__file__).parent / module_name / "prompts" / "system_prompt.md"
    system_prompt = prompt_path.read_text()

    return DomainConfig(
        name=domain_module.DOMAIN_NAME,
        output_model=domain_module.OutputModel,
        error_model=domain_module.ErrorModel,
        system_prompt=system_prompt,
        user_message_template=domain_module.USER_MESSAGE_TEMPLATE,
    )


def list_domains() -> list[str]:
    """Return list of available domain keys."""
    return list(AVAILABLE_DOMAINS.keys())
