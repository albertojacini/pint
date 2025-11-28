"""Configuration for the provision generator agent."""

import os

# Goldmine URLs - high-value pages likely to contain provisions
GOLDMINE_URLS = [
    # Ownership - società partecipate
    "https://www.comune.milano.it/aree-tematiche/finanza-e-partecipate/societa-ed-enti-partecipati",
    # Taxation - tributi
    "https://www.comune.milano.it/aree-tematiche/tributi",
    # Taxation - parking
    "https://www.comune.milano.it/aree-tematiche/mobilita/sosta-e-parcheggi",
    # Regulation - regolamenti
    "https://www.comune.milano.it/comune/regolamenti",
    # Regulation - urbanistica
    "https://www.comune.milano.it/aree-tematiche/urbanistica-ed-edilizia",
    # Designation - Area B
    "https://www.comune.milano.it/aree-tematiche/mobilita/area-b",
    # Designation - Area C
    "https://www.comune.milano.it/aree-tematiche/mobilita/area-c",
    # Allocation - bandi
    "https://www.comune.milano.it/servizi/bandi-e-gare",
    # Allocation - cultura
    "https://www.comune.milano.it/aree-tematiche/cultura",
    # Contract - servizi erogati
    "https://www.comune.milano.it/comune/amministrazione-trasparente",
]

# Database
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
)

# LLM
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# BrightData
BRIGHTDATA_API_TOKEN = os.getenv("BRIGHTDATA_API_TOKEN")
