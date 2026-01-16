### Guidelines
IMPORTANT: This is an early stage project:
- don't handle errors in general. Better to fail
- feel free to break things, don't care about backward compatibility

## Database Migrations
- Create new migrations for schema changes (don't edit existing migrations)

## Python Development
**CRITICAL**:
- ALWAYS use `uv` for package management (NEVER use `pip`)
- ALWAYS activate the virtual environment before running Python commands:
  ```bash
  cd /Users/albertojacini/Projects/pint/backend && source .venv/bin/activate
  ```
- Package installation: `uv add <package>` or `uv pip install <package>`
- Run Python scripts: Always prepend with activation command

## LLM Calls
**CRITICAL**:
- ALWAYS use LangChain wrappers for LLM calls (NEVER use direct API clients like `Anthropic` or `AsyncAnthropic`)
- Use `ChatAnthropic` from `langchain_anthropic` for Claude models
- Example pattern:
  ```python
  from langchain_anthropic import ChatAnthropic

  model = ChatAnthropic(model="claude-sonnet-4-5", temperature=0, max_tokens=2048)
  response = await model.ainvoke(prompt)
  content = response.content
  ```
- For structured output, use `model.with_structured_output(PydanticModel)`
- For tool calling, use `model.bind_tools(tools)`

## App Configuration
**CRITICAL**:
- All configurable parameters for apps in `/backend/apps/` MUST be defined in `backend/core/config.py`
- Use environment variable prefix convention: `{APP_NAME}_APP__` (e.g., `SOURCES_APP__`, `ARTIFACT_GENERATION_APP__`)
- Example:
  ```python
  # In core/config.py
  self.my_app__model: str = os.getenv("MY_APP__MODEL", "claude-sonnet-4-5")
  self.my_app__chunk_limit: int = int(os.getenv("MY_APP__CHUNK_LIMIT", "20"))

  # In apps/my_app/services.py
  from core.config import settings
  chunk_limit = settings.my_app__chunk_limit
  ```
- NEVER hardcode configurable values (models, thresholds, limits) directly in app code

## Documentation Policy
**CRITICAL**:
- NEVER create documentation files (*.md, *.txt, or similar) unless explicitly requested by the user
- NEVER create README files for packages, modules, or features
- Use inline code comments and docstrings for documentation instead
- The only documentation files in this project are README.md and CLAUDE.md

## Project Overview

**Pint** (Public Interface) is a public policies platform with two main objectives:
1. **Reference Platform**: Provide up-to-date, UX-rich information about public administrations (cities, countries) and their policies
2. **Collaboration Platform**: Enable collaboration on political projects and policy development

## Project Structure
**Database**: Migrations at `/supabase/migrations`
**ORM**: Schema at `app/src/lib/db/schema.ts`
**Database Seeding**: Seeding scripts are located in `/tooling/scripts/seed/`

## Database Seeding

Seed data is located in `tooling/scripts/seed/data/base/` - contains minimal data for understanding the schema.

Commands:
- `pnpm db:seed` - Seed the database
- `pnpm db:reset` - Reset and seed the database



