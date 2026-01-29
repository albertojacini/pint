import { pgTable, text, uuid, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { documents } from './sources'

// ============================================================================
// KNOWLEDGE SUBSYSTEM (kno_)
// ============================================================================
//
// WHAT IS AN ARTIFACT?
// --------------------
// An artifact is a **curated dataset**: cleaned, structured, factual data
// ready to be used in tables or charts. Artifacts are NOT analysis or
// interpretation - they are the factual foundation upon which analysis is built.
//
// Think of artifacts as sitting at the "Information" level of the DIKW pyramid
// (Data → Information → Knowledge → Wisdom): structured and contextualized,
// but not yet interpreted or analyzed.
//
// THEORETICAL FOUNDATIONS:
// - Ackoff, R.L. (1989) "From Data to Wisdom" - DIKW hierarchy
// - Kimball, R. - "Conformed Facts" in dimensional modeling
// - W3C PROV-O - Data provenance and lineage
// - SDMX (Statistical Data and Metadata eXchange) - Statistical indicators
//
// CORE PRINCIPLES:
// ----------------
// 1. CLEAN & REPORT-READY
//    Data should be ready for direct use in a table or chart in a PDF report.
//    Not raw dumps, not huge multidimensional datasets.
//    Rule of thumb: if it can't fit in one visualization, split it.
//
// 2. SINGLE DIMENSION
//    Each artifact describes ONE dimension of a phenomenon. If you need to
//    describe multiple dimensions, create multiple artifacts.
//    Think: one artifact = one table or one chart.
//
// 3. FACTUAL, NOT ANALYTICAL
//    ✓ "Revenue was €25M in 2023"
//    ✗ "Revenue growth indicates program success"
//
// 4. MUTABLE (FOR NOW)
//    Artifacts can be updated. Future versions may introduce immutability
//    and versioning.
//
// ARTIFACT ORIGIN (artifactOrigin):
// ---------------------------------
// This is the key distinction in how artifacts come to exist:
//
// 1. EXTRACTED - Bottom-up, source-driven
//    "This source contains useful data" → extract and structure it
//    - Structure follows the source document
//    - All data points are directly sourced (verified by definition)
//    - High confidence, but limited to what sources provide
//    - Example: Extracting a tariff table from an official regulation
//
// 2. CURATED - Top-down, need-driven
//    "We need to know X about this phenomenon" → design structure → fill it
//    - Structure designed for our analytical needs
//    - May contain gaps, estimates, or placeholders where no source exists
//    - Represents "desired knowledge" - what we wish we knew
//    - Use stateNotes to document what's missing or estimated
//    - Example: A comparison table across cities where some data is unavailable
//
// ARTIFACT TYPES (artifactType):
// ------------------------------
// 1. EVOLUTION - Time-series showing change over periods
//    Use for: Revenue trends, usage statistics, price history
//    Format: CSV with period column + value columns
//    Example: "year,revenue_mln,entries\n2020,25.3,8500000"
//
// 2. DISTRIBUTION - Breakdown of a whole into categories
//    Use for: Demographics, budget allocation, usage by type
//    Format: CSV with category, value, percentage
//    Example: "category,count,percentage\nResidents,2800000,18.9"
//
// 3. TABLE - Reference data with multiple attributes per entity
//    Use for: Rules matrices, eligibility criteria, comparison tables
//    Format: CSV with entity identifier + attribute columns
//    Example: "area,vehicle_class,banned_from\nArea C,Euro 3,2019"
//
// 4. PARAMETERS - Current operational values (snapshot)
//    Use for: Tariffs, schedules, thresholds, rules in effect
//    Format: YAML-like key-value pairs
//    Example: "fee: 7.50 EUR\nhours: 07:30-19:30"
//
// STATE VALUES (state):
// ---------------------
// - draft: Content incomplete or unreviewed
// - partial: Some data present, gaps identified in stateNotes
// - complete: All expected data present and verified
// - stale: Source data updated; artifact needs refresh
//
// LINEAGE:
// --------
// Artifact lineage is tracked through:
// - artifactOrigin: How the artifact was created (extracted vs curated)
// - derivationNotes: Methodology - how was this assembled/calculated?
// - artifactSources: Links to source documents (kno_artifact_sources table)
//
// ============================================================================

export const artifacts = pgTable('kno_artifacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'), // Brief summary of what this artifact contains
  // How was this artifact created? See ARTIFACT ORIGIN documentation above.
  // - extracted: Bottom-up from sources, all data directly sourced
  // - curated: Top-down for our needs, may contain gaps/estimates
  artifactOrigin: text('artifact_origin', {
    enum: ['extracted', 'curated']
  }).notNull().default('extracted'),
  // See ARTIFACT TYPES documentation above. 'narrative' is deprecated and
  // should not be used for new artifacts - narratives are analysis, not data.
  artifactType: text('artifact_type', {
    enum: ['evolution', 'distribution', 'table', 'parameters', 'narrative']
  }).notNull(),
  content: text('content'), // Format depends on artifactType (see above)
  state: text('state', {
    enum: ['draft', 'partial', 'complete', 'stale']
  }).notNull().default('draft'),
  stateNotes: text('state_notes'), // Explain what's missing (partial) or outdated (stale)
  // Methodology notes: how was this data assembled, calculated, or derived?
  // Especially important for 'curated' artifacts to explain estimation methods.
  derivationNotes: text('derivation_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const artifactSources = pgTable('kno_artifact_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  artifactId: uuid('artifact_id').notNull().references(() => artifacts.id, { onDelete: 'cascade' }),
  documentId: uuid('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueArtifactDocument: uniqueIndex('kno_artifact_sources_unique').on(table.artifactId, table.documentId),
}))
