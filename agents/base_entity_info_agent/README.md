# Entity Info Agent

Automated agent for extracting political entity information from Wikipedia and storing it in the database.

## Overview

This agent extracts structured information about political entities (cities, regions, countries) from Wikipedia and stores it in PostgreSQL. It uses LangGraph for workflow orchestration and OpenAI's GPT-4 for structured data extraction.

## Architecture

### Workflow
1. **SERP Search** - Search for entity using BrightData SERP API
2. **Filter & Rank** - Filter Wikipedia URLs and rank by relevance using LLM
3. **Fetch Wikipedia** - Sequential fetching of Wikipedia pages via API
4. **Extract Data** - Use structured LLM output to extract entity information
5. **Upsert DB** - Insert new entity or update existing one in PostgreSQL

### Modules

- **main.py** - LangGraph workflow orchestration and Pydantic models
- **web_operation.py** - SERP search and Wikipedia API integration
- **db_operations.py** - PostgreSQL connection and upsert logic
- **prompts.py** - Prompt templates for LLM interactions
- **snapshot_operations.py** - BrightData snapshot polling utilities

## Data Extracted

The agent populates the following fields from Wikipedia:

### Basic Fields
- `name` - Entity name
- `description` - Brief description (1-2 sentences)
- `type` - Entity type (city, region, country, etc.)
- `population` - Current population

### Identity Data (JSONB)
- `country_code` - ISO country code (e.g., 'IT', 'DE')
- `region_name` - Region or state name
- `official_website` - Official website URL (if found)

### Essential Stats (JSONB)
- `area` - Area in square kilometers
- `density` - Population density (people/km²)
- `gdp_per_capita` - GDP per capita in USD
- `timezone` - Timezone (e.g., 'UTC+1')
- `languages` - Official or spoken languages
- `elevation` - Elevation in meters
- `founded` - Year or date founded

## Usage

### Full Workflow (with SERP)

```python
from main import build_graph

graph = build_graph()

state = {
    "entity_name": "Berlino",
    "serp_results": None,
    "wikipedia_titles": None,
    "wiki_page_data": None,
    "extracted_entity_info": None,
    "db_result": None
}

final_state = graph.invoke(state)
```

### Direct Wikipedia (bypassing SERP)

```python
from web_operation import fetch_wikipedia_page
from db_operations import upsert_entity
from prompts import get_entity_extraction_messages
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o", temperature=0)

# Fetch Wikipedia page
page_data = fetch_wikipedia_page("Berlino", lang="it")

# Extract entity info
structured_llm = llm.with_structured_output(ExtractedEntityInfo)
messages = get_entity_extraction_messages("Berlino", page_data['extract'])
entity_info = structured_llm.invoke(messages)

# Save to database
entity_dict = {
    "name": entity_info.name,
    "description": entity_info.description,
    "type": entity_info.type,
    "population": entity_info.population,
    "identity_data": entity_info.identity_data.model_dump(exclude_none=True),
    "essential_stats": entity_info.essential_stats.model_dump(exclude_none=True)
}
result = upsert_entity(entity_dict)
```

### Running Tests

```bash
# Simple test (bypasses SERP, uses direct Wikipedia)
uv run python test_entity_agent_simple.py

# Full workflow test (requires working BrightData API)
uv run python test_entity_agent.py
```

## Configuration

Required environment variables (in `/agents/.env`):

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# BrightData (for SERP search)
BRIGHTDATA_API_KEY=your-brightdata-api-key
```

## Database Schema

The agent writes to the `political_entities` table:

```sql
CREATE TABLE political_entities (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    population INTEGER,
    identity_data JSONB,
    essential_stats JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Dependencies

- `langchain` - LLM orchestration
- `langgraph` - Workflow graph framework
- `langchain-openai` - OpenAI integration
- `psycopg2-binary` - PostgreSQL driver
- `requests` - HTTP client
- `pydantic` - Data validation

## Design Decisions

1. **Wikipedia Language**: Uses Italian Wikipedia (it.wikipedia.org) by default
2. **SERP vs Direct**: Can work with or without SERP search
3. **Sequential Fetching**: Fetches Wikipedia pages sequentially for simpler state management
4. **No Validation**: Trusts LLM extraction without additional validation (as per project requirements)
5. **Upsert Strategy**: Updates existing entity if name matches, otherwise inserts new
6. **Structured Output**: Uses Pydantic models with LangChain's `with_structured_output()` for reliable data extraction

## Known Issues

- BrightData SERP API may require specific zone configuration
- Wikipedia API requires proper User-Agent header to avoid 403 errors
- LLM extraction quality depends on Wikipedia article completeness
- No handling for disambiguation pages or redirect pages

## Future Enhancements

- Add support for multiple Wikipedia language editions with fallback
- Implement confidence scoring for extracted data
- Add support for entity relationships (parent/child entities)
- Cache Wikipedia responses to reduce API calls
- Add retry logic for failed API requests
- Support for batch processing multiple entities
