### Guidelines
Start every response with a 🌵, so I know this file is being read.
IMPORTANT: This is an early stage project:
- don't handle errors in general. Better to fail
- edit the initial db migration, don't create extra migrations since the db will be reset every time
- feel free to break things, don't care about backward compatibility

## Python Development
**CRITICAL**:
- ALWAYS use `uv` for package management (NEVER use `pip`)
- ALWAYS activate the virtual environment before running Python commands:
  ```bash
  cd /Users/albertojacini/Projects/pint/agents && source .venv/bin/activate
  ```
- Package installation: `uv add <package>` or `uv pip install <package>`
- Run Python scripts: Always prepend with activation command

## Project Overview

**Pint** (Public Interface) is a public policies platform with two main objectives:
1. **Reference Platform**: Provide up-to-date, UX-rich information about public administrations (cities, countries) and their policies
2. **Collaboration Platform**: Enable collaboration on political projects and policy development

## Project Structure
**Database**: Migrations at `/supabase/migrations`
**ORM**: Schema at `app/src/lib/db/schema.ts`
**Database Seeding**: Seeding scripts are located in `/tooling/scripts/seed/`



