# Agent Selection in Research API

The Research API now supports two research agents that can be selected via the `agent_type` parameter.

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
- Follow the same subagent architecture (lead → researchers → summarizer)
- Save results to the same tables (`ra_research_tasks`, `ra_sources`, `ra_findings`, `ra_summaries`)

## API Usage

### POST /research

Start a new research job with agent selection:

```bash
# Using Claude SDK (default)
curl -X POST http://localhost:8000/research \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Research electric vehicles",
    "agent_type": "claude"
  }'

# Using LangChain Deep Agents
curl -X POST http://localhost:8000/research \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Research electric vehicles",
    "agent_type": "lcdeep"
  }'
```

**Request Body:**
```json
{
  "description": "string",        // Required: research question
  "entity_name": "string",        // Optional: entity context
  "entity_id": "uuid",           // Optional: entity UUID
  "agent_type": "claude" | "lcdeep"  // Optional: which agent to use (default: "claude")
}
```

**Response:**
```json
{
  "task_id": "uuid"  // Use this to poll for results
}
```

### GET /research/{task_id}

Get research status and results (works for both agents):

```bash
curl http://localhost:8000/research/{task_id}
```

**Response:**
```json
{
  "task_id": "uuid",
  "status": "pending" | "researching" | "completed" | "failed",
  "query": "string",
  "entity_id": "uuid | null",
  "sources_count": 0,
  "findings_count": 0,
  "summary": "string | null",
  "subtopics": ["string"],
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp"
}
```

### POST /research/{task_id}/revise

Revise research with feedback:

```bash
# Revise using Claude SDK
curl -X POST http://localhost:8000/research/{task_id}/revise \
  -H "Content-Type: application/json" \
  -d '{
    "feedback": "Focus more on environmental impact",
    "agent_type": "claude"
  }'

# Revise using LangChain Deep Agents
curl -X POST http://localhost:8000/research/{task_id}/revise \
  -H "Content-Type: application/json" \
  -d '{
    "feedback": "Focus more on environmental impact",
    "agent_type": "lcdeep"
  }'
```

**Request Body:**
```json
{
  "feedback": "string",           // Required: revision instructions
  "agent_type": "claude" | "lcdeep"  // Optional: which agent to use (default: "claude")
}
```

**Response:**
```json
{
  "task_id": "uuid",           // New task ID
  "original_task_id": "uuid"   // Original task reference
}
```

## Python Client Example

```python
import httpx
import asyncio

async def research_with_lcdeep():
    async with httpx.AsyncClient() as client:
        # Start research with LangChain Deep Agents
        response = await client.post(
            "http://localhost:8000/research",
            json={
                "description": "Research renewable energy trends in Europe",
                "agent_type": "lcdeep"
            }
        )
        task_id = response.json()["task_id"]
        print(f"Task created: {task_id}")

        # Poll for results
        while True:
            status_response = await client.get(
                f"http://localhost:8000/research/{task_id}"
            )
            result = status_response.json()

            if result["status"] == "completed":
                print(f"Research complete!")
                print(f"Sources: {result['sources_count']}")
                print(f"Findings: {result['findings_count']}")
                print(f"Summary:\n{result['summary']}")
                break
            elif result["status"] == "failed":
                print("Research failed!")
                break

            print(f"Status: {result['status']}...")
            await asyncio.sleep(5)

asyncio.run(research_with_lcdeep())
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
