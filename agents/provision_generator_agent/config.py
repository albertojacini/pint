"""Configuration for the provision generator agent."""

import os

# Database
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
)

# LLM
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# BrightData
BRIGHTDATA_API_TOKEN = os.getenv("BRIGHTDATA_API_TOKEN")
