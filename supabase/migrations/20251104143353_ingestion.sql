-- ============================================================================
-- INGESTION SUBSYSTEM (ing_)
-- ============================================================================
-- Raw sources from external world and validated events
-- Dependencies: gov_ (events reference administrations)

-- ============================================================================
-- SOURCES: Raw inputs from external world
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ing_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source identification
  url text,                                    -- Original URL (nullable for manual entries)
  title text,                                  -- Headline/title
  source_type text NOT NULL CHECK (source_type IN (
    'news',              -- News articles (ANSA, newspapers)
    'official_gazette',  -- Gazzetta Ufficiale, official publications
    'press_release',     -- Government press releases
    'council_minutes',   -- Municipal council meeting minutes
    'social',            -- Social media posts
    'manual'             -- Manually entered by admin
  )),
  source_name text,                            -- e.g., 'Gazzetta Ufficiale', 'ANSA', 'Comune di Milano'
  published_at timestamptz,                    -- When source was originally published

  -- Content
  raw_content text,                            -- Full text/HTML

  -- Processing
  fetch_status text NOT NULL DEFAULT 'pending' CHECK (fetch_status IN (
    'pending',    -- Not yet fetched
    'fetching',   -- Currently fetching
    'fetched',    -- Successfully fetched
    'failed'      -- Fetch failed
  )),
  fetch_error text,                            -- Error message if failed
  fetched_at timestamptz,

  processing_status text NOT NULL DEFAULT 'unprocessed' CHECK (processing_status IN (
    'unprocessed',  -- Not yet analyzed by AI
    'processing',   -- AI currently analyzing
    'processed',    -- AI analysis complete
    'discarded'     -- Marked as not relevant
  )),

  -- AI-generated fields
  ai_summary text,                             -- LLM-generated summary
  ai_extracted_data jsonb DEFAULT '{}',        -- Extracted: entities, dates, keywords, event hints

  -- Metadata
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ing_sources_fetch_status ON public.ing_sources(fetch_status);
CREATE INDEX IF NOT EXISTS idx_ing_sources_processing_status ON public.ing_sources(processing_status);
CREATE INDEX IF NOT EXISTS idx_ing_sources_source_type ON public.ing_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_ing_sources_published_at ON public.ing_sources(published_at);
CREATE INDEX IF NOT EXISTS idx_ing_sources_url ON public.ing_sources(url);

CREATE TRIGGER set_updated_at_ing_sources
  BEFORE UPDATE ON public.ing_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- EVENTS: Validated temporal occurrences
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  administration_id uuid REFERENCES public.gov_administrations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description_short text CHECK (length(description_short) <= 100),
  description text CHECK (length(description) <= 1000),
  type text NOT NULL, -- Legislative: 'legislative_session', 'bill_proposal', 'referendum', 'amendment'
                      -- Executive: 'executive_order', 'appointment', 'regulation_update', 'administrative_reform'
                      -- Judicial: 'court_ruling', 'legal_challenge'
                      -- Public: 'public_consultation', 'citizen_petition', 'protest'
                      -- Budget: 'budget_approval', 'funding_decision', 'tax_change'
                      -- Planning: 'plan_adoption', 'zoning_decision', 'project_launch'
                      -- Operations: 'service_change', 'contract_award', 'partnership_agreement'
                      -- Emergency: 'emergency_declaration', 'crisis_response'
                      -- Review: 'policy_review'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ing_events_administration_id ON public.ing_events(administration_id);
CREATE INDEX IF NOT EXISTS idx_ing_events_type ON public.ing_events(type);

CREATE TRIGGER set_updated_at_ing_events
  BEFORE UPDATE ON public.ing_events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- ADD FOREIGN KEY: gov_changes.event_id -> ing_events.id
-- ============================================================================
ALTER TABLE public.gov_changes
  ADD CONSTRAINT fk_gov_changes_event_id
  FOREIGN KEY (event_id) REFERENCES public.ing_events(id) ON DELETE CASCADE;
