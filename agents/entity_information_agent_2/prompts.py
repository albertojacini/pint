"""Prompt templates for entity information extraction."""

from langchain_core.prompts import PromptTemplate


class PromptTemplates:
    """Collection of prompt templates for the entity information agent."""

    # Prompt for ranking Wikipedia search results
    RANK_WIKIPEDIA = PromptTemplate(
        input_variables=["entity_name", "entity_type", "search_results"],
        template="""You are an expert at identifying relevant Wikipedia pages for political and administrative entities.

Entity to find: {entity_name}
Entity type: {entity_type}

Search results:
{search_results}

Analyze each search result and rank them from most to least relevant.
Consider:
1. Exact name match vs partial match
2. Correct entity type (city, region, country, etc.)
3. Disambiguation pages should be ranked lower
4. Prefer pages in the expected language
5. Official administrative pages over general topics

Return a JSON with:
- "rankings": [list of indices in order from best to worst match]
- "reasoning": "Brief explanation of the ranking"

Example: {{"rankings": [2, 0, 3, 1], "reasoning": "Result 2 is exact match for the city..."}}"""
    )

    # Prompt for extracting basic entity information from Wikipedia
    EXTRACT_BASIC_INFO = PromptTemplate(
        input_variables=["entity_name", "wikipedia_content"],
        template="""You are an expert at extracting structured information about political and administrative entities from Wikipedia content.

Entity: {entity_name}

Wikipedia Content:
{wikipedia_content}

Extract the following information (return null for missing data):

Basic Information:
- name: Official name of the entity
- description: Brief description (1-2 sentences)
- type: Entity type (city/comune, province/provincia, region/regione, country)
- population: Current population (number only)

Identity Data:
- country_code: ISO country code (e.g., "IT" for Italy)
- region_name: Name of the region/state
- city_type: Specific type (e.g., "comune", "municipality")
- official_website: Official government website URL
- sister_cities: List of sister/twin cities
- postal_codes: List of postal/ZIP codes
- phone_prefix: Phone area code

Essential Stats:
- area: Area in square kilometers (number only)
- density: Population density per sq km (number only)
- gdp_per_capita: GDP per capita in EUR (number only)
- timezone: Timezone (e.g., "CET", "UTC+1")
- languages: List of official languages
- elevation: Elevation in meters (number only)
- founded: Foundation date or year
- demonym: Name for inhabitants (e.g., "Bolognesi" for Bologna)
- patron_saint: Patron saint name if applicable

Return a properly formatted JSON object with these fields."""
    )

    # Prompt for identifying official website from SERP results
    IDENTIFY_OFFICIAL_WEBSITE = PromptTemplate(
        input_variables=["entity_name", "entity_type", "search_results"],
        template="""You are an expert at identifying official government websites.

Entity: {entity_name}
Type: {entity_type}

Search results:
{search_results}

Identify the official government website for this entity.
Look for:
1. Government domains (.gov, .gov.it, comune.*, provincia.*, regione.*)
2. Official institutional sites
3. Avoid tourism sites, Wikipedia, news sites

Return a JSON with:
- "official_url": "URL of the official website" or null if not found
- "confidence": "high", "medium", or "low"
- "reasoning": "Brief explanation"

Example: {{"official_url": "https://www.comune.bologna.it", "confidence": "high", "reasoning": "Official comune domain"}}"""
    )

    # Prompt for extracting political landscape from scraped content
    EXTRACT_POLITICAL_LANDSCAPE = PromptTemplate(
        input_variables=["entity_name", "website_content", "wikipedia_content"],
        template="""You are an expert at extracting political and administrative information from government websites and Wikipedia.

Entity: {entity_name}

Website Content:
{website_content}

Additional Wikipedia Content:
{wikipedia_content}

Extract the following political landscape information:

Current Mayor:
- name: Full name
- party: Political party/coalition
- since: Start date (YYYY-MM-DD format if possible)
- term_ends: End date of term

Last Election:
- date: Election date (YYYY-MM-DD format)
- type: Type of election (municipal/regional/etc)
- turnout: Voter turnout percentage
- winner: Winner name
- winner_party: Winner's party

Next Election:
- date: Scheduled date
- type: Type of election

Council Composition:
List of parties with:
- party: Party name
- seats: Number of seats
- percentage: Vote percentage
- role: "majority", "opposition", or "mixed"

Additional:
- government_type: Type of government/administration
- administrative_divisions: Number of districts/quartieri

Return a properly formatted JSON object. Use null for missing data."""
    )

    # Prompt for synthesizing information from multiple sources
    SYNTHESIZE_ENTITY_DATA = PromptTemplate(
        input_variables=["entity_name", "wikipedia_data", "website_data", "serp_data"],
        template="""You are an expert at synthesizing information about political entities from multiple sources.

Entity: {entity_name}

Data from Wikipedia:
{wikipedia_data}

Data from Official Website:
{website_data}

Data from Search Results:
{serp_data}

Synthesize this information into a complete entity profile.
When there are conflicts:
1. Prefer official website for current political data
2. Prefer Wikipedia for historical and geographic data
3. Use the most recent data when dates are available
4. Combine complementary information from all sources

Focus on:
- Accuracy and completeness
- Removing duplicates
- Resolving conflicts
- Filling gaps with available data

Return a comprehensive JSON object with all available entity information."""
    )

    # Prompt for validating extracted data
    VALIDATE_ENTITY_DATA = PromptTemplate(
        input_variables=["entity_data"],
        template="""You are a data quality expert. Review the following entity data for quality and completeness.

Entity Data:
{entity_data}

Check for:
1. Data consistency (population vs density vs area)
2. Reasonable values (population > 0, area > 0)
3. Proper formatting (dates, URLs, codes)
4. Missing critical fields
5. Obvious errors or anomalies

Return a JSON with:
- "is_valid": true/false
- "completeness_score": 0-100
- "issues": [list of issues found]
- "suggestions": [list of improvements]

Example: {{"is_valid": true, "completeness_score": 85, "issues": ["Missing GDP data"], "suggestions": ["Add patron saint information"]}}"""
    )

    # Prompt for generating entity description
    GENERATE_DESCRIPTION = PromptTemplate(
        input_variables=["entity_name", "entity_data"],
        template="""You are an expert writer. Generate a concise, informative description for this political entity.

Entity: {entity_name}
Data: {entity_data}

Write a 2-3 sentence description that:
1. Identifies what and where the entity is
2. Highlights 1-2 notable characteristics
3. Mentions current population or size if relevant
4. Is factual and neutral in tone

Return just the description text, no JSON wrapper."""
    )

    # Prompt for calculating performance scores
    CALCULATE_SCORES = PromptTemplate(
        input_variables=["entity_data"],
        template="""You are an expert at evaluating political entities based on available data.

Entity Data:
{entity_data}

Calculate performance scores (0-100) for:

1. Innovation Score:
- Digital services availability
- Smart city initiatives
- Modern infrastructure
- Tech sector presence

2. Sustainability Score:
- Environmental policies
- Green spaces
- Public transportation
- Renewable energy

3. Impact Score:
- Economic importance
- Cultural significance
- Administrative efficiency
- Quality of life indicators

Base scores on available data. If insufficient data, return null.

Return JSON: {{"innovation": 0-100 or null, "sustainability": 0-100 or null, "impact": 0-100 or null, "reasoning": "Brief explanation"}}"""
    )

    @staticmethod
    def format_search_results(results):
        """Format search results for prompts."""
        formatted = []
        for i, result in enumerate(results):
            # Handle None values safely
            title = result.get('title') or 'No title'
            url = result.get('url') or 'No URL'
            snippet = result.get('snippet') or 'No snippet'
            formatted.append(
                f"{i}. {title}\n"
                f"   URL: {url}\n"
                f"   Snippet: {snippet[:200]}..."
            )
        return "\n".join(formatted)

    @staticmethod
    def format_entity_data(data):
        """Format entity data for prompts."""
        import json
        return json.dumps(data, indent=2, ensure_ascii=False, default=str)