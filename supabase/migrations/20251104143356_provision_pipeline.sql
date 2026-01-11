-- ============================================================================
-- PROVISION PIPELINE SUBSYSTEM (propl_)
-- ============================================================================
-- Staging area for AI-generated provisions before approval
-- Flow: User input -> Research -> Draft -> Review -> gov_provisions
-- Dependencies: gov_, resag_ (loose coupling via research_id)

-- ============================================================================
-- PROVISION DRAFTS: Work-in-progress provisions from AI pipeline
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.propl_provision_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES public.gov_entities(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  -- User input
  input_description text NOT NULL,

  -- Prompt generation phase
  research_prompt text,

  -- Research phase (loose coupling via research_id)
  research_id uuid,                        -- Links to resag_researches (no FK)
  research_summary text,                   -- Cached summary from research

  -- Simplified job status (no classification steps)
  job_status text NOT NULL DEFAULT 'input' CHECK (job_status IN (
    'input',              -- Initial: user provides topic
    'prompt_generated',   -- LLM generated research prompt
    'researching',        -- Research agent running
    'research_complete',  -- Research done
    'generating_draft',   -- LLM generating provision draft
    'review',             -- User reviewing/editing
    'completed',          -- Ready for production
    'failed'
  )),
  error_message text,

  -- Draft content (populated by LLM after research)
  title text,
  description_short text CHECK (length(description_short) <= 100),
  description text CHECK (length(description) <= 1000),
  summary_md text CHECK (length(summary_md) <= 20000),
  provision_type_codes text[], -- Array of provision type codes
  display_data jsonb NOT NULL DEFAULT '{"items":[]}',
  display_changes jsonb NOT NULL DEFAULT '{"items":[]}',

  -- Metadata
  confidence float,
  source_urls text[],
  relevance integer CHECK (relevance >= 0 AND relevance <= 10),

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_propl_provision_drafts_entity_id ON public.propl_provision_drafts(entity_id);
CREATE INDEX IF NOT EXISTS idx_propl_provision_drafts_job_status ON public.propl_provision_drafts(job_status);
CREATE INDEX IF NOT EXISTS idx_propl_provision_drafts_created_by ON public.propl_provision_drafts(created_by);

CREATE TRIGGER set_updated_at_propl_provision_drafts
  BEFORE UPDATE ON public.propl_provision_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- DRAFT DOCUMENTS: Links provision drafts to source documents
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.propl_draft_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid NOT NULL REFERENCES public.propl_provision_drafts(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.sou_documents(id) ON DELETE CASCADE,
  relevance text NOT NULL CHECK (relevance IN ('primary', 'supporting', 'reference')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(draft_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_propl_draft_documents_draft ON public.propl_draft_documents(draft_id);
CREATE INDEX IF NOT EXISTS idx_propl_draft_documents_document ON public.propl_draft_documents(document_id);
