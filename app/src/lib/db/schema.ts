import { pgTable, text, uuid, timestamp, integer, uniqueIndex, numeric } from 'drizzle-orm/pg-core'

// User profiles table
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Categories table (hierarchical policy categories)
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  parentId: uuid('parent_id').references(() => categories.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  orderIndex: integer('order_index').notNull().default(0),
  onlyEntitiesWithTypes: text('only_entities_with_types').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Political entities table
export const politicalEntities = pgTable('political_entities', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  nativeName: text('native_name'),
  description: text('description'),
  avatarUrl: text('avatar_url'),
  type: text('type', {
    enum: ['neighborhood', 'district', 'borough', 'city', 'region', 'country', 'supranational']
  }).notNull(),
  population: integer('population'),
  scoreInnovation: integer('score_innovation'),
  scoreSustainability: integer('score_sustainability'),
  scoreImpact: integer('score_impact'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Entity relationships table (for parent/child relationships)
export const entityRelationships = pgTable('entity_relationships', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityId: uuid('entity_id').notNull().references(() => politicalEntities.id, { onDelete: 'cascade' }),
  relatedEntityId: uuid('related_entity_id').notNull().references(() => politicalEntities.id, { onDelete: 'cascade' }),
  relationshipType: text('relationship_type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueRelationship: uniqueIndex('entity_relationships_unique').on(table.entityId, table.relatedEntityId, table.relationshipType),
}))

// Policy tags table (tag taxonomies)
export const policyTags = pgTable('policy_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// Tag values table (individual values within each taxonomy)
export const tagValues = pgTable('tag_values', {
  id: uuid('id').primaryKey().defaultRandom(),
  tagId: uuid('tag_id').notNull().references(() => policyTags.id, { onDelete: 'cascade' }),
  value: text('value').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueTagValue: uniqueIndex('tag_values_unique').on(table.tagId, table.value),
}))

// Goals table
export const goals = pgTable('goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  maslowLevel: text('maslow_level'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})


// Posts table (simple content for testing forms and UI)
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').notNull(),
  title: text('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// People table (politicians, officials, etc.)
export const people = pgTable('people', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: text('full_name').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Administrations table (government terms)
export const administrations = pgTable('administrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityId: uuid('entity_id').notNull().references(() => politicalEntities.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  termStart: timestamp('term_start', { withTimezone: true }).notNull(),
  termEnd: timestamp('term_end', { withTimezone: true }),
  status: text('status', { enum: ['active', 'historical', 'upcoming'] }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Administration members table (many-to-many with roles)
export const administrationMembers = pgTable('administration_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  administrationId: uuid('administration_id').notNull().references(() => administrations.id, { onDelete: 'cascade' }),
  personId: uuid('person_id').notNull().references(() => people.id, { onDelete: 'cascade' }),
  roleType: text('role_type', {
    enum: ['mayor', 'councilor', 'minister', 'president', 'governor', 'member']
  }).notNull(),
  roleTitle: text('role_title'),
  appointedAt: timestamp('appointed_at', { withTimezone: true }).notNull(),
  leftAt: timestamp('left_at', { withTimezone: true }),
  status: text('status', { enum: ['active', 'historical'] }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ============================================================================
// POLICY FRAMEWORK DOMAIN
// ============================================================================

// Abstract policy ideas (entity-independent)
export const ideas = pgTable('ideas', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Universal quantifiable metrics (entity-independent)
export const measurables = pgTable('measurables', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  unit: text('unit').notNull(),
  dataSource: text('data_source'),
  measurementFrequency: text('measurement_frequency'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Effects: idea → measurable relationships
export const effects = pgTable('effects', {
  id: uuid('id').primaryKey().defaultRandom(),
  ideaId: uuid('idea_id').notNull().references(() => ideas.id, { onDelete: 'cascade' }),
  measurableId: uuid('measurable_id').notNull().references(() => measurables.id, { onDelete: 'cascade' }),
  direction: text('direction', { enum: ['positive', 'negative', 'neutral'] }).notNull(),
  intensity: text('intensity', { enum: ['low', 'medium', 'high'] }),
  confidence: text('confidence', { enum: ['low', 'medium', 'high', 'proven'] }),
  evidenceDescription: text('evidence_description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueIdeaMeasurable: uniqueIndex('effects_unique').on(table.ideaId, table.measurableId),
}))

// Contributions: measurable → goal relationships
export const contributions = pgTable('contributions', {
  id: uuid('id').primaryKey().defaultRandom(),
  measurableId: uuid('measurable_id').notNull().references(() => measurables.id, { onDelete: 'cascade' }),
  goalId: uuid('goal_id').notNull().references(() => goals.id, { onDelete: 'cascade' }),
  contributionType: text('contribution_type', { enum: ['direct', 'indirect', 'supporting'] }).notNull(),
  weight: numeric('weight'),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueMeasurableGoal: uniqueIndex('contributions_unique').on(table.measurableId, table.goalId),
}))

// Policies: concrete implementations of ideas by specific entities
export const policies = pgTable('policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  ideaId: uuid('idea_id').notNull().references(() => ideas.id, { onDelete: 'restrict' }),
  entityId: uuid('entity_id').notNull().references(() => politicalEntities.id, { onDelete: 'cascade' }),
  administrationId: uuid('administration_id').references(() => administrations.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', { enum: ['proposed', 'planned', 'active', 'completed', 'cancelled'] }).notNull().default('proposed'),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  budgetAllocated: numeric('budget_allocated'),
  budgetCurrency: text('budget_currency').default('EUR'),
  implementationNotes: text('implementation_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
