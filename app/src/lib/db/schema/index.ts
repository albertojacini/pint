// ============================================================================
// SCHEMA INDEX
// Flat exports of all table definitions for Drizzle ORM
// ============================================================================

// accounts
export { profiles } from './accounts'

// government
export {
  entities,
  entityRelations,
  people,
  administrations,
  members,
  provisionTypes,
  provisions,
  provisionTypeAssocs,
  provisionArtifacts,
  changes,
} from './government'

// taxonomy
export { categories, tags, taggables } from './taxonomy'

// policies
export { goals, measurables, ideas, effects, contributions, stakeholders } from './policies'

// sources
export { publishers, documents, documentChunks } from './sources'

// events
export { events } from './events'

// provision-pipeline
export { provisionDrafts, draftDocuments } from './provision-pipeline'

// research
export { researches, sources as researchSources } from './research'

// knowledge
export { artifacts, artifactSources } from './knowledge'

// discussions
export {
  posts as discPosts,
  comments as discComments,
  votes as discVotes,
  proposalVotes as discProposalVotes,
} from './discussions'

// voter-budget
export {
  items as gamvotItems,
  sessions as gamvotSessions,
  votes as gamvotVotes,
} from './voter-budget'
