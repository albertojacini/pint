-- ============================================================================
-- ARTIFACT DATA QUALITY
-- ============================================================================
-- Tracks the reliability/source of artifact data:
-- - verified: Official/authoritative data from primary sources
-- - estimated: Calculated or derived from available information
-- - placeholder: Rough approximation, needs real data

ALTER TABLE public.kno_artifacts
  ADD COLUMN IF NOT EXISTS data_quality text NOT NULL DEFAULT 'verified'
  CHECK (data_quality IN ('verified', 'estimated', 'placeholder'));

CREATE INDEX IF NOT EXISTS idx_kno_artifacts_data_quality ON public.kno_artifacts(data_quality);
