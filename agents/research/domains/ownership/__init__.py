"""Ownership research domain.

Researches public assets, government holdings, and state-owned enterprises.
"""

from .models import OwnershipOutput, OwnershipResearchError

# Domain configuration
DOMAIN_NAME = "Public Asset Research"

# Models exported for the domain loader
OutputModel = OwnershipOutput
ErrorModel = OwnershipResearchError

# Template for wrapping user description in a research request
USER_MESSAGE_TEMPLATE = """Research the following public asset/holding:

**Description**: {description}"""
