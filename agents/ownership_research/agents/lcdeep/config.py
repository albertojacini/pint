"""Configuration for lcdeep ownership research agent."""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# API Keys
BRIGHTDATA_API_KEY = os.getenv("BRIGHTDATA_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# Base directory for this agent
BASE_DIR = Path(__file__).parent

# Output directory (per-agent subdirectory)
OUTPUT_DIR = BASE_DIR.parent.parent / "output" / "lcdeep"
OUTPUT_DIR.mkdir(exist_ok=True, parents=True)
