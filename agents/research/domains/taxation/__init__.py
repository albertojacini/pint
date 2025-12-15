"""Taxation research domain.

Researches taxes, fees, tariffs, and other fiscal instruments.
"""

from .models import TaxationOutput, TaxationResearchError

# Domain configuration
DOMAIN_NAME = "Tax Policy Research"

# Models exported for the domain loader
OutputModel = TaxationOutput
ErrorModel = TaxationResearchError

# Template for wrapping user description in a research request
USER_MESSAGE_TEMPLATE = """Research the following tax/fee/tariff:

**Description**: {description}"""
