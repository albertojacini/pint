"""Configuration for ownership research SDK agent."""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Directory paths
BASE_DIR = Path(__file__).parent
OUTPUT_DIR = BASE_DIR / "output"

# Ensure output directory exists
OUTPUT_DIR.mkdir(exist_ok=True)

# API configuration (uses ANTHROPIC_API_KEY from environment)
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

if not ANTHROPIC_API_KEY:
    raise ValueError("ANTHROPIC_API_KEY not found in environment")
