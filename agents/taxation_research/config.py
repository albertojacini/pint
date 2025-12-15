"""Configuration for taxation research agent."""

import os
from dotenv import load_dotenv

load_dotenv()

# API Keys
BRIGHTDATA_API_KEY = os.getenv("BRIGHTDATA_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# Output directory (relative to this file)
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
