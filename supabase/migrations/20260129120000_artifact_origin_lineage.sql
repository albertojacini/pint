-- Add artifact_origin and derivation_notes, remove data_quality
-- This migration updates the artifact lineage model:
-- - artifact_origin: 'extracted' (from sources) vs 'curated' (designed for our needs)
-- - derivation_notes: methodology documentation
-- - data_quality is removed (now inferrable from origin + state)

-- Add artifact_origin column
ALTER TABLE kno_artifacts
ADD COLUMN artifact_origin TEXT NOT NULL DEFAULT 'extracted'
CHECK (artifact_origin IN ('extracted', 'curated'));

-- Add derivation_notes column
ALTER TABLE kno_artifacts
ADD COLUMN derivation_notes TEXT;

-- Remove data_quality column (inferrable from origin + state)
ALTER TABLE kno_artifacts
DROP COLUMN IF EXISTS data_quality;
