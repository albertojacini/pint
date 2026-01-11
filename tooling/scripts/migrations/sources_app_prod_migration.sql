-- ============================================================================
-- PRODUCTION MIGRATION: sources-app branch changes
-- Run in order - dependencies matter!
-- ============================================================================

-- ============================================================================
-- 1. SOURCES SUBSYSTEM (sou_) - New tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sou_publishers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  url text,
  feed_url text,
  publisher_type text NOT NULL CHECK (publisher_type IN (
    'official', 'news', 'academic', 'social', 'open_data', 'gazette'
  )),
  language text,
  reliability_score numeric(3,1) CHECK (reliability_score >= 0 AND reliability_score <= 10),
  update_frequency text CHECK (update_frequency IN (
    'realtime', 'daily', 'weekly', 'monthly', 'irregular'
  )),
  access_method text CHECK (access_method IN ('rss', 'api', 'scrape', 'manual')),
  is_active boolean NOT NULL DEFAULT true,
  coverage jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sou_publishers_type ON public.sou_publishers(publisher_type);
CREATE INDEX IF NOT EXISTS idx_sou_publishers_active ON public.sou_publishers(is_active);
CREATE INDEX IF NOT EXISTS idx_sou_publishers_reliability ON public.sou_publishers(reliability_score);

CREATE TRIGGER set_updated_at_sou_publishers
  BEFORE UPDATE ON public.sou_publishers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.sou_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id uuid REFERENCES public.sou_publishers(id) ON DELETE SET NULL,
  url text,
  title text,
  document_type text NOT NULL CHECK (document_type IN (
    'article', 'pdf', 'post', 'gazette_issue', 'press_release',
    'minutes', 'report', 'legislation', 'other'
  )),
  language text,
  published_at timestamptz,
  raw_content text,
  content_hash text,
  fetch_status text NOT NULL DEFAULT 'pending' CHECK (fetch_status IN (
    'pending', 'fetching', 'fetched', 'failed'
  )),
  fetch_error text,
  fetched_at timestamptz,
  processing_status text NOT NULL DEFAULT 'unprocessed' CHECK (processing_status IN (
    'unprocessed', 'processing', 'processed', 'discarded'
  )),
  summary text,
  extracted_data jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sou_documents_publisher ON public.sou_documents(publisher_id);
CREATE INDEX IF NOT EXISTS idx_sou_documents_type ON public.sou_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_sou_documents_fetch_status ON public.sou_documents(fetch_status);
CREATE INDEX IF NOT EXISTS idx_sou_documents_processing_status ON public.sou_documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_sou_documents_published_at ON public.sou_documents(published_at);
CREATE INDEX IF NOT EXISTS idx_sou_documents_url ON public.sou_documents(url);
CREATE INDEX IF NOT EXISTS idx_sou_documents_content_hash ON public.sou_documents(content_hash);

CREATE TRIGGER set_updated_at_sou_documents
  BEFORE UPDATE ON public.sou_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 2. ADD promoted_document_id TO ing_sources
-- ============================================================================

ALTER TABLE public.ing_sources
  ADD COLUMN IF NOT EXISTS promoted_document_id uuid REFERENCES public.sou_documents(id) ON DELETE SET NULL;

-- ============================================================================
-- 3. REPLACE ingpl_candidate_sources WITH ingpl_candidate_documents
-- ============================================================================

-- Drop old junction table (links to ing_sources)
DROP TABLE IF EXISTS public.ingpl_candidate_sources;

-- Create new junction table (links to sou_documents)
CREATE TABLE IF NOT EXISTS public.ingpl_candidate_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.ingpl_event_candidates(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.sou_documents(id) ON DELETE CASCADE,
  relevance text NOT NULL DEFAULT 'primary' CHECK (relevance IN (
    'primary', 'supporting', 'related'
  )),
  created_at timestamptz DEFAULT now(),
  UNIQUE(candidate_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_ingpl_candidate_documents_candidate_id ON public.ingpl_candidate_documents(candidate_id);
CREATE INDEX IF NOT EXISTS idx_ingpl_candidate_documents_document_id ON public.ingpl_candidate_documents(document_id);

-- ============================================================================
-- 4. NEW: ing_event_documents (provenance for approved events)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ing_event_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.ing_events(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.sou_documents(id) ON DELETE CASCADE,
  relevance text NOT NULL DEFAULT 'primary' CHECK (relevance IN (
    'primary', 'supporting', 'related'
  )),
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_ing_event_documents_event_id ON public.ing_event_documents(event_id);
CREATE INDEX IF NOT EXISTS idx_ing_event_documents_document_id ON public.ing_event_documents(document_id);

-- ============================================================================
-- 5. NEW: propl_draft_documents (links provision drafts to source documents)
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

-- ============================================================================
-- 6. ADD promoted_document_id TO resag_sources
-- ============================================================================

ALTER TABLE public.resag_sources
  ADD COLUMN IF NOT EXISTS promoted_document_id uuid REFERENCES public.sou_documents(id) ON DELETE SET NULL;
