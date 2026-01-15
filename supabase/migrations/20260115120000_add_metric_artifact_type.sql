-- Add 'metric' artifact type for atomic single-value facts
-- Example: {"label": "Annual Revenue", "value": 142000000, "unit": "EUR", "year": 2023}

-- Drop the old constraint and add a new one with 'metric' included
ALTER TABLE public.kno_artifacts
  DROP CONSTRAINT IF EXISTS kno_artifacts_artifact_type_check;

ALTER TABLE public.kno_artifacts
  ADD CONSTRAINT kno_artifacts_artifact_type_check
  CHECK (artifact_type IN (
    'time_series',   -- Historical data with temporal dimension (CSV)
    'breakdown',     -- Categorical distribution (CSV)
    'parameters',    -- Key-value configuration (YAML)
    'narrative',     -- Prose explanation/summary
    'dataset',       -- Generic tabular data (CSV)
    'metric'         -- Single quantifiable fact (JSON)
  ));
