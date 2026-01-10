-- ============================================================================
-- GOVERNMENT SUBSYSTEM (gov_)
-- ============================================================================
-- Political entities, their governance structure, provisions, and changes
-- This is the core domain representing "what exists" in the political landscape
-- Dependencies: acc_ (for change tracking)

-- ============================================================================
-- TERRITORY: Political entities and their relationships
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.gov_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  native_name text,
  language text NOT NULL, -- BCP 47 language tag (e.g., 'it-IT', 'en-US')
  slug text NOT NULL,
  description text,
  avatar_url text,
  type text NOT NULL CHECK (type IN ('neighborhood', 'district', 'borough', 'city', 'region', 'country', 'supranational')),
  population integer,
  score_innovation integer CHECK (score_innovation >= 0 AND score_innovation <= 10),
  score_sustainability integer CHECK (score_sustainability >= 0 AND score_sustainability <= 10),
  score_impact integer CHECK (score_impact >= 0 AND score_impact <= 10),
  essential_stats jsonb,
  performance_indicators jsonb,
  community_metrics jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gov_entities_type ON public.gov_entities(type);

CREATE TRIGGER set_updated_at_gov_entities
  BEFORE UPDATE ON public.gov_entities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Entity relationships (hierarchical: city -> region -> country)
CREATE TABLE IF NOT EXISTS public.gov_entity_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES public.gov_entities(id) ON DELETE CASCADE,
  related_entity_id uuid NOT NULL REFERENCES public.gov_entities(id) ON DELETE CASCADE,
  relationship_type text NOT NULL, -- e.g., 'parent city', 'parent region', 'parent country'
  created_at timestamptz DEFAULT now(),
  UNIQUE(entity_id, related_entity_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_gov_entity_relations_entity_id ON public.gov_entity_relations(entity_id);
CREATE INDEX IF NOT EXISTS idx_gov_entity_relations_related_entity_id ON public.gov_entity_relations(related_entity_id);

-- ============================================================================
-- LEADERSHIP: People, administrations, and their roles
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.gov_people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_updated_at_gov_people
  BEFORE UPDATE ON public.gov_people
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Government terms/periods
CREATE TABLE IF NOT EXISTS public.gov_administrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES public.gov_entities(id) ON DELETE CASCADE,
  name text NOT NULL,
  term_start timestamptz NOT NULL,
  term_end timestamptz,
  status text NOT NULL CHECK (status IN ('active', 'historical', 'upcoming')),
  description text,
  council_composition jsonb,
  election_data jsonb,
  extra_metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gov_administrations_entity_id ON public.gov_administrations(entity_id);
CREATE INDEX IF NOT EXISTS idx_gov_administrations_status ON public.gov_administrations(status);

CREATE TRIGGER set_updated_at_gov_administrations
  BEFORE UPDATE ON public.gov_administrations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Many-to-many join table with roles
CREATE TABLE IF NOT EXISTS public.gov_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  administration_id uuid NOT NULL REFERENCES public.gov_administrations(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES public.gov_people(id) ON DELETE CASCADE,
  role_type text NOT NULL CHECK (role_type IN ('mayor', 'councilor', 'minister', 'president', 'governor', 'member')),
  role_title text,
  icon text,
  party text,
  appointed_at timestamptz NOT NULL,
  left_at timestamptz,
  status text NOT NULL CHECK (status IN ('active', 'historical')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gov_members_administration_id ON public.gov_members(administration_id);
CREATE INDEX IF NOT EXISTS idx_gov_members_person_id ON public.gov_members(person_id);
CREATE INDEX IF NOT EXISTS idx_gov_members_status ON public.gov_members(status);

CREATE TRIGGER set_updated_at_gov_members
  BEFORE UPDATE ON public.gov_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- PROVISIONS: Laws, regulations, infrastructure owned by entities
-- ============================================================================

-- Provision types reference table
CREATE TABLE IF NOT EXISTS public.gov_provision_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  icon text,
  color text,
  created_at timestamptz DEFAULT now()
);

-- Seed the 7 provision types
INSERT INTO public.gov_provision_types (code, label, description) VALUES
  ('ownership', 'Ownership', 'Stakes in companies, property'),
  ('contract', 'Contract', 'Service agreements, concessions, partnerships'),
  ('regulation', 'Regulation', 'Rules, ordinances, codes, standards'),
  ('taxation', 'Taxation', 'Taxes, fees, tariffs'),
  ('allocation', 'Allocation', 'Programs, subsidies, budgets, funds'),
  ('designation', 'Designation', 'Zones, landmarks, protected areas, institutions'),
  ('infrastructure', 'Infrastructure', 'Public works, utilities, transportation networks, digital systems');

-- Provisions: institutional/legal/operational infrastructure owned by entities
CREATE TABLE IF NOT EXISTS public.gov_provisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  avatar_url text,

  -- Relationships
  entity_id uuid NOT NULL REFERENCES public.gov_entities(id) ON DELETE CASCADE,
  idea_id uuid, -- References pol_ideas, added as FK after policy tables exist

  -- Master data / source of truth
  summary_md text CHECK (length(summary_md) <= 20000),

  -- UI fields - Extracted from summary_md
  description_short text CHECK (length(description_short) <= 100),
  description text CHECK (length(description) <= 1000),
  relevance integer CHECK (relevance >= 0 AND relevance <= 10),
  display_data jsonb NOT NULL DEFAULT '{"items":[]}',
  display_changes jsonb NOT NULL DEFAULT '{"items":[]}',

  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Status data - DEPRECATED
  status text NOT NULL DEFAULT 'active',
  effective_from date,
  effective_until date
);

CREATE INDEX IF NOT EXISTS idx_gov_provisions_entity_id ON public.gov_provisions(entity_id);
CREATE INDEX IF NOT EXISTS idx_gov_provisions_idea_id ON public.gov_provisions(idea_id);
CREATE INDEX IF NOT EXISTS idx_gov_provisions_status ON public.gov_provisions(status);

CREATE TRIGGER set_updated_at_gov_provisions
  BEFORE UPDATE ON public.gov_provisions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Provision type associations (many-to-many junction table)
CREATE TABLE IF NOT EXISTS public.gov_provision_type_assocs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provision_id uuid NOT NULL REFERENCES public.gov_provisions(id) ON DELETE CASCADE,
  type_id uuid NOT NULL REFERENCES public.gov_provision_types(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(provision_id, type_id)
);

CREATE INDEX IF NOT EXISTS idx_gov_provision_type_assocs_provision_id ON public.gov_provision_type_assocs(provision_id);
CREATE INDEX IF NOT EXISTS idx_gov_provision_type_assocs_type_id ON public.gov_provision_type_assocs(type_id);

-- ============================================================================
-- HISTORY: Changes to government entities
-- ============================================================================

-- Changes: polymorphic bridge between events and their targets (provisions, entities, administrations)
CREATE TABLE IF NOT EXISTS public.gov_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid, -- References ing_events, added as FK after ingestion tables exist
  target_type text NOT NULL CHECK (target_type IN ('provision', 'entity', 'administration')),
  target_id uuid NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gov_changes_event_id ON public.gov_changes(event_id);
CREATE INDEX IF NOT EXISTS idx_gov_changes_target ON public.gov_changes(target_type, target_id);
