# DEPRECATED: Claude SDK Research Agent

⚠️ **This agent is deprecated and will be removed in a future version.**

## Migration

Use `research_lcdeep` instead, which provides the same research functionality with enhanced capabilities:

- BrightData integration for better web scraping
- Wikipedia API access
- Improved source evaluation
- Same database schema and interface

## How to Switch

Edit `backend/services/research_config.py`:

```python
# Change this:
RESEARCH_AGENT: Literal["claude", "lcdeep"] = "claude"

# To this:
RESEARCH_AGENT: Literal["claude", "lcdeep"] = "lcdeep"
```

## Current Status

This directory now contains only a backward-compatibility gateway that delegates all work to `research_lcdeep`. All implementation files have been removed:

- ✅ Kept: `agent.py` (gateway only)
- ❌ Removed: `prompts/` (all prompt files)
- ❌ Removed: `utils/` (all utility modules)
- ❌ Removed: `mcp_server.py` (MCP server configuration)

## Deprecation Timeline

- **Current**: Gateway mode - delegates to research_lcdeep with deprecation warnings
- **Future**: This directory will be completely removed

## Why Deprecated?

1. **Consolidation**: Maintaining two agents with similar functionality was redundant
2. **Enhanced Features**: research_lcdeep provides better search capabilities
3. **Cleaner Architecture**: Single agent implementation is easier to maintain
