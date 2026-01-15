/**
 * Knowledge Domain Seeder
 * Seeds knowledge subsystem: publishers, documents, artifacts, and their relationships
 * Dependencies: provisions (gov_provisions)
 */

import { loadData } from '../utils/data-loader.mjs'
import { logger } from '../utils/logger.mjs'
import { generateUUID } from '../utils/uuid.mjs'
import { hasData, insertQuery } from '../utils/db-helpers.mjs'

/**
 * Seed knowledge domain
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} _supabase - Supabase client (unused)
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedKnowledge(client, _supabase, idMaps) {
  // Load data dynamically
  const { sourcePublishers, sourceDocuments, artifacts } = await loadData('knowledge-data.mjs')

  // ===== SOURCE PUBLISHERS =====
  logger.startSection('source publishers')

  let publishersCount = 0

  if (await hasData(client, 'sou_publishers')) {
    logger.skipSection('Source Publishers')
  } else {
    for (const publisher of sourcePublishers) {
      // Use predefined ID if provided (e.g., Unknown Publisher), otherwise generate
      const id = publisher.id || generateUUID()

      await insertQuery(client, {
        table: 'sou_publishers',
        columns: [
          'id',
          'name',
          'description',
          'url',
          'publisher_type',
          'language',
          'reliability_score',
          'update_frequency',
          'access_method',
          'is_active',
        ],
        values: [
          id,
          publisher.name,
          publisher.description || null,
          publisher.url || null,
          publisher.publisher_type,
          publisher.language || null,
          publisher.reliability_score || null,
          publisher.update_frequency || null,
          publisher.access_method || null,
          publisher.is_active !== undefined ? publisher.is_active : true,
        ],
      })

      publishersCount++
      idMaps.publishers.set(publisher.name, id)
    }

    logger.endSection('source publishers', publishersCount)
  }

  // ===== SOURCE DOCUMENTS =====
  logger.startSection('source documents')

  let documentsCount = 0
  let documentsSkipped = 0

  if (await hasData(client, 'sou_documents')) {
    logger.skipSection('Source Documents')
  } else {
    for (const doc of sourceDocuments) {
      // Look up publisher ID
      const publisherId = idMaps.publishers.get(doc.publisher)

      if (!publisherId) {
        logger.warning(`Skipping document "${doc.title}" - publisher not found: ${doc.publisher}`)
        documentsSkipped++
        continue
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'sou_documents',
        columns: [
          'id',
          'publisher_id',
          'title',
          'url',
          'document_type',
          'language',
          'published_at',
        ],
        values: [
          id,
          publisherId,
          doc.title,
          doc.url || null,
          doc.document_type || null,
          doc.language || null,
          doc.published_at || null,
        ],
      })

      documentsCount++
      idMaps.documents.set(doc.title, id)
    }

    if (documentsSkipped > 0) {
      logger.warning(`Skipped ${documentsSkipped} documents due to missing dependencies`)
    }

    logger.endSection('source documents', documentsCount)
  }

  // ===== ARTIFACTS =====
  logger.startSection('artifacts')

  let artifactsCount = 0

  if (await hasData(client, 'kno_artifacts')) {
    logger.skipSection('Artifacts')
  } else {
    for (const artifact of artifacts) {
      const id = generateUUID()

      await insertQuery(client, {
        table: 'kno_artifacts',
        columns: ['id', 'title', 'description', 'artifact_type', 'content'],
        values: [
          id,
          artifact.title,
          artifact.description || null,
          artifact.artifact_type,
          artifact.content || null,
        ],
      })

      artifactsCount++
      idMaps.artifacts.set(artifact.title, id)
    }

    logger.endSection('artifacts', artifactsCount)
  }

  // ===== ARTIFACT SOURCES =====
  logger.startSection('artifact sources')

  let artifactSourcesCount = 0
  let artifactSourcesSkipped = 0

  for (const artifact of artifacts) {
    const artifactId = idMaps.artifacts.get(artifact.title)

    if (!artifactId) {
      logger.warning(`Skipping artifact sources for "${artifact.title}" - artifact not found`)
      artifactSourcesSkipped++
      continue
    }

    // Link artifact to source documents
    if (artifact.sourceDocuments && artifact.sourceDocuments.length > 0) {
      for (const docTitle of artifact.sourceDocuments) {
        const documentId = idMaps.documents.get(docTitle)

        if (!documentId) {
          logger.warning(
            `Skipping artifact source link: artifact="${artifact.title}", document="${docTitle}" (document not found)`
          )
          artifactSourcesSkipped++
          continue
        }

        const id = generateUUID()

        await insertQuery(client, {
          table: 'kno_artifact_sources',
          columns: ['id', 'artifact_id', 'document_id'],
          values: [id, artifactId, documentId],
        })

        artifactSourcesCount++
      }
    }
  }

  if (artifactSourcesSkipped > 0) {
    logger.warning(`Skipped ${artifactSourcesSkipped} artifact sources due to missing references`)
  }

  logger.endSection('artifact sources', artifactSourcesCount)

  // ===== PROVISION ARTIFACTS =====
  logger.startSection('provision artifacts')

  let provisionArtifactsCount = 0
  let provisionArtifactsSkipped = 0

  for (const artifact of artifacts) {
    const artifactId = idMaps.artifacts.get(artifact.title)

    if (!artifactId) {
      logger.warning(`Skipping provision artifacts for "${artifact.title}" - artifact not found`)
      provisionArtifactsSkipped++
      continue
    }

    // Link artifact to provisions
    if (artifact.provisions && artifact.provisions.length > 0) {
      for (const provisionTitle of artifact.provisions) {
        const provisionId = idMaps.provisions.get(provisionTitle)

        if (!provisionId) {
          logger.warning(
            `Skipping provision artifact link: artifact="${artifact.title}", provision="${provisionTitle}" (provision not found)`
          )
          provisionArtifactsSkipped++
          continue
        }

        const id = generateUUID()

        await insertQuery(client, {
          table: 'gov_provision_artifacts',
          columns: ['id', 'provision_id', 'artifact_id'],
          values: [id, provisionId, artifactId],
        })

        provisionArtifactsCount++
      }
    }
  }

  if (provisionArtifactsSkipped > 0) {
    logger.warning(
      `Skipped ${provisionArtifactsSkipped} provision artifacts due to missing references`
    )
  }

  logger.endSection('provision artifacts', provisionArtifactsCount)

  return idMaps
}
