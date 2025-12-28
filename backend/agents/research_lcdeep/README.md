# Research Agent (LangChain Deep Agents)

A research agent built with LangChain Deep Agents that uses BrightData search tools to gather comprehensive information and store findings in a database.

## Overview

This agent is a "twin" of `research_claude` but uses **LangChain Deep Agents** instead of Claude SDK. It maintains the same architecture and functionality:

- **Lead Agent**: Orchestrates research by breaking queries into subtopics and delegating to subagents
- **Researcher Subagents**: Conduct web searches and scrape content using BrightData tools
- **Summarizer Subagent**: Synthesizes research findings into comprehensive summaries

## Architecture

```
Lead Agent (task delegation only)
├── Researcher Subagent 1 (search + database tools)
├── Researcher Subagent 2 (search + database tools)
├── Researcher Subagent N (search + database tools)
└── Summarizer Subagent (database tools only)
```

### Tools Available

**Search Tools (from BrightData MCP):**
- `search_engine` - Search Google/Bing/Yandex for information
- `scrape_as_markdown` - Extract webpage content as markdown
- `query_wikipedia` - Query Wikipedia API for baseline info

**Database Tools (LangChain wrappers):**
- `CreateResearchTask` - Create a new research task
- `SaveSource` - Save a web source to the database
- `SaveFinding` - Save a specific finding/fact
- `LoadResearchData` - Load all sources and findings for a task
- `SaveSummary` - Save a synthesized summary
- `UpdateTaskStatus` - Update task status

## Usage

### Interactive Mode

```bash
cd backend
source .venv/bin/activate
python -m agents.research_lcdeep.agent
```

### Single Query Mode

```bash
python -m agents.research_lcdeep.agent "Research electric vehicles"
```

### Programmatic Usage

```python
from agents.research_lcdeep import chat, run

# Interactive
await chat()

# With initial query
await chat(initial_query="Research electric vehicles")

# API mode (for existing task)
task_id = await run("existing-task-uuid")
```

## Environment Setup

Required environment variables (in `backend/agents/.env`):

```bash
ANTHROPIC_API_KEY=your_anthropic_key
BRIGHTDATA_API_KEY=your_brightdata_key
DATABASE_URL=postgresql://user:pass@host:port/db
```

## Comparison with research_claude

| Aspect | research_claude | research_lcdeep |
|--------|----------------|----------------|
| Framework | Claude SDK | LangChain Deep Agents |
| Subagent Delegation | `AgentDefinition` + `Task` tool | `SubAgent` + built-in `task` tool |
| Search Tools | Claude SDK `WebSearch` | BrightData MCP tools |
| Database Tools | Claude SDK MCP server | LangChain StructuredTools |
| Model | Haiku (via Claude SDK) | Haiku (via LangChain) |

## Key Differences

1. **Subagent Definition**:
   - research_claude uses `AgentDefinition` from Claude SDK
   - research_lcdeep uses `SubAgent` from LangChain Deep Agents

2. **Search Tools**:
   - research_claude uses built-in `WebSearch` tool
   - research_lcdeep uses BrightData MCP tools (`search_engine`, `scrape_as_markdown`, `query_wikipedia`)

3. **Database Integration**:
   - research_claude uses Claude SDK MCP server
   - research_lcdeep uses LangChain StructuredTools wrapping the same DatabaseTools class

4. **Task Delegation**:
   - Both use a `task` tool but from different frameworks
   - research_claude: Claude SDK's `Task` tool
   - research_lcdeep: LangChain Deep Agents' built-in `task` tool

## Database Schema

Both agents use the same database tables:

- `ra_research_tasks` - Research task metadata
- `ra_sources` - Web sources discovered during research
- `ra_findings` - Specific findings extracted from sources
- `ra_summaries` - Synthesized summaries

## Development

The agent follows the same workflow as research_claude:

1. User provides a research query
2. Lead agent creates a task in the database
3. Lead agent breaks query into 2-4 subtopics
4. Lead agent spawns 2-4 researcher subagents in parallel
5. Each researcher searches, scrapes, and saves findings to database
6. Lead agent spawns summarizer subagent
7. Summarizer loads findings and creates a comprehensive summary
8. All data is stored in the database for later retrieval

## Files

```
research_lcdeep/
├── README.md                 # This file
├── __init__.py              # Module exports
├── agent.py                 # Main entry point and agent creation
├── tools.py                 # LangChain database tools wrapper
└── prompts/
    ├── lead_agent.md        # Lead agent system prompt
    ├── researcher.md        # Researcher subagent prompt
    └── summarizer.md        # Summarizer subagent prompt
```

## Dependencies

- `deepagents` - LangChain Deep Agents framework
- `langchain` - LangChain core
- `langchain-anthropic` - Anthropic model integration
- `langchain-mcp-adapters` - MCP client for BrightData tools
- `asyncpg` - PostgreSQL async driver (via shared db_tools)

All dependencies are already installed in the project.
