-- ============================================================================
-- POLICY SUBSYSTEM (pol_)
-- ============================================================================
-- Abstract policy framework: ideas, goals, measurables, effects, contributions
-- This domain is entity-independent - it models policy concepts universally
-- Dependencies: tax_ (categories)

-- High-level goals that policies aim to achieve
CREATE TABLE IF NOT EXISTS public.pol_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  maslow_level text, -- Link to Maslow hierarchy if applicable
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_updated_at_pol_goals
  BEFORE UPDATE ON public.pol_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Universal quantifiable metrics (entity-independent)
CREATE TABLE IF NOT EXISTS public.pol_measurables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  unit text NOT NULL, -- 'percentage', 'count', 'kg', 'EUR', etc.
  data_source text,
  measurement_frequency text, -- 'daily', 'monthly', 'yearly', 'one-time'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_updated_at_pol_measurables
  BEFORE UPDATE ON public.pol_measurables
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Abstract policy ideas (entity-independent)
CREATE TABLE IF NOT EXISTS public.pol_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category_id uuid REFERENCES public.tax_categories(id) ON DELETE SET NULL,
  effects_diagram jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pol_ideas_category_id ON public.pol_ideas(category_id);

CREATE TRIGGER set_updated_at_pol_ideas
  BEFORE UPDATE ON public.pol_ideas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Effects: idea -> measurable relationships
CREATE TABLE IF NOT EXISTS public.pol_effects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid NOT NULL REFERENCES public.pol_ideas(id) ON DELETE CASCADE,
  measurable_id uuid NOT NULL REFERENCES public.pol_measurables(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  mechanism text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pol_effects_idea_id ON public.pol_effects(idea_id);
CREATE INDEX IF NOT EXISTS idx_pol_effects_measurable_id ON public.pol_effects(measurable_id);

CREATE TRIGGER set_updated_at_pol_effects
  BEFORE UPDATE ON public.pol_effects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Contributions: measurable -> goal relationships
CREATE TABLE IF NOT EXISTS public.pol_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  measurable_id uuid NOT NULL REFERENCES public.pol_measurables(id) ON DELETE CASCADE,
  goal_id uuid NOT NULL REFERENCES public.pol_goals(id) ON DELETE CASCADE,
  contribution_type text NOT NULL CHECK (contribution_type IN ('direct', 'indirect', 'supporting')),
  weight numeric CHECK (weight >= 0 AND weight <= 1), -- Importance weight 0-1
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(measurable_id, goal_id)
);

CREATE INDEX IF NOT EXISTS idx_pol_contributions_measurable_id ON public.pol_contributions(measurable_id);
CREATE INDEX IF NOT EXISTS idx_pol_contributions_goal_id ON public.pol_contributions(goal_id);

CREATE TRIGGER set_updated_at_pol_contributions
  BEFORE UPDATE ON public.pol_contributions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Stakeholder groups: universal stakeholders affected by policies
CREATE TABLE IF NOT EXISTS public.pol_stakeholders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  title text NOT NULL,
  category text,
  description text,
  icon text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pol_stakeholders_category ON public.pol_stakeholders(category);

CREATE TRIGGER set_updated_at_pol_stakeholders
  BEFORE UPDATE ON public.pol_stakeholders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- ADD FOREIGN KEY: gov_provisions.idea_id -> pol_ideas.id
-- ============================================================================
ALTER TABLE public.gov_provisions
  ADD CONSTRAINT fk_gov_provisions_idea_id
  FOREIGN KEY (idea_id) REFERENCES public.pol_ideas(id) ON DELETE SET NULL;
