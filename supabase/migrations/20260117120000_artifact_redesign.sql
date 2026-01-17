-- ============================================================================
-- ARTIFACT REDESIGN
-- ============================================================================
-- Artifacts are now "structured facts" that pass the "printability test":
-- Would this data make a meaningful table or diagram in a report?
--
-- Changes:
-- 1. New types: evolution, distribution, table, parameters, narrative
--    - Removed: metric (too granular), dataset (too generic), time_series/breakdown (renamed)
-- 2. Added state tracking for completeness
-- 3. Added state_notes for explaining gaps

-- Update artifact_type constraint with new types
ALTER TABLE public.kno_artifacts
  DROP CONSTRAINT IF EXISTS kno_artifacts_artifact_type_check;

ALTER TABLE public.kno_artifacts
  ADD CONSTRAINT kno_artifacts_artifact_type_check
  CHECK (artifact_type IN (
    'evolution',      -- How something changed over time (CSV with date column) → line/area chart
    'distribution',   -- How something is divided across categories (CSV) → bar/pie chart
    'table',          -- Multi-dimensional structured data (CSV) → data table
    'parameters',     -- Configuration/rules/thresholds (YAML) → structured table
    'narrative'       -- Qualitative summary of facts (Markdown) → text block
  ));

-- Migrate existing data to new types
UPDATE public.kno_artifacts SET artifact_type = 'evolution' WHERE artifact_type = 'time_series';
UPDATE public.kno_artifacts SET artifact_type = 'distribution' WHERE artifact_type = 'breakdown';
UPDATE public.kno_artifacts SET artifact_type = 'table' WHERE artifact_type IN ('dataset', 'metric');

-- Add state tracking
ALTER TABLE public.kno_artifacts
  ADD COLUMN IF NOT EXISTS state text NOT NULL DEFAULT 'draft'
  CHECK (state IN (
    'draft',      -- Extracted but needs validation
    'partial',    -- Has meaningful content but known gaps
    'complete',   -- Fully populated with available data
    'stale'       -- May be outdated, needs refresh
  ));

ALTER TABLE public.kno_artifacts
  ADD COLUMN IF NOT EXISTS state_notes text;

-- Index for state queries
CREATE INDEX IF NOT EXISTS idx_kno_artifacts_state ON public.kno_artifacts(state);
