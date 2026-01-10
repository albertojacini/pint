-- ============================================================================
-- PINT SUBSYSTEM MIGRATION SCRIPT
-- ============================================================================
-- Run this script ONCE on production to rename tables to the new subsystem naming convention.
--
-- IMPORTANT:
-- - Back up your database before running this script
-- - Run during maintenance window (brief downtime expected)
-- - Deploy new application code immediately after running this script
--
-- Subsystem prefixes:
--   acc_    = accounts (user management)
--   gov_    = government (entities, administrations, provisions, changes)
--   tax_    = taxonomy (categories, tags)
--   pol_    = policy (ideas, goals, measurables, effects, contributions, stakeholders)
--   ing_    = ingestion (sources, events)
--   ingpl_  = ingestion pipeline (event candidates, change candidates)
--   propl_  = provision pipeline (provision drafts)
--   resag_  = research agent (researches, sources)
-- ============================================================================

BEGIN;

-- ============================================================================
-- PHASE 1: RENAME TABLES
-- ============================================================================
-- Order matters: rename tables with no dependencies first, then dependents

-- ACCOUNTS (acc_)
ALTER TABLE IF EXISTS user_profiles RENAME TO acc_profiles;

-- GOVERNMENT - Territory (gov_)
ALTER TABLE IF EXISTS political_entities RENAME TO gov_entities;
ALTER TABLE IF EXISTS entity_relationships RENAME TO gov_entity_relations;

-- GOVERNMENT - Leadership (gov_)
ALTER TABLE IF EXISTS people RENAME TO gov_people;
ALTER TABLE IF EXISTS administrations RENAME TO gov_administrations;
ALTER TABLE IF EXISTS administration_members RENAME TO gov_members;

-- GOVERNMENT - Provisions (gov_)
ALTER TABLE IF EXISTS provision_types RENAME TO gov_provision_types;
ALTER TABLE IF EXISTS provisions RENAME TO gov_provisions;
ALTER TABLE IF EXISTS provision_type_associations RENAME TO gov_provision_type_assocs;

-- GOVERNMENT - History (gov_)
ALTER TABLE IF EXISTS changes RENAME TO gov_changes;

-- TAXONOMY (tax_)
ALTER TABLE IF EXISTS categories RENAME TO tax_categories;
ALTER TABLE IF EXISTS tags RENAME TO tax_tags;
ALTER TABLE IF EXISTS taggables RENAME TO tax_taggables;

-- POLICY (pol_)
ALTER TABLE IF EXISTS goals RENAME TO pol_goals;
ALTER TABLE IF EXISTS measurables RENAME TO pol_measurables;
ALTER TABLE IF EXISTS ideas RENAME TO pol_ideas;
ALTER TABLE IF EXISTS effects RENAME TO pol_effects;
ALTER TABLE IF EXISTS contributions RENAME TO pol_contributions;
ALTER TABLE IF EXISTS stakeholder_groups RENAME TO pol_stakeholders;

-- INGESTION (ing_)
ALTER TABLE IF EXISTS ei_sources RENAME TO ing_sources;
ALTER TABLE IF EXISTS events RENAME TO ing_events;

-- INGESTION PIPELINE (ingpl_)
ALTER TABLE IF EXISTS ei_candidates RENAME TO ingpl_event_candidates;
ALTER TABLE IF EXISTS ei_candidate_sources RENAME TO ingpl_candidate_sources;
ALTER TABLE IF EXISTS ei_candidate_changes RENAME TO ingpl_change_candidates;

-- PROVISION PIPELINE (propl_)
ALTER TABLE IF EXISTS provision_drafts RENAME TO propl_provision_drafts;

-- RESEARCH AGENT (resag_)
ALTER TABLE IF EXISTS ra_researches RENAME TO resag_researches;
ALTER TABLE IF EXISTS ra_sources RENAME TO resag_sources;

-- ============================================================================
-- PHASE 2: RENAME INDEXES
-- ============================================================================

-- GOVERNMENT - Entities
ALTER INDEX IF EXISTS idx_political_entities_type RENAME TO idx_gov_entities_type;
ALTER INDEX IF EXISTS idx_entity_relationships_entity_id RENAME TO idx_gov_entity_relations_entity_id;
ALTER INDEX IF EXISTS idx_entity_relationships_related_entity_id RENAME TO idx_gov_entity_relations_related_entity_id;

