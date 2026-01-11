-- ============================================================================
-- RESEARCH AGENT SUBSYSTEM (resag_)
-- ============================================================================
-- AI research agent: researches and sources
-- Standalone system with no dependencies on other domains

-- ============================================================================
-- RESEARCHES: Top-level research questions
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.resag_researches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  input text NOT NULL,
  summary text,  -- Final synthesized research summary (markdown)
  status text NOT NULL DEFAULT 'researching' CHECK (status IN ('pending', 'researching', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resag_researches_status ON public.resag_researches(status);

CREATE TRIGGER set_updated_at_resag_researches
  BEFORE UPDATE ON public.resag_researches
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- SOURCES: Sources discovered and evaluated during research
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.resag_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  research_id uuid NOT NULL REFERENCES public.resag_researches(id) ON DELETE CASCADE,
  url text,
  title text,
  researcher_id text,
  raw_content text,
  source_summary text,  -- LLM-generated summary of the source content
  source_type text CHECK (source_type IN ('wikipedia', 'web', 'pdf', 'other')),
  content_quality text CHECK (content_quality IN ('good', 'partial', 'failed')),
  fetch_status text NOT NULL DEFAULT 'pending' CHECK (fetch_status IN ('pending', 'fetching', 'completed', 'failed', 'skipped')),
  fetched_at timestamptz,
  relevance_score float CHECK (relevance_score >= 0.0 AND relevance_score <= 1.0),
  reliability_score float CHECK (reliability_score >= 0.0 AND reliability_score <= 1.0),
  evaluation_notes text,

  -- Promotion to sou_documents (when source is high quality)
  promoted_document_id uuid REFERENCES public.sou_documents(id) ON DELETE SET NULL,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resag_sources_research_id ON public.resag_sources(research_id);
CREATE INDEX IF NOT EXISTS idx_resag_sources_fetch_status ON public.resag_sources(fetch_status);
CREATE INDEX IF NOT EXISTS idx_resag_sources_url ON public.resag_sources(url);

CREATE TRIGGER set_updated_at_resag_sources
  BEFORE UPDATE ON public.resag_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
