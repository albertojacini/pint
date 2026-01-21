-- Add evaluation_summary JSONB column to gov_provisions
-- This column stores widget-based evaluation data for the provision header console

ALTER TABLE gov_provisions
ADD COLUMN evaluation_summary JSONB;

COMMENT ON COLUMN gov_provisions.evaluation_summary IS 'Widget-based evaluation summary for provision header. Contains: effectiveness, impact, financial, sentiment, activity, dataConfidence, stakeholders widgets.';
