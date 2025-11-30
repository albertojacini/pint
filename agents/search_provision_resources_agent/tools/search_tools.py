"""Search tools for finding provision resources."""

from typing import List
from search_provision_resources_agent.models import SearchResult

QUERY_TEMPLATES = {
    "ownership": {
        "it": ["{entity} società partecipate", "{entity} aziende partecipate municipalizzate"],
        "en": ["{entity} owned companies", "{entity} municipal corporations"]
    },
    "taxation": {
        "it": ["{entity} tributi IMU TARI", "{entity} imposte comunali"],
        "en": ["{entity} taxes fees", "{entity} municipal taxation"]
    },
    "regulation": {
        "it": ["{entity} regolamenti comunali", "{entity} ordinanze"],
        "en": ["{entity} regulations ordinances", "{entity} municipal bylaws"]
    },
    "contract": {
        "it": ["{entity} appalti bandi", "{entity} contratti gare"],
        "en": ["{entity} tenders contracts", "{entity} procurement"]
    },
    "allocation": {
        "it": ["{entity} finanziamenti contributi", "{entity} fondi bilancio"],
        "en": ["{entity} funding grants", "{entity} budget allocations"]
    },
    "designation": {
        "it": ["{entity} zone aree ZTL", "{entity} vincoli urbanistici"],
        "en": ["{entity} zones districts", "{entity} designated areas"]
    }
}


def build_search_queries(entity_name: str, language: str, categories: List[str]) -> List[dict]:
    """
    Build search queries for specified categories.

    Args:
        entity_name: Name of the political entity
        language: Language code ('it', 'en', etc.)
        categories: List of provision categories to search

    Returns:
        List of dicts with 'query' and 'category' keys
    """
    queries = []
    for category in categories:
        if category not in QUERY_TEMPLATES:
            continue
        templates = QUERY_TEMPLATES[category].get(language, QUERY_TEMPLATES[category]["en"])
        for template in templates:
            queries.append({
                "query": template.format(entity=entity_name),
                "category": category
            })
    return queries
