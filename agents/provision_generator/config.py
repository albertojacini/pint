"""Configuration for provision generator agent."""

import os
from dotenv import load_dotenv

load_dotenv()

# API Keys
BRIGHTDATA_API_KEY = os.getenv("BRIGHTDATA_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# Model configuration
DEFAULT_MODEL = "claude-sonnet-4-5-20250929"

# Output directory (relative to this file)
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
