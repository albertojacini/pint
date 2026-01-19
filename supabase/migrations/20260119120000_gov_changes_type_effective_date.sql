-- Add type, effective_date, and relevance columns to gov_changes
-- type: distinguishes between actual (already happened) and planned (future) changes
-- effective_date: when the change takes/took effect (distinct from created_at)
-- relevance: 1-10 scale indicating how significant the change is

ALTER TABLE public.gov_changes
ADD COLUMN type text NOT NULL DEFAULT 'actual' CHECK (type IN ('actual', 'planned'));

ALTER TABLE public.gov_changes
ADD COLUMN effective_date timestamptz;

ALTER TABLE public.gov_changes
ADD COLUMN relevance integer CHECK (relevance >= 1 AND relevance <= 10);
