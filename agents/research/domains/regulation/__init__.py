"""Regulation research domain.

Researches laws, regulations, ordinances, and other regulatory frameworks.
"""

from .models import RegulationOutput, RegulationResearchError

# Domain configuration
DOMAIN_NAME = "Regulation Research"

# Models exported for the domain loader
OutputModel = RegulationOutput
ErrorModel = RegulationResearchError

# Template for wrapping user description in a research request
USER_MESSAGE_TEMPLATE = """Research the following regulation/legislation:

**Description**: {description}"""
