// ============================================================================
// SCHEMA INDEX
// Provides both namespaced and flat exports for all subsystems
// ============================================================================

// Namespaced exports (recommended for new code)
import * as accounts from './accounts'
import * as government from './government'
import * as taxonomy from './taxonomy'
import * as policies from './policies'
import * as sources from './sources'
import * as ingestion from './ingestion'
import * as provisionPipeline from './provision-pipeline'
import * as research from './research'
import * as knowledge from './knowledge'

export {
  accounts,
  government,
  taxonomy,
  policies,
  sources,
  ingestion,
  provisionPipeline,
  research,
  knowledge,
}

// ============================================================================
// Flat exports
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

// ingestion
export {
  sources as ingSources,
  events,
  eventDocuments,
  eventCandidates,
  candidateDocuments,
  changeCandidates,
} from './ingestion'
export type { SourceExtractedData, CandidateProposedData } from './ingestion'

// provision-pipeline
export { provisionDrafts, draftDocuments } from './provision-pipeline'

// research
export { researches, sources as researchSources } from './research'

// knowledge
export { artifacts, artifactSources } from './knowledge'
