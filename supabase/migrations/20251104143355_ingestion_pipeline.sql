-- ============================================================================
-- INGESTION PIPELINE SUBSYSTEM (ingpl_)
-- ============================================================================
-- Staging area for event candidates before approval
-- Flow: ing_sources -> sou_documents -> ingpl_event_candidates -> ing_events -> gov_changes
-- Dependencies: ing_, gov_, sou_

-- ============================================================================
-- ADD promoted_document_id TO ing_sources
-- ============================================================================
-- Track promotion from ing_sources to sou_documents

ALTER TABLE public.ing_sources
  ADD COLUMN IF NOT EXISTS promoted_document_id uuid REFERENCES public.sou_documents(id) ON DELETE SET NULL;

-- ============================================================================
-- EVENT CANDIDATES: Aggregated potential events (before human approval)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ingpl_event_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Draft event data
  title text,
  description text,
  event_type text,                             -- Same types as ing_events table

  -- Classification (AI-detected)
  detected_entity_id uuid REFERENCES public.gov_entities(id) ON DELETE SET NULL,
  detected_administration_id uuid REFERENCES public.gov_administrations(id) ON DELETE SET NULL,

  -- AI metadata
  confidence_score float CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  ai_reasoning text,                           -- Why AI thinks this is an event

  -- Pipeline status
  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',    -- Awaiting review
    'reviewing',  -- Currently being reviewed
    'approved',   -- Approved -> promoted to event
    'rejected',   -- Rejected by reviewer
    'merged'      -- Merged into another candidate
  )),
  merged_into_id uuid REFERENCES public.ingpl_event_candidates(id) ON DELETE SET NULL,

  -- Output (populated on approval)
  event_id uuid REFERENCES public.ing_events(id) ON DELETE SET NULL,

  -- Review audit
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  rejection_reason text,

  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingpl_event_candidates_status ON public.ingpl_event_candidates(status);
CREATE INDEX IF NOT EXISTS idx_ingpl_event_candidates_event_type ON public.ingpl_event_candidates(event_type);
CREATE INDEX IF NOT EXISTS idx_ingpl_event_candidates_detected_entity_id ON public.ingpl_event_candidates(detected_entity_id);
CREATE INDEX IF NOT EXISTS idx_ingpl_event_candidates_event_id ON public.ingpl_event_candidates(event_id);

CREATE TRIGGER set_updated_at_ingpl_event_candidates
  BEFORE UPDATE ON public.ingpl_event_candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- CANDIDATE DOCUMENTS: Junction table linking candidates to sou_documents
-- ============================================================================
-- After ing_sources are processed, they are promoted to sou_documents.
-- Candidates link to the promoted documents, not raw sources.

CREATE TABLE IF NOT EXISTS public.ingpl_candidate_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.ingpl_event_candidates(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.sou_documents(id) ON DELETE CASCADE,
  relevance text NOT NULL DEFAULT 'primary' CHECK (relevance IN (
    'primary',     -- Main source for this event
    'supporting',  -- Additional confirmation
    'related'      -- Tangentially related
  )),
  created_at timestamptz DEFAULT now(),
  UNIQUE(candidate_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_ingpl_candidate_documents_candidate_id ON public.ingpl_candidate_documents(candidate_id);
CREATE INDEX IF NOT EXISTS idx_ingpl_candidate_documents_document_id ON public.ingpl_candidate_documents(document_id);

-- ============================================================================
-- EVENT DOCUMENTS: Provenance for approved events
-- ============================================================================
-- When a candidate is approved and promoted to ing_events, the document
-- links are copied here to preserve provenance.

CREATE TABLE IF NOT EXISTS public.ing_event_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.ing_events(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.sou_documents(id) ON DELETE CASCADE,
  relevance text NOT NULL DEFAULT 'primary' CHECK (relevance IN (
    'primary',     -- Main source for this event
    'supporting',  -- Additional confirmation
    'related'      -- Tangentially related
  )),
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_ing_event_documents_event_id ON public.ing_event_documents(event_id);
CREATE INDEX IF NOT EXISTS idx_ing_event_documents_document_id ON public.ing_event_documents(document_id);

-- ============================================================================
-- CHANGE CANDIDATES: Draft changes proposed by AI (before approval)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ingpl_change_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.ingpl_event_candidates(id) ON DELETE CASCADE,

  -- Target specification
  target_type text NOT NULL CHECK (target_type IN ('provision', 'entity', 'administration')),
  target_id uuid,                              -- Existing target ID (null if action='create')

  -- Proposed change
  action text NOT NULL CHECK (action IN (
    'create',  -- Create new target
    'update',  -- Update existing target
    'delete'   -- Delete/repeal target
  )),
  proposed_data jsonb NOT NULL DEFAULT '{}',   -- Fields to set/update
  description text,                            -- Human-readable change description

  -- Review status
  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',   -- Awaiting review
    'approved',  -- Will be applied on candidate approval
    'rejected',  -- Won't be applied
    'modified'   -- Human modified the proposal
  )),

  -- Output (populated on approval)
  change_id uuid REFERENCES public.gov_changes(id) ON DELETE SET NULL,

  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingpl_change_candidates_candidate_id ON public.ingpl_change_candidates(candidate_id);
CREATE INDEX IF NOT EXISTS idx_ingpl_change_candidates_target ON public.ingpl_change_candidates(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_ingpl_change_candidates_status ON public.ingpl_change_candidates(status);

CREATE TRIGGER set_updated_at_ingpl_change_candidates
  BEFORE UPDATE ON public.ingpl_change_candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