-- GOVERNMENT - Leadership
ALTER INDEX IF EXISTS idx_administrations_entity_id RENAME TO idx_gov_administrations_entity_id;
ALTER INDEX IF EXISTS idx_administrations_status RENAME TO idx_gov_administrations_status;
ALTER INDEX IF EXISTS idx_administration_members_administration_id RENAME TO idx_gov_members_administration_id;
ALTER INDEX IF EXISTS idx_administration_members_person_id RENAME TO idx_gov_members_person_id;
ALTER INDEX IF EXISTS idx_administration_members_status RENAME TO idx_gov_members_status;

-- GOVERNMENT - Provisions
ALTER INDEX IF EXISTS idx_provisions_entity_id RENAME TO idx_gov_provisions_entity_id;
ALTER INDEX IF EXISTS idx_provisions_idea_id RENAME TO idx_gov_provisions_idea_id;
ALTER INDEX IF EXISTS idx_provisions_status RENAME TO idx_gov_provisions_status;
ALTER INDEX IF EXISTS idx_provision_type_associations_provision_id RENAME TO idx_gov_provision_type_assocs_provision_id;
ALTER INDEX IF EXISTS idx_provision_type_associations_type_id RENAME TO idx_gov_provision_type_assocs_type_id;

-- GOVERNMENT - Changes
ALTER INDEX IF EXISTS idx_changes_event_id RENAME TO idx_gov_changes_event_id;
ALTER INDEX IF EXISTS idx_changes_target RENAME TO idx_gov_changes_target;

-- TAXONOMY
ALTER INDEX IF EXISTS idx_categories_parent_id RENAME TO idx_tax_categories_parent_id;
ALTER INDEX IF EXISTS idx_tags_slug RENAME TO idx_tax_tags_slug;
ALTER INDEX IF EXISTS idx_tags_category RENAME TO idx_tax_tags_category;
ALTER INDEX IF EXISTS idx_tags_name_trgm RENAME TO idx_tax_tags_name_trgm;
ALTER INDEX IF EXISTS idx_taggables_tag_id RENAME TO idx_tax_taggables_tag_id;
ALTER INDEX IF EXISTS idx_taggables_taggable RENAME TO idx_tax_taggables_taggable;

-- POLICY
ALTER INDEX IF EXISTS idx_ideas_category_id RENAME TO idx_pol_ideas_category_id;
ALTER INDEX IF EXISTS idx_effects_idea_id RENAME TO idx_pol_effects_idea_id;
ALTER INDEX IF EXISTS idx_effects_measurable_id RENAME TO idx_pol_effects_measurable_id;
ALTER INDEX IF EXISTS idx_contributions_measurable_id RENAME TO idx_pol_contributions_measurable_id;
ALTER INDEX IF EXISTS idx_contributions_goal_id RENAME TO idx_pol_contributions_goal_id;
ALTER INDEX IF EXISTS idx_stakeholder_groups_category RENAME TO idx_pol_stakeholders_category;

-- INGESTION
ALTER INDEX IF EXISTS idx_ei_sources_fetch_status RENAME TO idx_ing_sources_fetch_status;
ALTER INDEX IF EXISTS idx_ei_sources_processing_status RENAME TO idx_ing_sources_processing_status;
ALTER INDEX IF EXISTS idx_ei_sources_source_type RENAME TO idx_ing_sources_source_type;
ALTER INDEX IF EXISTS idx_ei_sources_published_at RENAME TO idx_ing_sources_published_at;
ALTER INDEX IF EXISTS idx_ei_sources_url RENAME TO idx_ing_sources_url;
ALTER INDEX IF EXISTS idx_events_administration_id RENAME TO idx_ing_events_administration_id;
ALTER INDEX IF EXISTS idx_events_type RENAME TO idx_ing_events_type;

