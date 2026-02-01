-- Add hierarchical structure to provisions
-- Implements a 3-tier hierarchy for filtering and organization:
--   Level 1: Policy domains (e.g., "Rete dei trasporti")
--   Level 2: Sub-domains (e.g., "Rete metropolitana")
--   Level 3: Specific instruments (e.g., "Linea M4")

ALTER TABLE gov_provisions
ADD COLUMN parent_id uuid REFERENCES gov_provisions(id) ON DELETE SET NULL,
ADD COLUMN level integer NOT NULL DEFAULT 3;

-- Add index for efficient hierarchy queries
CREATE INDEX idx_gov_provisions_parent_id ON gov_provisions(parent_id);
CREATE INDEX idx_gov_provisions_level ON gov_provisions(level);

-- Add check constraint to enforce 3-tier maximum
ALTER TABLE gov_provisions
ADD CONSTRAINT gov_provisions_level_check CHECK (level >= 1 AND level <= 3);
