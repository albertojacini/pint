# MCP Tools Summary for Entity Enrichment Agent

## Overview

The entity enrichment agent has access to **5 MCP tools** from two servers:
- **BrightData MCP Server** (4 tools): Web search and scraping capabilities
- **Wikipedia MCP Server** (1 tool): Encyclopedia article queries

## Quick Reference Table

| Tool Name | Server | Required Params | Optional Params | Purpose |
|-----------|--------|----------------|-----------------|---------|
| `search_engine` | BrightData | `query` | `engine`, `cursor` | Search Google/Bing/Yandex for current info |
| `scrape_as_markdown` | BrightData | `url` | - | Scrape single webpage to markdown |
| `search_engine_batch` | BrightData | `queries` (array) | - | Run up to 10 searches in parallel |
| `scrape_batch` | BrightData | `urls` (array) | - | Scrape up to 10 webpages in parallel |
| `query_wikipedia` | Wikipedia | `title` | `language` | Query Wikipedia articles |

---

## Detailed Tool Specifications

### 1. search_engine (BrightData)

**Purpose:** Search Google, Bing, or Yandex for current information.

**Parameters:**
```python
{
    "query": str,              # REQUIRED - search query
    "engine": str,             # OPTIONAL - "google" (default), "bing", or "yandex"
    "cursor": str              # OPTIONAL - pagination cursor for next page
}
```

**Returns:** SERP results in JSON or Markdown format with URL, title, and description.

**Best For:**
- Finding official websites
- Recent news and current events
- Real-time information not in Wikipedia
- Discovering entity-related resources

---

### 2. scrape_as_markdown (BrightData)

**Purpose:** Extract content from a single webpage as markdown.

**Parameters:**
```python
{
    "url": str                 # REQUIRED - URI to scrape
}
```

**Returns:** Webpage content in Markdown format.

**Capabilities:**
- Bypasses bot detection and CAPTCHA
- Handles JavaScript-rendered pages
- Clean markdown output

**Best For:**
- Official government websites
- Entity profile pages
- News articles
- Complex pages with anti-bot protection

---

### 3. search_engine_batch (BrightData)

**Purpose:** Run multiple search queries simultaneously.

**Parameters:**
```python
{
    "queries": [               # REQUIRED - array of 1-10 query objects
        {
            "query": str,      # REQUIRED
            "engine": str,     # OPTIONAL - "google" (default), "bing", or "yandex"
            "cursor": str      # OPTIONAL
        }
    ]
}
```

**Returns:** JSON for Google, Markdown for Bing/Yandex.

**Best For:**
- Gathering multiple data points efficiently
- Parallel searches for different entity aspects
- Batch processing workflows

---

### 4. scrape_batch (BrightData)

**Purpose:** Scrape multiple webpages simultaneously.

**Parameters:**
```python
{
    "urls": [str]              # REQUIRED - array of 1-10 URIs
}
```

**Returns:** Array of markdown content for each URL.

**Best For:**
- Multiple pages from same site
- Parallel extraction workflows
- Efficient multi-source data gathering

---

### 5. query_wikipedia (Wikipedia)

**Purpose:** Query Wikipedia API for article content.

**Parameters:**
```python
{
    "title": str,              # REQUIRED - article title
    "language": str            # OPTIONAL - language code (default: "en")
}
```

**Supported Languages:** `en`, `it`, `es`, `fr`, `de`, and many more.

**Returns:** Article content in plain text with title.

**Best For:**
- Baseline entity information
- Historical context
- Reliable encyclopedia data
- Multi-language content

---

## Recommended Workflow for Entity Enrichment

### Stage 1: Initial Discovery
```python
# 1. Get baseline info from Wikipedia
wikipedia_result = await query_wikipedia(
    title=entity_name,
    language=entity_language
)

# 2. Search for official website
search_result = await search_engine(
    query=f"{entity_name} official website",
    engine="google"
)
```

### Stage 2: Deep Information Gathering
```python
# 3. Scrape official website(s)
official_content = await scrape_as_markdown(
    url=official_url
)

# 4. Batch search for specific data
batch_results = await search_engine_batch(
    queries=[
        {"query": f"{entity_name} population"},
        {"query": f"{entity_name} mayor"},
        {"query": f"{entity_name} budget"},
    ]
)
```

