-- Remove effective_from and effective_until columns from gov_provisions
ALTER TABLE gov_provisions DROP COLUMN IF EXISTS effective_from;
ALTER TABLE gov_provisions DROP COLUMN IF EXISTS effective_until;
