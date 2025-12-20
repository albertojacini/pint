"""Configuration for claude ownership research agent."""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Base directory for this agent
BASE_DIR = Path(__file__).parent

# Output directory (per-agent subdirectory)
OUTPUT_DIR = BASE_DIR.parent.parent / "output" / "claude"
OUTPUT_DIR.mkdir(exist_ok=True, parents=True)

# API configuration (uses ANTHROPIC_API_KEY from environment)
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

if not ANTHROPIC_API_KEY:
    raise ValueError("ANTHROPIC_API_KEY not found in environment")
