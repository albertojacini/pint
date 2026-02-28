CREATE TABLE "acc_access_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "acc_access_requests_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "gov_administrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_id" uuid NOT NULL,
	"name" text NOT NULL,
	"term_start" timestamp with time zone NOT NULL,
	"term_end" timestamp with time zone,
	"status" text NOT NULL,
	"description" text,
	"council_composition" jsonb,
	"election_data" jsonb,
	"extra_metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kno_artifact_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"artifact_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kno_artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"artifact_origin" text DEFAULT 'extracted' NOT NULL,
	"artifact_type" text NOT NULL,
	"content" text,
	"state" text DEFAULT 'draft' NOT NULL,
	"state_notes" text,
	"derivation_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tax_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"only_entities_with_types" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gov_changes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid,
	"target_type" text NOT NULL,
	"target_id" uuid NOT NULL,
	"type" text DEFAULT 'actual' NOT NULL,
	"date" timestamp with time zone,
	"relevance" integer,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pol_contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"measurable_id" uuid NOT NULL,
	"goal_id" uuid NOT NULL,
	"contribution_type" text NOT NULL,
	"weight" numeric,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disc_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"parent_id" uuid,
	"author_id" uuid NOT NULL,
	"body" text NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"depth" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disc_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_type" text NOT NULL,
	"target_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"post_type" text NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disc_proposal_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"position" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disc_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"target_type" text NOT NULL,
	"target_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sou_document_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"chunk_index" integer NOT NULL,
	"content" text NOT NULL,
	"content_tokens" integer,
	"embedding" vector(1536),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sou_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"publisher_id" uuid,
	"url" text,
	"title" text,
	"document_type" text NOT NULL,
	"document_category" text,
	"administrative_level" text,
	"fiscal_year" integer,
	"classification_method" text,
	"language" text,
	"published_at" timestamp with time zone,
	"raw_content" text,
	"content_hash" text,
	"file_path" text,
	"fetch_status" text DEFAULT 'pending' NOT NULL,
	"fetch_error" text,
	"fetched_at" timestamp with time zone,
	"processing_status" text DEFAULT 'unprocessed' NOT NULL,
	"embedding_status" text DEFAULT 'pending' NOT NULL,
	"chunk_count" integer DEFAULT 0,
	"summary" text,
	"extracted_data" jsonb DEFAULT '{}'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "propl_draft_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"draft_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"relevance" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pol_effects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idea_id" uuid NOT NULL,
	"measurable_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"mechanism" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gov_entities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"native_name" text,
	"language" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"avatar_url" text,
	"type" text NOT NULL,
	"population" integer,
	"score_innovation" integer,
	"score_sustainability" integer,
	"score_impact" integer,
	"essential_stats" jsonb,
	"performance_indicators" jsonb,
	"community_metrics" jsonb,
	"financial_overview" jsonb,
	"section_insights" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gov_entity_relations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_id" uuid NOT NULL,
	"related_entity_id" uuid NOT NULL,
	"relationship_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eve_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description_short" text,
	"description" text,
	"type" text NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gamvot_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_id" uuid NOT NULL,
	"text" text NOT NULL,
	"dimension" text NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gamvot_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_id" uuid NOT NULL,
	"user_id" uuid,
	"anonymous_id" text,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "user_or_anon" CHECK ("gamvot_sessions"."user_id" IS NOT NULL OR "gamvot_sessions"."anonymous_id" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "gamvot_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "amount_range" CHECK ("gamvot_votes"."amount" >= 5 AND "gamvot_votes"."amount" <= 100)
);
--> statement-breakpoint
CREATE TABLE "pol_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"maslow_level" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pol_ideas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category_id" uuid,
	"effects_diagram" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pol_measurables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"unit" text NOT NULL,
	"data_source" text,
	"measurement_frequency" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gov_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"administration_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"role_type" text NOT NULL,
	"role_title" text,
	"icon" text,
	"party" text,
	"appointed_at" timestamp with time zone NOT NULL,
	"left_at" timestamp with time zone,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gov_people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "acc_profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "acc_profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "gov_provision_artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provision_id" uuid NOT NULL,
	"artifact_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "propl_provision_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_id" uuid NOT NULL,
	"created_by" uuid,
	"input_description" text NOT NULL,
	"research_prompt" text,
	"research_id" uuid,
	"research_summary" text,
	"job_status" text DEFAULT 'input' NOT NULL,
	"error_message" text,
	"title" text,
	"tagline" text,
	"description" text,
	"analysis" text,
	"provision_type_codes" text[],
	"highlights" jsonb DEFAULT '{"items":[]}'::jsonb NOT NULL,
	"changelog" jsonb DEFAULT '{"items":[]}'::jsonb NOT NULL,
	"confidence" numeric,
	"source_urls" text[],
	"relevance" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gov_provision_type_assocs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provision_id" uuid NOT NULL,
	"type_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gov_provision_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"icon" text,
	"color" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gov_provision_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "gov_provisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_id" uuid NOT NULL,
	"parent_id" uuid,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"tagline" text,
	"description" text,
	"avatar_url" text,
	"status" text DEFAULT 'active' NOT NULL,
	"relevance" integer,
	"idea_id" uuid,
	"analysis" text,
	"highlights" jsonb DEFAULT '{"items":[]}'::jsonb NOT NULL,
	"changelog" jsonb DEFAULT '{"items":[]}'::jsonb NOT NULL,
	"console" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sou_publishers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"url" text,
	"feed_url" text,
	"publisher_type" text NOT NULL,
	"language" text,
	"reliability_score" numeric,
	"reliability_tier" text DEFAULT 'unverified' NOT NULL,
	"update_frequency" text,
	"access_method" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"coverage" jsonb DEFAULT '{}'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resag_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"research_id" uuid NOT NULL,
	"url" text,
	"title" text,
	"researcher_id" text,
	"raw_content" text,
	"source_summary" text,
	"source_type" text,
	"content_quality" text,
	"fetch_status" text DEFAULT 'pending' NOT NULL,
	"fetched_at" timestamp with time zone,
	"relevance_score" double precision,
	"reliability_score" double precision,
	"evaluation_notes" text,
	"promoted_document_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resag_researches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"input" text NOT NULL,
	"summary" text,
	"status" text DEFAULT 'researching' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pol_stakeholders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"category" text,
	"description" text,
	"icon" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pol_stakeholders_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "tax_taggables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag_id" uuid NOT NULL,
	"taggable_type" text NOT NULL,
	"taggable_id" uuid NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tax_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"category" text,
	"color" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"usage_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tax_tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "gov_administrations" ADD CONSTRAINT "gov_administrations_entity_id_gov_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."gov_entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kno_artifact_sources" ADD CONSTRAINT "kno_artifact_sources_artifact_id_kno_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."kno_artifacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kno_artifact_sources" ADD CONSTRAINT "kno_artifact_sources_document_id_sou_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."sou_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_categories" ADD CONSTRAINT "tax_categories_parent_id_tax_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tax_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_changes" ADD CONSTRAINT "gov_changes_event_id_eve_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."eve_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pol_contributions" ADD CONSTRAINT "pol_contributions_measurable_id_pol_measurables_id_fk" FOREIGN KEY ("measurable_id") REFERENCES "public"."pol_measurables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pol_contributions" ADD CONSTRAINT "pol_contributions_goal_id_pol_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."pol_goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disc_comments" ADD CONSTRAINT "disc_comments_post_id_disc_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."disc_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disc_comments" ADD CONSTRAINT "disc_comments_parent_id_disc_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."disc_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disc_comments" ADD CONSTRAINT "disc_comments_author_id_acc_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."acc_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disc_posts" ADD CONSTRAINT "disc_posts_author_id_acc_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."acc_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disc_proposal_votes" ADD CONSTRAINT "disc_proposal_votes_post_id_disc_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."disc_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disc_proposal_votes" ADD CONSTRAINT "disc_proposal_votes_user_id_acc_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."acc_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disc_votes" ADD CONSTRAINT "disc_votes_user_id_acc_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."acc_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sou_document_chunks" ADD CONSTRAINT "sou_document_chunks_document_id_sou_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."sou_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sou_documents" ADD CONSTRAINT "sou_documents_publisher_id_sou_publishers_id_fk" FOREIGN KEY ("publisher_id") REFERENCES "public"."sou_publishers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "propl_draft_documents" ADD CONSTRAINT "propl_draft_documents_draft_id_propl_provision_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."propl_provision_drafts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "propl_draft_documents" ADD CONSTRAINT "propl_draft_documents_document_id_sou_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."sou_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pol_effects" ADD CONSTRAINT "pol_effects_idea_id_pol_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."pol_ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pol_effects" ADD CONSTRAINT "pol_effects_measurable_id_pol_measurables_id_fk" FOREIGN KEY ("measurable_id") REFERENCES "public"."pol_measurables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_entity_relations" ADD CONSTRAINT "gov_entity_relations_entity_id_gov_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."gov_entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_entity_relations" ADD CONSTRAINT "gov_entity_relations_related_entity_id_gov_entities_id_fk" FOREIGN KEY ("related_entity_id") REFERENCES "public"."gov_entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamvot_items" ADD CONSTRAINT "gamvot_items_entity_id_gov_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."gov_entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamvot_items" ADD CONSTRAINT "gamvot_items_created_by_acc_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."acc_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamvot_sessions" ADD CONSTRAINT "gamvot_sessions_entity_id_gov_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."gov_entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamvot_sessions" ADD CONSTRAINT "gamvot_sessions_user_id_acc_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."acc_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamvot_votes" ADD CONSTRAINT "gamvot_votes_session_id_gamvot_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."gamvot_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamvot_votes" ADD CONSTRAINT "gamvot_votes_item_id_gamvot_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."gamvot_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pol_ideas" ADD CONSTRAINT "pol_ideas_category_id_tax_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."tax_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_members" ADD CONSTRAINT "gov_members_administration_id_gov_administrations_id_fk" FOREIGN KEY ("administration_id") REFERENCES "public"."gov_administrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_members" ADD CONSTRAINT "gov_members_person_id_gov_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."gov_people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_provision_artifacts" ADD CONSTRAINT "gov_provision_artifacts_provision_id_gov_provisions_id_fk" FOREIGN KEY ("provision_id") REFERENCES "public"."gov_provisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_provision_artifacts" ADD CONSTRAINT "gov_provision_artifacts_artifact_id_kno_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."kno_artifacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "propl_provision_drafts" ADD CONSTRAINT "propl_provision_drafts_entity_id_gov_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."gov_entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_provision_type_assocs" ADD CONSTRAINT "gov_provision_type_assocs_provision_id_gov_provisions_id_fk" FOREIGN KEY ("provision_id") REFERENCES "public"."gov_provisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_provision_type_assocs" ADD CONSTRAINT "gov_provision_type_assocs_type_id_gov_provision_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."gov_provision_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_provisions" ADD CONSTRAINT "gov_provisions_entity_id_gov_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."gov_entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_provisions" ADD CONSTRAINT "gov_provisions_parent_id_gov_provisions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."gov_provisions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_provisions" ADD CONSTRAINT "gov_provisions_idea_id_pol_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."pol_ideas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resag_sources" ADD CONSTRAINT "resag_sources_research_id_resag_researches_id_fk" FOREIGN KEY ("research_id") REFERENCES "public"."resag_researches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resag_sources" ADD CONSTRAINT "resag_sources_promoted_document_id_sou_documents_id_fk" FOREIGN KEY ("promoted_document_id") REFERENCES "public"."sou_documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_taggables" ADD CONSTRAINT "tax_taggables_tag_id_tax_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tax_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_taggables" ADD CONSTRAINT "tax_taggables_created_by_acc_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."acc_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "kno_artifact_sources_unique" ON "kno_artifact_sources" USING btree ("artifact_id","document_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pol_contributions_unique" ON "pol_contributions" USING btree ("measurable_id","goal_id");--> statement-breakpoint
