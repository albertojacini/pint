# Provision Ingestion Workflow

Complete documentation of the provision ingestion workflow, from admin dashboard to production database.

## Overview

The provision ingestion system is a fully automated AI-assisted pipeline that transforms user descriptions into structured provisions in the database.

**Architecture:**
- **Frontend**: Next.js admin dashboard (`/admin/provision-ingestion`)
- **Backend**: FastAPI service (`/provision/*` endpoints)
- **Research Agent**: Claude SDK agent (research_claude) or LangChain Deep Agents (research_lcdeep)
- **Database**: PostgreSQL with Drizzle ORM

## Workflow Steps

### 1. User Input
**Page**: `/admin/provision-ingestion/new`
**Component**: `NewDraftForm`

User provides:
- Political entity (dropdown)
- Provision description (free text)

**Example**: "Ownership of ATM (Milan public transport company)"

**Action**: Creates draft in `provision_drafts` table with status `input`

---

### 2. Generate Research Prompt (Auto)
**API**: `POST /provision/generate-prompt`
**Status**: `input` → `prompt_generated`

**Input:**
```json
{
  "input_description": "Ownership of ATM",
  "entity_name": "Milan"
}
```

**AI Processing**: LLM expands user input into detailed research prompt

**Output:**
```json
{
  "research_prompt": "Research the ownership structure of ATM (Azienda Trasporti Milanesi)...",
  "reasoning": "The user wants information about..."
}
```

**Trigger**: Automatically runs when draft is created (in `DraftWorkflow` component)

---

### 3. Review & Approve Prompt
**Page**: `/admin/provision-ingestion/[id]`
**Component**: `DraftWorkflow` (Step 2)

User can:
- Review generated research prompt
- Edit prompt if needed
- Regenerate prompt
- Approve and start research
- Delete draft

---

### 4. Start Research Job
**API**: `POST /provision/start-research`
**Status**: `prompt_generated` → `researching`

**Input:**
```json
{
  "research_prompt": "...",
  "entity_name": "Milan",
  "entity_id": "uuid"
}
```

**Agent Selection** (configured in `backend/services/research_config.py`):
- **"claude"** (default): Claude SDK with built-in WebSearch
- **"lcdeep"**: LangChain Deep Agents with BrightData (search_engine, scrape_as_markdown, query_wikipedia)

**Backend Process**:
1. Creates research task in `ra_researches` table
2. Returns `task_id` immediately
3. Runs selected research agent in background (async)

**Output:**
```json
{
  "task_id": "uuid"
}
```

**Research Agent**: Spawns subagents to:
- Search web for information
- Evaluate sources with relevance/reliability scores
- Auto-scrape and summarize source content
- Save evaluated sources to `ra_sources` table
- Synthesize final research summary

---

### 5. Poll Research Status
**API**: `GET /provision/research-status/{task_id}`
**Polling**: Every 3 seconds while status is `researching`

**Response (in progress):**
```json
{
  "status": "researching",
  "sources_count": 5,
  "summary": null
}
```

**Response (complete):**
```json
{
  "status": "completed",
  "sources_count": 8,
  "summary": "# ATM Ownership\n\nATM is owned by the Municipality of Milan..."
}
```

**Auto-transition**: When status becomes `completed`, UI auto-proceeds to next step

---

### 6. Generate Provision Draft (Auto)
**API**: `POST /provision/generate-draft`
**Status**: `research_complete` → `generating_draft` → `review`

**Input:**
```json
{
  "research_summary": "# ATM Ownership...",
  "entity_name": "Milan",
  "input_description": "Ownership of ATM"
}
```

**AI Processing**: LLM structures research into provision format, automatically determines provision type

**Output:**
```json
{
  "title": "Municipality of Milan's Ownership of ATM",
  "description_short": "Milan owns 100% of ATM through direct shareholding",
  "description": "The Municipality of Milan holds complete ownership...",
  "summary_md": "## Overview\n\nATM (Azienda Trasporti Milanesi)...",
  "provision_type": "ownership",
  "relevance": 8,
  "confidence": 0.92,
  "source_urls": ["https://..."]
}
```

**Trigger**: Automatically runs when research completes

---

### 7. Review & Edit Draft
**Page**: `/admin/provision-ingestion/[id]`
**Component**: `DraftWorkflow` (Step 6)

User can edit:
- Title
- Provision type (ownership, contract, regulation, taxation, allocation, designation)
- Short description (max 100 chars)
- Description (max 1000 chars)
- Summary markdown (max 20000 chars)
- Relevance (0-10 scale)

**Read-only info**:
- Source URLs
- Confidence score
- Research summary (collapsible)

---

### 8. Save to Production
**Action**: `saveDraftToProduction`
**Status**: `review` → (draft deleted)

**Process**:
1. Validates draft has required fields (title, provision_type)
2. Generates slug from title
3. Creates provision in `provisions` table
4. Creates type association in `provision_type_associations` table
5. Deletes draft from `provision_drafts` table

