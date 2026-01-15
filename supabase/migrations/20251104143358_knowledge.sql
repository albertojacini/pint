-- ============================================================================
-- KNOWLEDGE SUBSYSTEM (kno_)
-- ============================================================================
-- Artifacts: processed/extracted knowledge from sources
-- This is the "silver layer" between raw sources and provisions
-- Dependencies: sou_documents (sources), gov_provisions (government)

-- ============================================================================
-- ARTIFACTS: Core knowledge objects extracted from sources
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.kno_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  title text NOT NULL,
  description text,

  -- Classification
  artifact_type text NOT NULL CHECK (artifact_type IN (
    'time_series',   -- Historical data with temporal dimension (CSV)
    'breakdown',     -- Categorical distribution (CSV)
    'parameters',    -- Key-value configuration (YAML)
    'narrative',     -- Prose explanation/summary
    'dataset'        -- Generic tabular data (CSV)
  )),

  -- Content (format depends on artifact_type)
  -- time_series, breakdown, dataset: CSV
  -- parameters: YAML
  -- narrative: prose text
  content text,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kno_artifacts_type ON public.kno_artifacts(artifact_type);

CREATE TRIGGER set_updated_at_kno_artifacts
  BEFORE UPDATE ON public.kno_artifacts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- ARTIFACT SOURCES: Links artifacts to source documents
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.kno_artifact_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id uuid NOT NULL REFERENCES public.kno_artifacts(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.sou_documents(id) ON DELETE CASCADE,

  -- Timestamps
  created_at timestamptz DEFAULT now(),

  UNIQUE(artifact_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_kno_artifact_sources_artifact ON public.kno_artifact_sources(artifact_id);
CREATE INDEX IF NOT EXISTS idx_kno_artifact_sources_document ON public.kno_artifact_sources(document_id);

-- ============================================================================
-- PROVISION ARTIFACTS: Links provisions to artifacts (gov_ prefix)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.gov_provision_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provision_id uuid NOT NULL REFERENCES public.gov_provisions(id) ON DELETE CASCADE,
  artifact_id uuid NOT NULL REFERENCES public.kno_artifacts(id) ON DELETE CASCADE,

  -- Timestamps
  created_at timestamptz DEFAULT now(),

  UNIQUE(provision_id, artifact_id)
);

CREATE INDEX IF NOT EXISTS idx_gov_provision_artifacts_provision ON public.gov_provision_artifacts(provision_id);
CREATE INDEX IF NOT EXISTS idx_gov_provision_artifacts_artifact ON public.gov_provision_artifacts(artifact_id);
