"""Prompt templates for entity_info_agent."""

from typing import Dict, Any


class PromptTemplates:
    """Container for all prompt templates used in the entity info agent."""

    @staticmethod
    def wikipedia_ranking_system() -> str:
        """System prompt for ranking Wikipedia URLs from SERP results."""
        return """You are an expert at identifying relevant Wikipedia pages for extracting entity information.

Your task is to analyze search engine results and identify the most relevant Wikipedia page titles that would contain comprehensive information about the entity.

Focus on:
- Main Wikipedia article about the entity itself (highest priority)
- Related Wikipedia pages that provide additional context
- Official, comprehensive articles (not disambiguation pages or stubs)
- Articles in Italian Wikipedia (it.wikipedia.org)

Extract ONLY the Wikipedia page titles (the part after /wiki/), not full URLs.
For example, from "https://it.wikipedia.org/wiki/Berlino" extract "Berlino".

Return the top 1-3 most relevant Wikipedia page titles, ranked by relevance."""

    @staticmethod
    def wikipedia_ranking_user(entity_name: str, serp_results: str) -> str:
        """User prompt for ranking Wikipedia URLs."""
        return f"""Entity: {entity_name}

Search Results:
{serp_results}

Please identify and rank the most relevant Wikipedia page titles (in Italian) for this entity.
Extract only the page titles (after /wiki/), ranked by relevance."""

    @staticmethod
    def entity_extraction_system() -> str:
        """System prompt for extracting structured entity data from Wikipedia."""
        return """You are an expert at extracting structured information about political entities (cities, regions, countries) from Wikipedia articles.

Your task is to extract accurate, structured data about the entity from the provided Wikipedia text.

IMPORTANT EXTRACTION RULES:
1. **Entity Type**: Determine if it's a 'city', 'region', 'country', 'district', 'borough', or 'neighborhood'
2. **Population**: Extract current population (most recent census data)
3. **Description**: Create a concise 1-2 sentence description of the entity
4. **Identity Data**: Extract:
   - country_code: ISO country code (e.g., 'IT', 'DE', 'FR')
   - region_name: Name of the region/state it belongs to
   - official_website: Official government website if mentioned
5. **Essential Statistics**: Extract:
   - area: Total area in square kilometers
   - density: Population density (people per sq km)
   - gdp_per_capita: GDP per capita if available
   - timezone: Timezone (e.g., 'UTC+1', 'CET')
   - languages: List of official/spoken languages
   - elevation: Average elevation in meters
   - founded: Year or date of founding/establishment

EXTRACTION GUIDELINES:
- Only extract information that is explicitly stated in the text
- For missing information, leave the field as null/None
- Convert all measurements to standard units (km², meters, etc.)
- Be precise with numbers - extract exact values
- For population, use the most recent figure mentioned
- For founded date, use year format (e.g., "1237" or "753 BC")

Return a structured JSON object with all available information."""

    @staticmethod
    def entity_extraction_user(entity_name: str, wikipedia_text: str) -> str:
        """User prompt for extracting entity data."""
        return f"""Entity Name: {entity_name}

Wikipedia Content:
{wikipedia_text}

Please extract all available structured information about this entity according to the schema.
Be precise and only include information that is explicitly stated in the text."""


def create_message_pair(system_prompt: str, user_prompt: str) -> list[Dict[str, Any]]:
    """
    Create a standardized message pair for LLM interactions.

    Args:
        system_prompt: The system message content
        user_prompt: The user message content

    Returns:
        List containing system and user message dictionaries
    """
    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]


# Convenience functions for creating complete message arrays
def get_wikipedia_ranking_messages(
    entity_name: str, serp_results: str
) -> list[Dict[str, Any]]:
    """Get messages for Wikipedia URL ranking."""
    # Convert SERP results dict to string representation
    if isinstance(serp_results, dict):
        # Format organic results nicely
        organic = serp_results.get("organic", [])
        formatted_results = "\n\n".join([
            f"Title: {result.get('title', 'N/A')}\nURL: {result.get('link', 'N/A')}\nSnippet: {result.get('snippet', 'N/A')}"
            for result in organic[:10]  # Top 10 results
        ])
        serp_results_str = formatted_results
    else:
        serp_results_str = str(serp_results)

    return create_message_pair(
        PromptTemplates.wikipedia_ranking_system(),
        PromptTemplates.wikipedia_ranking_user(entity_name, serp_results_str),
    )


def get_entity_extraction_messages(
    entity_name: str, wikipedia_text: str
) -> list[Dict[str, Any]]:
    """Get messages for entity data extraction."""
    # Limit wikipedia text to avoid token limits (keep first ~15000 chars)
    max_chars = 15000
    if len(wikipedia_text) > max_chars:
        wikipedia_text = wikipedia_text[:max_chars] + "\n\n[... text truncated for length ...]"

    return create_message_pair(
        PromptTemplates.entity_extraction_system(),
        PromptTemplates.entity_extraction_user(entity_name, wikipedia_text),
    )