-- INGESTION PIPELINE
ALTER INDEX IF EXISTS idx_ei_candidates_status RENAME TO idx_ingpl_event_candidates_status;
ALTER INDEX IF EXISTS idx_ei_candidates_event_type RENAME TO idx_ingpl_event_candidates_event_type;
ALTER INDEX IF EXISTS idx_ei_candidates_detected_entity_id RENAME TO idx_ingpl_event_candidates_detected_entity_id;
ALTER INDEX IF EXISTS idx_ei_candidates_event_id RENAME TO idx_ingpl_event_candidates_event_id;
ALTER INDEX IF EXISTS idx_ei_candidate_sources_candidate_id RENAME TO idx_ingpl_candidate_sources_candidate_id;
ALTER INDEX IF EXISTS idx_ei_candidate_sources_source_id RENAME TO idx_ingpl_candidate_sources_source_id;
ALTER INDEX IF EXISTS idx_ei_candidate_changes_candidate_id RENAME TO idx_ingpl_change_candidates_candidate_id;
ALTER INDEX IF EXISTS idx_ei_candidate_changes_target RENAME TO idx_ingpl_change_candidates_target;
ALTER INDEX IF EXISTS idx_ei_candidate_changes_status RENAME TO idx_ingpl_change_candidates_status;

-- PROVISION PIPELINE
ALTER INDEX IF EXISTS idx_provision_drafts_entity_id RENAME TO idx_propl_provision_drafts_entity_id;
ALTER INDEX IF EXISTS idx_provision_drafts_job_status RENAME TO idx_propl_provision_drafts_job_status;
ALTER INDEX IF EXISTS idx_provision_drafts_created_by RENAME TO idx_propl_provision_drafts_created_by;

-- RESEARCH AGENT
ALTER INDEX IF EXISTS idx_ra_researches_status RENAME TO idx_resag_researches_status;
ALTER INDEX IF EXISTS idx_ra_sources_research_id RENAME TO idx_resag_sources_research_id;
ALTER INDEX IF EXISTS idx_ra_sources_fetch_status RENAME TO idx_resag_sources_fetch_status;
ALTER INDEX IF EXISTS idx_ra_sources_url RENAME TO idx_resag_sources_url;

-- ============================================================================
-- PHASE 3: RENAME TRIGGERS
-- ============================================================================

-- Note: Trigger functions remain the same (handle_updated_at), only trigger names change

-- ACCOUNTS
ALTER TRIGGER IF EXISTS set_updated_at ON acc_profiles RENAME TO set_updated_at_acc_profiles;

-- GOVERNMENT - Entities
ALTER TRIGGER IF EXISTS set_updated_at ON gov_entities RENAME TO set_updated_at_gov_entities;

-- GOVERNMENT - Leadership
ALTER TRIGGER IF EXISTS set_updated_at ON gov_people RENAME TO set_updated_at_gov_people;
ALTER TRIGGER IF EXISTS set_updated_at ON gov_administrations RENAME TO set_updated_at_gov_administrations;
ALTER TRIGGER IF EXISTS set_updated_at ON gov_members RENAME TO set_updated_at_gov_members;

-- GOVERNMENT - Provisions
ALTER TRIGGER IF EXISTS set_updated_at_provisions ON gov_provisions RENAME TO set_updated_at_gov_provisions;

-- GOVERNMENT - Changes (no trigger currently)

-- TAXONOMY
ALTER TRIGGER IF EXISTS set_updated_at ON tax_categories RENAME TO set_updated_at_tax_categories;
ALTER TRIGGER IF EXISTS set_updated_at_tags ON tax_tags RENAME TO set_updated_at_tax_tags;

-- POLICY
ALTER TRIGGER IF EXISTS set_updated_at ON pol_goals RENAME TO set_updated_at_pol_goals;
ALTER TRIGGER IF EXISTS set_updated_at ON pol_measurables RENAME TO set_updated_at_pol_measurables;
ALTER TRIGGER IF EXISTS set_updated_at ON pol_ideas RENAME TO set_updated_at_pol_ideas;
ALTER TRIGGER IF EXISTS set_updated_at ON pol_effects RENAME TO set_updated_at_pol_effects;
ALTER TRIGGER IF EXISTS set_updated_at ON pol_contributions RENAME TO set_updated_at_pol_contributions;
ALTER TRIGGER IF EXISTS set_updated_at ON pol_stakeholders RENAME TO set_updated_at_pol_stakeholders;

-- INGESTION
ALTER TRIGGER IF EXISTS set_updated_at_ei_sources ON ing_sources RENAME TO set_updated_at_ing_sources;
ALTER TRIGGER IF EXISTS set_updated_at_events ON ing_events RENAME TO set_updated_at_ing_events;

