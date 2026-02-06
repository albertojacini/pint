-- ============================================================================
-- REFACTOR: Move events from ingestion (ing_) to first-class events app (eve_)
-- ============================================================================
-- Events are a core domain concept, not an ingestion artifact.
-- Also removes ing_sources, ing_event_documents, and all ingpl_* tables.

-- Drop ingestion pipeline tables (in FK order)
DROP TABLE IF EXISTS ingpl_change_candidates;
DROP TABLE IF EXISTS ingpl_candidate_documents;
DROP TABLE IF EXISTS ingpl_event_candidates;

-- Drop ingestion tables
DROP TABLE IF EXISTS ing_event_documents;
DROP TABLE IF EXISTS ing_sources;

-- Drop FK from gov_changes before dropping ing_events
ALTER TABLE gov_changes DROP CONSTRAINT IF EXISTS fk_gov_changes_event_id;
ALTER TABLE gov_changes DROP CONSTRAINT IF EXISTS changes_event_id_fkey;

-- Null out orphaned event references
UPDATE gov_changes SET event_id = NULL WHERE event_id IS NOT NULL;

DROP TABLE IF EXISTS ing_events;

-- Create new eve_events table
CREATE TABLE eve_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description_short text,
  description text,
  type text NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_eve_events_type ON eve_events(type);
CREATE INDEX idx_eve_events_date ON eve_events(date);

CREATE TRIGGER set_updated_at_eve_events
  BEFORE UPDATE ON eve_events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Re-add FK from gov_changes to eve_events
ALTER TABLE gov_changes
  ADD CONSTRAINT gov_changes_event_id_eve_events_id_fk
  FOREIGN KEY (event_id) REFERENCES eve_events(id) ON DELETE CASCADE;
