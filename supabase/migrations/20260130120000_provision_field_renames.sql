-- Rename provision fields to more semantic names
-- description_short -> tagline
-- summary_md -> analysis
-- display_data -> highlights
-- display_changes -> changelog
-- evaluation_summary -> console

-- gov_provisions table
ALTER TABLE gov_provisions RENAME COLUMN description_short TO tagline;
ALTER TABLE gov_provisions RENAME COLUMN summary_md TO analysis;
ALTER TABLE gov_provisions RENAME COLUMN display_data TO highlights;
ALTER TABLE gov_provisions RENAME COLUMN display_changes TO changelog;
ALTER TABLE gov_provisions RENAME COLUMN evaluation_summary TO console;

-- propl_provision_drafts table (same fields except evaluation_summary)
ALTER TABLE propl_provision_drafts RENAME COLUMN description_short TO tagline;
ALTER TABLE propl_provision_drafts RENAME COLUMN summary_md TO analysis;
ALTER TABLE propl_provision_drafts RENAME COLUMN display_data TO highlights;
ALTER TABLE propl_provision_drafts RENAME COLUMN display_changes TO changelog;
