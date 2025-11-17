# MCP Tools Reference for Entity Enrichment Agent

This document lists all available MCP tools from BrightData and Wikipedia servers that can be used by the entity enrichment agent.

## Available Tools Summary

The MCP client provides access to **5 tools** from two servers:
- **BrightData MCP Server**: 4 tools (search, scraping)
- **Wikipedia MCP Server**: 1 tool (article queries)

---

## 1. search_engine (BrightData)

**Description:** Scrape search results from Google, Bing or Yandex. Returns SERP results in JSON or Markdown (URL, title, description). Ideal for gathering current information, news, and detailed search results.

**Parameters:**
- `query` (string) **[REQUIRED]** - The search query to execute
- `engine` (string) **[OPTIONAL]** - Search engine to use
  - Allowed values: `google`, `bing`, `yandex`
  - Default: `google`
- `cursor` (string) **[OPTIONAL]** - Pagination cursor for next page

**Use Cases:**
- Search for recent news about an entity
- Find official websites
- Gather general information about cities, politicians, organizations
- Get current data not available in Wikipedia

**Example Usage:**
```python
result = await tool.ainvoke({
    "query": "Milan Italy mayor 2025",
    "engine": "google"
})
```

---

## 2. scrape_as_markdown (BrightData)

**Description:** Scrape a single webpage URL with advanced options for content extraction and get back the results in Markdown language. This tool can unlock any webpage even if it uses bot detection or CAPTCHA.

**Parameters:**
- `url` (string, URI format) **[REQUIRED]** - The URL to scrape

**Use Cases:**
- Extract content from official government websites
- Scrape entity profiles from official pages
- Get detailed information from news articles
- Extract data from pages that require JavaScript or have anti-bot protection

**Example Usage:**
```python
result = await tool.ainvoke({
    "url": "https://www.comune.milano.it/en"
})
```

---

## 3. search_engine_batch (BrightData)

**Description:** Run multiple search queries simultaneously. Returns JSON for Google, Markdown for Bing/Yandex.

**Parameters:**
- `queries` (array) **[REQUIRED]** - Array of query objects
  - Min items: 1
  - Max items: 10
  - Each query object contains:
    - `query` (string) **[REQUIRED]** - The search query
    - `engine` (string) **[OPTIONAL]** - `google`, `bing`, or `yandex` (default: `google`)
    - `cursor` (string) **[OPTIONAL]** - Pagination cursor

**Use Cases:**
- Gather information about multiple entities at once
- Run parallel searches for different aspects of an entity
- Batch processing for efficiency

**Example Usage:**
```python
result = await tool.ainvoke({
    "queries": [
        {"query": "Milan Italy population", "engine": "google"},
        {"query": "Milan Italy mayor", "engine": "google"},
        {"query": "Milan Italy budget", "engine": "google"}
    ]
})
```

---

## 4. scrape_batch (BrightData)

**Description:** Scrape multiple webpages URLs with advanced options for content extraction and get back the results in Markdown language. This tool can unlock any webpage even if it uses bot detection or CAPTCHA.

**Parameters:**
- `urls` (array of strings, URI format) **[REQUIRED]** - Array of URLs to scrape
  - Min items: 1
  - Max items: 10

**Use Cases:**
- Scrape multiple official sources at once
- Gather information from several pages of the same website
- Parallel extraction for efficiency

**Example Usage:**
```python
result = await tool.ainvoke({
    "urls": [
        "https://www.comune.milano.it/en",
        "https://www.comune.milano.it/en/administration",
        "https://www.comune.milano.it/en/statistics"
    ]
})
```

---

## 5. query_wikipedia (Wikipedia)

**Description:** Query Wikipedia API to get article content. Supports multiple languages (en, it, es, fr, de, etc.)

**Parameters:**
- `title` (string) **[REQUIRED]** - The Wikipedia article title to query
- `language` (string) **[OPTIONAL]** - Wikipedia language code
  - Examples: `en`, `it`, `es`, `fr`, `de`
  - Default: `en`

**Use Cases:**
- Get structured encyclopedia information about entities
- Retrieve historical context and background
- Access multi-language information
- Get reliable baseline information

**Example Usage:**
```python
result = await tool.ainvoke({
    "title": "Milan",
    "language": "en"
})
```

---

## Tool Selection Strategy for Entity Enrichment

### For Cities/Municipalities:
1. **Start with Wikipedia** (`query_wikipedia`) - Get baseline information
2. **Search for official site** (`search_engine`) - Find government website
3. **Scrape official site** (`scrape_as_markdown`) - Extract current data
4. **Batch search** (`search_engine_batch`) - For specific data points (budget, demographics, etc.)

### For Politicians/Officials:
1. **Wikipedia first** - Get biography and background
2. **Search for recent news** (`search_engine`) - Current position and activities
3. **Scrape official profiles** - Government or party websites

### For Organizations:
1. **Wikipedia** (if notable) - Background and history
2. **Search** - Official website and recent news
3. **Scrape** - Official pages for current information

### Optimization Tips:
- Use batch tools when gathering multiple data points
- Start with free Wikipedia queries before using BrightData
- Cache results to avoid duplicate calls
- Use language parameter for Wikipedia to match entity's primary language

---

## Implementation Notes

### Accessing Tools in LangGraph:
```python
from utils.mcp_client import get_mcp_tools

# In your graph setup
async def setup():
    tools = await get_mcp_tools()
    # Tools are LangChain StructuredTools
    # Can be passed directly to LangGraph nodes
    return tools
```

### Error Handling:
- All tools may raise exceptions for network errors
- Wikipedia returns "not found" message if article doesn't exist
- BrightData tools may have rate limits (check API key limits)

### Rate Limits:
- Consider implementing delays between batch operations
- BrightData limits are based on your API key tier
- Wikipedia has generous rate limits but requests should include proper User-Agent