-- INGESTION PIPELINE
ALTER TRIGGER IF EXISTS set_updated_at_ei_candidates ON ingpl_event_candidates RENAME TO set_updated_at_ingpl_event_candidates;
ALTER TRIGGER IF EXISTS set_updated_at_ei_candidate_changes ON ingpl_change_candidates RENAME TO set_updated_at_ingpl_change_candidates;

-- PROVISION PIPELINE
ALTER TRIGGER IF EXISTS set_updated_at_provision_drafts ON propl_provision_drafts RENAME TO set_updated_at_propl_provision_drafts;

-- RESEARCH AGENT
ALTER TRIGGER IF EXISTS set_updated_at_ra_researches ON resag_researches RENAME TO set_updated_at_resag_researches;
ALTER TRIGGER IF EXISTS set_updated_at_ra_sources ON resag_sources RENAME TO set_updated_at_resag_sources;

-- ============================================================================
-- PHASE 4: UPDATE TAG USAGE TRIGGER FUNCTION
-- ============================================================================
-- The update_tag_usage_count function references the 'tags' table, update to 'tax_tags'

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

-- Rename the trigger on taggables
ALTER TRIGGER IF EXISTS update_tag_count_on_taggable_change ON tax_taggables
  RENAME TO update_tag_count_on_tax_taggable_change;

-- ============================================================================
-- PHASE 5: UPDATE handle_new_user FUNCTION
-- ============================================================================
-- The function references 'user_profiles', update to 'acc_profiles'

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.acc_profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICATION QUERIES (optional - run after migration)
-- ============================================================================

-- Uncomment to verify tables exist with new names:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;

-- Uncomment to verify indexes:
-- SELECT indexname FROM pg_indexes
-- WHERE schemaname = 'public'
-- ORDER BY indexname;

COMMIT;

-- ============================================================================
-- ROLLBACK SCRIPT (in case of issues)
-- ============================================================================
-- Save this separately as rollback_subsystems.sql if needed
/*
BEGIN;

-- Reverse table renames
ALTER TABLE IF EXISTS acc_profiles RENAME TO user_profiles;
ALTER TABLE IF EXISTS gov_entities RENAME TO political_entities;
ALTER TABLE IF EXISTS gov_entity_relations RENAME TO entity_relationships;
ALTER TABLE IF EXISTS gov_people RENAME TO people;
ALTER TABLE IF EXISTS gov_administrations RENAME TO administrations;
ALTER TABLE IF EXISTS gov_members RENAME TO administration_members;
ALTER TABLE IF EXISTS gov_provision_types RENAME TO provision_types;
ALTER TABLE IF EXISTS gov_provisions RENAME TO provisions;
ALTER TABLE IF EXISTS gov_provision_type_assocs RENAME TO provision_type_associations;
ALTER TABLE IF EXISTS gov_changes RENAME TO changes;
ALTER TABLE IF EXISTS tax_categories RENAME TO categories;
ALTER TABLE IF EXISTS tax_tags RENAME TO tags;
ALTER TABLE IF EXISTS tax_taggables RENAME TO taggables;
ALTER TABLE IF EXISTS pol_goals RENAME TO goals;
ALTER TABLE IF EXISTS pol_measurables RENAME TO measurables;
ALTER TABLE IF EXISTS pol_ideas RENAME TO ideas;
ALTER TABLE IF EXISTS pol_effects RENAME TO effects;
ALTER TABLE IF EXISTS pol_contributions RENAME TO contributions;
ALTER TABLE IF EXISTS pol_stakeholders RENAME TO stakeholder_groups;
ALTER TABLE IF EXISTS ing_sources RENAME TO ei_sources;
ALTER TABLE IF EXISTS ing_events RENAME TO events;
ALTER TABLE IF EXISTS ingpl_event_candidates RENAME TO ei_candidates;
ALTER TABLE IF EXISTS ingpl_candidate_sources RENAME TO ei_candidate_sources;
ALTER TABLE IF EXISTS ingpl_change_candidates RENAME TO ei_candidate_changes;
ALTER TABLE IF EXISTS propl_provision_drafts RENAME TO provision_drafts;
ALTER TABLE IF EXISTS resag_researches RENAME TO ra_researches;
ALTER TABLE IF EXISTS resag_sources RENAME TO ra_sources;

-- Restore functions
CREATE OR REPLACE FUNCTION update_tag_usage_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
*/