CREATE INDEX "disc_comments_post_idx" ON "disc_comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "disc_posts_target_idx" ON "disc_posts" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE UNIQUE INDEX "disc_proposal_votes_unique" ON "disc_proposal_votes" USING btree ("user_id","post_id");--> statement-breakpoint
CREATE UNIQUE INDEX "disc_votes_unique" ON "disc_votes" USING btree ("user_id","target_type","target_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sou_document_chunks_unique" ON "sou_document_chunks" USING btree ("document_id","chunk_index");--> statement-breakpoint
CREATE INDEX "idx_sou_documents_publisher" ON "sou_documents" USING btree ("publisher_id");--> statement-breakpoint
CREATE INDEX "idx_sou_documents_type" ON "sou_documents" USING btree ("document_type");--> statement-breakpoint
CREATE INDEX "idx_sou_documents_fetch_status" ON "sou_documents" USING btree ("fetch_status");--> statement-breakpoint
CREATE INDEX "idx_sou_documents_processing_status" ON "sou_documents" USING btree ("processing_status");--> statement-breakpoint
CREATE INDEX "idx_sou_documents_published_at" ON "sou_documents" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "idx_sou_documents_url" ON "sou_documents" USING btree ("url");--> statement-breakpoint
CREATE INDEX "idx_sou_documents_content_hash" ON "sou_documents" USING btree ("content_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "propl_draft_documents_unique" ON "propl_draft_documents" USING btree ("draft_id","document_id");--> statement-breakpoint
CREATE UNIQUE INDEX "gov_entity_relations_unique" ON "gov_entity_relations" USING btree ("entity_id","related_entity_id","relationship_type");--> statement-breakpoint
CREATE INDEX "gamvot_items_entity_dimension" ON "gamvot_items" USING btree ("entity_id","dimension");--> statement-breakpoint
CREATE UNIQUE INDEX "gamvot_items_unique" ON "gamvot_items" USING btree ("entity_id","dimension","text");--> statement-breakpoint
CREATE INDEX "gamvot_sessions_entity" ON "gamvot_sessions" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "gamvot_sessions_status" ON "gamvot_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "gamvot_votes_item" ON "gamvot_votes" USING btree ("item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "gamvot_votes_unique" ON "gamvot_votes" USING btree ("session_id","item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "gov_provision_artifacts_unique" ON "gov_provision_artifacts" USING btree ("provision_id","artifact_id");--> statement-breakpoint
CREATE UNIQUE INDEX "gov_provision_type_assocs_unique" ON "gov_provision_type_assocs" USING btree ("provision_id","type_id");--> statement-breakpoint
CREATE INDEX "idx_sou_publishers_type" ON "sou_publishers" USING btree ("publisher_type");--> statement-breakpoint
CREATE INDEX "idx_sou_publishers_active" ON "sou_publishers" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_sou_publishers_reliability" ON "sou_publishers" USING btree ("reliability_score");--> statement-breakpoint
CREATE INDEX "idx_resag_sources_research_id" ON "resag_sources" USING btree ("research_id");--> statement-breakpoint
CREATE INDEX "idx_resag_sources_fetch_status" ON "resag_sources" USING btree ("fetch_status");--> statement-breakpoint
CREATE INDEX "idx_resag_sources_url" ON "resag_sources" USING btree ("url");--> statement-breakpoint
CREATE INDEX "idx_resag_researches_status" ON "resag_researches" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "tax_taggables_unique" ON "tax_taggables" USING btree ("tag_id","taggable_type","taggable_id");