**Revalidates**:
- `/admin/provision-ingestion` (draft list)
- `/pe` (public entity pages)

---

## Database Schema

### Draft Table: `provision_drafts`
```sql
CREATE TABLE provision_drafts (
  id UUID PRIMARY KEY,
  entity_id UUID NOT NULL,
  created_by UUID,

  -- Workflow fields
  input_description TEXT NOT NULL,
  research_prompt TEXT,
  research_task_id UUID,
  research_summary TEXT,
  job_status VARCHAR(50) NOT NULL,
  error_message TEXT,

  -- Generated provision fields
  title TEXT,
  description_short TEXT,
  description TEXT,
  summary TEXT,
  provision_type VARCHAR(50),
  extra_data JSONB,
  confidence VARCHAR(10),
  relevance INTEGER,
  source_urls TEXT[],

  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

**Statuses**: `input`, `prompt_generated`, `researching`, `research_complete`, `generating_draft`, `review`, `completed`, `failed`

### Research Tables: `ra_*`
- `ra_researches` - Research tasks with input, status, and final summary
- `ra_sources` - Web sources with evaluations, raw content, and AI-generated summaries

### Production Table: `provisions`
Final provisions visible to public users

---

## API Endpoints

### Provision Workflow
```
POST   /provision/generate-prompt      # Step 1: Expand user input
POST   /provision/start-research       # Step 2: Start research agent
GET    /provision/research-status/:id  # Step 3: Poll research
POST   /provision/generate-draft       # Step 4: Structure draft
```

**Agent Selection**: Configured server-side in `backend/services/research_config.py`:
- `"claude"` (default): Claude SDK agent with WebSearch
- `"lcdeep"`: LangChain Deep Agents with BrightData search
- Simply comment/uncomment the desired agent and restart the server

---

## Frontend Components

### Pages
- `/admin/provision-ingestion` - Draft list
- `/admin/provision-ingestion/new` - Create draft
- `/admin/provision-ingestion/[id]` - Draft workflow

### Components
- `NewDraftForm` - Initial input form
- `DraftWorkflow` - Multi-step workflow UI with auto-progression

### Server Actions
- `createDraft()` - Create new draft
- `updateDraft()` - Update draft fields
- `getDraft()` / `getDrafts()` - Fetch drafts
- `saveDraftToProduction()` - Promote to production
- `deleteDraft()` - Delete draft

---

## Auto-Progression Flow

The workflow includes automatic transitions:

1. **On draft creation** (`input`):
   - Auto-generates research prompt
   - Transitions to `prompt_generated`

2. **On research completion** (`research_complete`):
   - Auto-generates provision draft
   - Transitions to `review`

**User interaction required**:
- Approve research prompt and select agent (click "Start Research")
- Review and edit final draft (click "Save to Production")

---

## Error Handling

### Failed States
- **Status**: `failed`
- **Display**: Error message from `errorMessage` field
- **Actions**:
  - Retry (resets to `input`)
  - Delete draft

### Validation
- Production save validates required fields (title, provision_type)
- Character limits enforced on frontend
- Relevance must be 0-10

---

## Environment Configuration

```bash
# Frontend (.env.local)
NEXT_PUBLIC_AGENTS_API_URL=http://localhost:8000

# Backend (.env)
ANTHROPIC_API_KEY=your_key
BRIGHTDATA_API_KEY=your_key  # For lcdeep agent
DATABASE_URL=postgresql://...
```

---

## Testing the Workflow

1. **Start backend**:
   ```bash
   cd backend
   source .venv/bin/activate
   uvicorn api.main:app --reload
   ```

2. **Start frontend**:
   ```bash
   cd app
   pnpm dev
   ```

3. **Navigate**: http://localhost:3000/admin/provision-ingestion/new

4. **Create draft**:
   - Select entity (e.g., "Milan")
   - Enter description (e.g., "Ownership of ATM")
   - Click "Create Draft"

5. **Watch auto-progression**:
   - Prompt generates automatically
   - Review and click "Start Research"
   - Research runs (2-5 minutes)
   - Draft generates automatically
   - Review and click "Save to Production"

6. **Verify**: Check `/pe/[entity-slug]` for new provision

---

## Key Features

✅ **Fully automated pipeline** - Minimal manual steps
✅ **AI-powered** - LLM handles prompt generation and draft structuring
✅ **Multi-agent research** - Parallel researchers gather comprehensive data
✅ **Flexible** - Support for both Claude SDK and LangChain agents
✅ **User control** - Review and edit at key checkpoints
✅ **Type-safe** - Pydantic models and Drizzle schema
✅ **Real-time updates** - Polling for research status
✅ **Production-ready** - Error handling, validation, revalidation

---

## Future Enhancements

- [ ] WebSocket for real-time updates (replace polling)
- [ ] Progress indicators with step details
- [ ] Bulk import from CSV/API
- [ ] Version history for drafts
- [ ] Multi-language support
- [ ] Automated fact-checking
- [ ] Collaborative editing