### Stage 3: Comprehensive Enrichment
```python
# 5. Batch scrape related pages
related_content = await scrape_batch(
    urls=[
        official_statistics_url,
        official_government_url,
        official_demographics_url
    ]
)
```

---

## Usage in LangGraph Nodes

### Setup Tools
```python
from utils.mcp_client import get_mcp_tools

async def setup_agent():
    tools = await get_mcp_tools()

    # Tools are LangChain StructuredTools
    # Can be used with LangGraph tool nodes
    tool_dict = {tool.name: tool for tool in tools}

    return tool_dict
```

### Using in a Node
```python
async def search_node(state: AgentState):
    """Node that searches for entity information."""
    tools = await get_mcp_tools()
    search_tool = next(t for t in tools if t.name == "search_engine")

    result = await search_tool.ainvoke({
        "query": f"{state['entity_name']} official website",
        "engine": "google"
    })

    state["web_resources"].append({
        "source": "search_engine",
        "data": result
    })

    return state
```

---

## Tool Selection Decision Tree

```
START
│
├─ Need baseline info?
│  └─ YES → Use query_wikipedia
│  └─ NO → Continue
│
├─ Need to find resources?
│  └─ YES → Use search_engine
│  └─ NO → Continue
│
├─ Have specific URLs to scrape?
│  ├─ One URL → Use scrape_as_markdown
│  └─ Multiple URLs → Use scrape_batch
│
└─ Need multiple searches?
   └─ YES → Use search_engine_batch
```

---

## Best Practices

### Efficiency
1. **Start free:** Use Wikipedia first (no API costs)
2. **Batch when possible:** Use batch tools for parallel operations
3. **Cache results:** Store results to avoid duplicate calls
4. **Progressive enrichment:** Gather basic info before detailed scraping

### Error Handling
```python
try:
    result = await tool.ainvoke(params)
except Exception as e:
    # Log error and continue with other tools
    state["errors"].append(f"Tool {tool.name} failed: {str(e)}")
```

### Rate Limiting
- BrightData: Check your API key tier limits
- Wikipedia: Generous limits, but use proper User-Agent
- Consider delays between batch operations

### Data Quality
1. **Verify sources:** Cross-reference information from multiple tools
2. **Prefer official sources:** Government websites > News > General search
3. **Use language matching:** Set Wikipedia language to entity's primary language
4. **Handle missing data:** Not all entities have Wikipedia articles or official sites

---

## Example: Complete City Enrichment

```python
async def enrich_city(city_name: str, country: str):
    """Complete workflow for city enrichment."""

    tools = await get_mcp_tools()
    data = {}

    # 1. Wikipedia baseline
    wiki_tool = next(t for t in tools if t.name == "query_wikipedia")
    wiki_result = await wiki_tool.ainvoke({
        "title": city_name,
        "language": "en"
    })
    data["wikipedia"] = wiki_result

    # 2. Find official website
    search_tool = next(t for t in tools if t.name == "search_engine")
    search_result = await search_tool.ainvoke({
        "query": f"{city_name} {country} official government website"
    })
    data["search"] = search_result

    # 3. Scrape official site (assuming we extracted URL)
    official_url = extract_first_url(search_result)
    if official_url:
        scrape_tool = next(t for t in tools if t.name == "scrape_as_markdown")
        scrape_result = await scrape_tool.ainvoke({
            "url": official_url
        })
        data["official_site"] = scrape_result

    # 4. Batch search for specific data
    batch_search_tool = next(t for t in tools if t.name == "search_engine_batch")
    batch_result = await batch_search_tool.ainvoke({
        "queries": [
            {"query": f"{city_name} {country} population 2025"},
            {"query": f"{city_name} {country} mayor"},
            {"query": f"{city_name} {country} budget"},
        ]
    })
    data["batch_search"] = batch_result

    return data
```

---

## Performance Characteristics

| Tool | Speed | Cost | Data Quality | Rate Limits |
|------|-------|------|--------------|-------------|
| `query_wikipedia` | Fast | Free | High (curated) | Generous |
| `search_engine` | Fast | Paid | Variable | API tier |
| `scrape_as_markdown` | Medium | Paid | High (direct) | API tier |
| `search_engine_batch` | Fast | Paid | Variable | API tier |
| `scrape_batch` | Medium | Paid | High (direct) | API tier |

**Note:** "Paid" refers to BrightData API usage based on your subscription tier.
