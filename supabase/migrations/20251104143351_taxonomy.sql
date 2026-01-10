-- ============================================================================
-- TAXONOMY SUBSYSTEM (tax_)
-- ============================================================================
-- Categories, tags, and taxonomies for organizing content across all domains
-- Dependencies: acc_ (for created_by tracking)

-- Hierarchical policy categories (self-referential tree)
CREATE TABLE IF NOT EXISTS public.tax_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.tax_categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  only_entities_with_types text[], -- Constraint: only certain entity types can use this category
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tax_categories_parent_id ON public.tax_categories(parent_id);

CREATE TRIGGER set_updated_at_tax_categories
  BEFORE UPDATE ON public.tax_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Unified tags table for all content types
CREATE TABLE IF NOT EXISTS public.tax_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE, -- URL-friendly version
  description text,
  category text, -- 'policy-topic', 'geographic', 'impact-area', 'maturity'
  color text, -- hex color for UI display
  metadata jsonb DEFAULT '{}', -- Flexible field for tag-specific data
  usage_count integer DEFAULT 0, -- Track popularity
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tax_tags_slug ON public.tax_tags(slug);
CREATE INDEX IF NOT EXISTS idx_tax_tags_category ON public.tax_tags(category);
CREATE INDEX IF NOT EXISTS idx_tax_tags_name_trgm ON public.tax_tags USING gin(name gin_trgm_ops); -- For fuzzy search

CREATE TRIGGER set_updated_at_tax_tags
  BEFORE UPDATE ON public.tax_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Polymorphic tagging junction table
CREATE TABLE IF NOT EXISTS public.tax_taggables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id uuid NOT NULL REFERENCES public.tax_tags(id) ON DELETE CASCADE,
  taggable_type text NOT NULL, -- 'entity', 'provision', 'idea', 'event', 'administration'
  taggable_id uuid NOT NULL, -- ID of the tagged item
  created_by uuid REFERENCES public.acc_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tag_id, taggable_type, taggable_id)
);

CREATE INDEX IF NOT EXISTS idx_tax_taggables_tag_id ON public.tax_taggables(tag_id);
CREATE INDEX IF NOT EXISTS idx_tax_taggables_taggable ON public.tax_taggables(taggable_type, taggable_id);

-- Update usage_count trigger
CREATE OR REPLACE FUNCTION update_tag_usage_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tax_tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tax_tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tag_count_on_tax_taggable_change
  AFTER INSERT OR DELETE ON public.tax_taggables
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_usage_count();
