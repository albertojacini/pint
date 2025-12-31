# Agent Selection in Research API

The Research API supports two research agents. Agent selection is configured server-side in `services/research_config.py`.

## Available Agents

### 1. Claude SDK Agent (`"claude"`)
- **Framework**: Claude SDK (Anthropic's official SDK)
- **Search Tools**: Built-in `WebSearch` tool
- **Default**: Yes

### 2. LangChain Deep Agents (`"lcdeep"`)
- **Framework**: LangChain Deep Agents
- **Search Tools**: BrightData MCP (`search_engine`, `scrape_as_markdown`, `query_wikipedia`)
- **Default**: No

Both agents:
- Use the same database schema
- Follow the same subagent architecture (lead → search_evaluator → summarizer)
- Save results to the same tables (`ra_researches`, `ra_sources`)
- Have identical interfaces (`run(task_id: str) -> str`)

## Configuration

To switch between agents, edit `backend/services/research_config.py`:

```python
# Option 1: Claude SDK research agent (default)
RESEARCH_AGENT: Literal["claude", "lcdeep"] = "claude"

# Option 2: LangChain Deep Agents research agent
# RESEARCH_AGENT: Literal["claude", "lcdeep"] = "lcdeep"
```

Simply comment/uncomment the desired agent and restart the server.

## API Usage

### POST /provision/start-research

Start a provision research job:

```bash
curl -X POST http://localhost:8000/provision/start-research \
  -H "Content-Type: application/json" \
  -d '{
    "research_prompt": "Research electric vehicles",
    "entity_name": "California"
  }'
```

**Request Body:**
```json
{
  "research_prompt": "string",    // Required: research question
  "entity_name": "string",        // Optional: entity context
  "entity_id": "uuid"            // Optional: entity UUID
}
```

**Response:**
```json
{
  "task_id": "uuid"  // Use this to poll for results
}
```

### GET /provision/research-status/{task_id}

Poll research status and results:

```bash
curl http://localhost:8000/provision/research-status/{task_id}
```

**Response:**
```json
{
  "task_id": "uuid",
  "status": "pending" | "researching" | "completed" | "failed",
  "query": "string",
  "entity_id": "uuid | null",
  "sources_count": 0,
  "summary": "string | null",
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp"
}
```

## Python Client Example

```python
import httpx
import asyncio

async def research_provision():
    async with httpx.AsyncClient() as client:
        # Start research (uses configured agent)
        response = await client.post(
            "http://localhost:8000/provision/start-research",
            json={
                "research_prompt": "Research renewable energy trends in Europe",
                "entity_name": "European Union"
            }
        )
        task_id = response.json()["task_id"]
        print(f"Task created: {task_id}")

        # Poll for results
        while True:
            status_response = await client.get(
                f"http://localhost:8000/provision/research-status/{task_id}"
            )
            result = status_response.json()

            if result["status"] == "completed":
                print(f"Research complete!")
                print(f"Sources: {result['sources_count']}")
                print(f"Summary:\n{result['summary']}")
                break
            elif result["status"] == "failed":
                print("Research failed!")
                break

            print(f"Status: {result['status']}...")
            await asyncio.sleep(5)

asyncio.run(research_provision())
```

## Comparison

| Feature | Claude SDK | LangChain Deep Agents |
|---------|-----------|----------------------|
| Search Tool | WebSearch (built-in) | BrightData MCP (search_engine, scrape, wikipedia) |
| Scraping | Limited | Full webpage scraping via BrightData |
| Wikipedia | No | Yes (direct API access) |
| Framework | Claude SDK | LangChain + Deep Agents |
| Cost | Anthropic API only | Anthropic API + BrightData API |
| Customization | Limited | High (tool composition) |

## When to Use Each Agent

### Use Claude SDK (`"claude"`) when:
- You want simplicity and fewer dependencies
- You don't need webpage scraping
- You want to minimize external API costs
- You're doing general web search research

### Use LangChain Deep Agents (`"lcdeep"`) when:
- You need webpage scraping capabilities
- You want Wikipedia baseline information
- You're building complex research pipelines
- You need more control over search tools
- You want to leverage LangChain ecosystem

## Environment Variables

Both agents require:
```bash
ANTHROPIC_API_KEY=your_anthropic_key
DATABASE_URL=postgresql://user:pass@host:port/db
```

LangChain Deep Agents additionally requires:
```bash
BRIGHTDATA_API_KEY=your_brightdata_key
```

## OpenAPI/Swagger Docs

Visit `http://localhost:8000/docs` to see interactive API documentation with agent_type parameters included.
