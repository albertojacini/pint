# Entity Information Agent

A sophisticated agent for collecting comprehensive political and administrative entity data using multiple sources including Wikipedia, official websites, and web scraping.

## Features

- **8-Node LangGraph Workflow**: Orchestrated data collection pipeline
- **Multi-Source Data Collection**: Wikipedia API, BrightData SERP, MCP web scraping
- **Structured Data Extraction**: LLM-powered extraction with Pydantic models
- **Political Landscape Analysis**: Mayor, elections, council composition
- **PostgreSQL/Supabase Integration**: Direct database operations
- **Graceful Fallbacks**: Handles missing data and failed requests

## Architecture

```
START
  ↓
1. SERP Search (BrightData API)
  ↓
2. Filter & Rank Wikipedia URLs (LLM)
  ↓
3. Fetch Wikipedia Pages (Wikipedia API)
  ↓
4. Extract Basic Entity Data (LLM structured output)
  ↓
5. Search for Official Website (SERP + LLM)
  ↓
6. Scrape Official Website (MCP tools)
  ↓
7. Extract Political Landscape (LLM structured output)
  ↓
8. Upsert to Database (PostgreSQL)
  ↓
END
```

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables in `.env`:
```bash
# Database (required)
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

# LLM (required)
OPENAI_API_KEY=your-key          # For OpenAI GPT-4

# BrightData (required for SERP)
BRIGHTDATA_API_KEY=your-api-key

# BrightData MCP (optional, for advanced scraping)
API_TOKEN=your-token
BROWSER_AUTH=your-auth
WEB_UNLOCKER_ZONE=your-zone
```

## Usage

### Test Connections First

Always test connections before running the agent:

```python
python test_connections.py
```

This will verify:
- Database connectivity
- Wikipedia API access
- BrightData SERP API
- LLM connection
- MCP tools (if configured)

### Run the Agent

```python
import asyncio
from main import EntityInformationAgent

async def run():
    agent = EntityInformationAgent()

    result = await agent.process_entity(
        entity_name="Bologna",
        entity_type="city",
        language="it"
    )

    if result.get("complete_entity"):
        entity = result["complete_entity"]
        print(f"Processed: {entity.name}")
        print(f"Population: {entity.population:,}")
        if entity.political_landscape:
            print(f"Mayor: {entity.political_landscape.current_mayor.name}")

asyncio.run(run())
```

### Command Line Usage

```bash
# Run with default test entity (Bologna)
python main.py

# Custom entity (requires modification)
python main.py --entity "Milano" --type "city" --language "it"
```

## Data Schema

The agent populates the following fields in the `political_entities` table:

### Basic Fields
- `name`: Official entity name
- `description`: Brief description
- `type`: Entity type (city, region, country)
- `population`: Current population
- `avatar_url`: Coat of arms or representative image

### Identity Data (JSONB)
- `country_code`: ISO country code
- `region_name`: Region/state name
- `city_type`: Specific type (comune, municipality)
- `official_website`: Official government URL
- `sister_cities`: List of sister cities
- `postal_codes`: Postal/ZIP codes
- `phone_prefix`: Phone area code

### Essential Stats (JSONB)
- `area`: Area in km²
- `density`: Population density
- `gdp_per_capita`: GDP per capita
- `timezone`: Timezone
- `languages`: Official languages
- `elevation`: Elevation in meters
- `founded`: Foundation date
- `demonym`: Name for inhabitants
- `patron_saint`: Patron saint

### Political Landscape (JSONB)
- `current_mayor`: Name, party, term dates
- `last_election`: Date, type, turnout, winner
- `next_election`: Scheduled date and type
- `council_composition`: Parties, seats, percentages
- `government_type`: Type of government
- `administrative_divisions`: Number of districts

## Project Structure

```
entity_information_agent/
├── main.py                 # LangGraph orchestration
├── models.py              # Pydantic data models
├── web_operations.py      # Wikipedia & SERP APIs
├── mcp_operations.py      # BrightData MCP wrapper
├── db_operations.py       # PostgreSQL operations
├── prompts.py             # LLM prompt templates
├── test_connections.py    # Connection test suite
└── README.md             # This file
```

## Testing

### Unit Tests
```python
# Test individual components
from db_operations import test_connection
from web_operations import get_wikipedia_content

# Test database
assert test_connection()

# Test Wikipedia
content = get_wikipedia_content("Roma", "it")
assert content and content.get("extract")
```

### Integration Test
```python
# Test full workflow
python test_entity_agent.py
```

## Error Handling

The agent implements multiple fallback strategies:

1. **Wikipedia Fallback**: Tries top 3 search results
2. **Official Website**: Falls back to SERP if not in Wikipedia
3. **Political Data**: Uses Wikipedia if website scraping fails
4. **Graceful Degradation**: Continues with partial data

## Performance

- **Average Processing Time**: 30-60 seconds per entity
- **Success Rate**: ~95% for major Italian cities
- **Data Completeness**: 70-90% of fields populated

## Limitations

- MCP tools require BrightData subscription
- Political data accuracy depends on website structure
- Some fields may require manual verification
- Rate limits apply to external APIs

## Future Enhancements

### Phase 2
- Batch processing for multiple entities
- Response caching
- Raw data snapshots

### Phase 3
- Image extraction and storage
- Historical data tracking
- Entity relationship mapping
- Data quality scoring

### Phase 4
- Production monitoring
- Retry with exponential backoff
- Connection pooling
- Performance optimization

## Troubleshooting

### Database Connection Failed
- Check `DATABASE_URL` format
- Verify PostgreSQL is running
- Check network connectivity

### SERP API Not Working
- Verify `BRIGHTDATA_API_KEY` is valid
- Check API quota/limits
- Test with simple queries first

### MCP Tools Not Available
- Ensure all MCP environment variables are set
- Check npx and @brightdata/mcp installation
- Verify API token permissions

### LLM Errors
- Check API key validity
- Verify model availability
- Monitor token usage

## Support

For issues or questions, please check the main project documentation or create an issue in the repository.

## License

Part of the Pint project. See main repository for license details.