"""Configuration for the search provision resources agent."""

import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
MIN_URL_QUALITY_SCORE = 4  # 0-10 scale
ENABLE_SUBAGENTS = True
ENABLE_SCRAPE_VALIDATION = False  # Set to True to verify URL accessibility (slower but more reliable)
MAX_URLS_PER_CATEGORY = 5
PROVISION_CATEGORIES = [
    "ownership",
    "contract",
    "regulation",
    "taxation",
    "allocation",
    "designation"
]
