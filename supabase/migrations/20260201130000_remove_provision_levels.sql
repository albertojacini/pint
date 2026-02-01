-- Remove level field from provisions
-- We're using tags and parent relationships instead of rigid hierarchy levels

-- Drop the check constraint
ALTER TABLE gov_provisions
DROP CONSTRAINT IF EXISTS gov_provisions_level_check;

-- Drop the index
DROP INDEX IF EXISTS idx_gov_provisions_level;

-- Drop the column
ALTER TABLE gov_provisions
DROP COLUMN IF EXISTS level;
