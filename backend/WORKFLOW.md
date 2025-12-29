# Provision Generation Workflow

## Overview

The provision generation workflow has a clear separation of concerns between **information gathering** (research agents) and **business logic** (provision service).

## Architecture

```
User Input → Provision Service → Research Agent → Provision Service → User Review → Production
             (generates prompt)   (gathers info)   (structures draft)  (edits)
```

## Components

### 1. Research Agents (Information Gathering ONLY)

**Location**: `backend/agents/research_lcdeep/` and `backend/agents/research_claude/`

**Responsibility**: Gather factual information from the web and synthesize it into research summaries.

**What Research Agents DO**:
- Search for information using web search tools (BrightData or Claude's built-in search)
- Save raw sources to database (`ra_sources` table)
- Extract and save findings to database (`ra_findings` table)
- Synthesize findings into markdown research summaries (`ra_summaries` table)
- Track research progress (`ra_research_tasks` table)

**What Research Agents DO NOT DO**:
- ❌ Determine provision type (ownership, contract, regulation, etc.)
- ❌ Calculate relevance scores
- ❌ Calculate confidence scores
- ❌ Structure data for provision schema
- ❌ Enforce business constraints (e.g., character limits)
- ❌ Make any provision-specific decisions

**Database Tables** (all prefixed with `ra_`):
- `ra_research_tasks` - Top-level research tasks
- `ra_sources` - Web sources discovered
- `ra_findings` - Individual facts extracted
- `ra_summaries` - Synthesized research summaries
- `ra_summary_findings` - Links summaries to findings
- `ra_agent_actions` - Audit trail

**Key Concept**: Research agents are **domain-agnostic**. They could be used for any research task, not just provisions.

### 2. Provision Service (Business Logic)

**Location**: `backend/services/provision.py`

**Responsibility**: Transform user input into structured provisions, making all provision-specific decisions.

**What Provision Service DOES**:
- Generate research prompts from user input (inline LLM call)
- Delegate research to research agents
- Generate provision drafts from research summaries (inline LLM call)
- Determine provision type (ownership, contract, regulation, taxation, allocation, designation)
- Calculate relevance scores (0-10)
- Calculate confidence scores (0.0-1.0)
- Structure data according to provision schema
- Enforce business constraints (e.g., `description_short` must be ≤ 100 chars)

**Key Methods**:
- `generate_research_prompt()` - Expands user input into detailed research prompt
- `generate_provision_draft()` - Structures research summary into provision format
- `start_research()` - Delegates to research service
- `get_research_results()` - Retrieves research summary

### 3. Provision API Routes (User Interface)

**Location**: `backend/api/routes/provision.py`

**Endpoints**:
1. `POST /provision/generate-prompt` - Step 1: Generate research prompt
2. `POST /provision/start-research` - Step 2: Start research agent
3. `GET /provision/research-status/{task_id}` - Step 3: Poll for research completion
4. `POST /provision/generate-draft` - Step 4: Generate provision draft from research

## Workflow Steps

### Step 1: Generate Research Prompt
**User provides**: Brief description (e.g., "Ownership of ATM Spa")
**API**: `POST /provision/generate-prompt`
**Service**: Inline LLM call expands this into a detailed research prompt
**Output**: Research prompt for user approval

### Step 2: Start Research
**User provides**: Approved research prompt, entity info, agent type (claude/lcdeep)
**API**: `POST /provision/start-research`
**Service**: Creates research task in database, spawns research agent in background
**Output**: `task_id` for polling

### Step 3: Research Execution (Background)
**Agent**: Research agent searches web, saves sources/findings, generates research summary
**Database**: All research data saved to `ra_*` tables
**Output**: Research summary (markdown) saved to `ra_summaries` table

### Step 4: Generate Provision Draft
**Input**: Research summary from database
**API**: `POST /provision/generate-draft`
**Service**: Inline LLM call structures research into provision format
**Decisions Made**:
- provision_type (one of 6 types)
- relevance (0-10)
- confidence (0.0-1.0)
- title, description_short, description, summary_md
- source_urls extracted

**Output**: Structured provision draft for user review

### Step 5: User Review
**Frontend**: User can edit all fields
**Common Edits**: Fix provision type, adjust relevance, refine descriptions
**Database**: Draft saved to `provision_drafts` table

### Step 6: Save to Production
**API**: Server action `saveDraftToProduction()`
**Database**: Draft copied to `provisions` table, draft deleted

## ID Tracking

### Research Task ID
- UUID generated when research starts
- Tracks research progress in `ra_research_tasks` table
- Links all research data (sources, findings, summaries)
- **Scope**: Research agent domain only

### Provision Draft ID
- UUID generated when draft created
- Tracks provision workflow in `provision_drafts` table
- References `research_task_id` but is separate entity
- **Scope**: Provision domain only

### Provision ID
- UUID generated when saved to production
- Final production provision in `provisions` table
- **Scope**: Public-facing provision data

## Key Design Principles

### 1. Separation of Concerns
- **Research agents**: Information gathering only
- **Provision service**: Business logic and decisions
- **API routes**: User interaction orchestration

### 2. Loose Coupling
- Research agents are domain-agnostic (could be reused for other research tasks)
- Provision service uses research as a data source, not a dependency
- Both can evolve independently

### 3. User Control
- User approves research prompt before research starts
- User reviews and edits all provision fields before saving
- Multi-step workflow with clear decision points

### 4. Database as Source of Truth
- All research data persisted to database
- Research summaries can be regenerated from findings
- Provision drafts independent from research tasks
- Full audit trail maintained

## Adding New Provision Types

If you need to add a new provision type:

1. **DO NOT** modify research agents - they are type-agnostic
2. **DO** update `backend/services/provision.py`:
   - Add type to system prompt in `generate_provision_draft()`
3. **DO** update frontend:
   - Add to `PROVISION_TYPES` array
   - Add description to `typeDescriptions`
4. **DO** update database:
   - Add row to `provision_types` table

## Common Mistakes to Avoid

❌ **Don't** add provision-specific logic to research agents
❌ **Don't** make research agents aware of provision types
❌ **Don't** bypass the provision service and call research agents directly from routes
❌ **Don't** store provision-specific metadata in research tables

✅ **Do** keep research agents domain-agnostic
✅ **Do** make all provision decisions in provision service
✅ **Do** use provision service as the orchestration layer
✅ **Do** maintain clear database table prefixes (`ra_*` vs `provisions`)

## Testing the Workflow

```bash
# 1. Start the backend API
cd backend
source .venv/bin/activate
python -m uvicorn api.main:app --reload

# 2. Create a provision draft in the UI
# Visit http://localhost:3000/admin/provision-ingestion

# 3. Monitor research progress
# Check ra_research_tasks, ra_sources, ra_findings, ra_summaries tables

# 4. Review generated draft
# Check provision_drafts table

# 5. Save to production
# Check provisions table
```

## Future Improvements

Potential areas for enhancement:

1. **Research Quality**: Add source credibility scoring
2. **Caching**: Cache research results for similar queries
3. **Revisions**: Support revision workflows (research feedback loop)
4. **Analytics**: Track provision generation success rates
5. **Templates**: Pre-built research prompts for common provision types
