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
 * Generate a deterministic fake embedding vector from a seed
 * Uses a simple seeded PRNG to create reproducible unit vectors
 * @param {number} seed - Seed value for reproducibility
 * @param {number} dimensions - Vector dimensions (1536 for text-embedding-3-small)
 * @returns {number[]} Unit vector of specified dimensions
 */
function generateFakeEmbedding(seed, dimensions = 1536) {
  // Simple mulberry32 PRNG
  const mulberry32 = (a) => {
    return () => {
      let t = (a += 0x6d2b79f5)
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  const rand = mulberry32(seed)
  const vector = []

  // Generate random values
  for (let i = 0; i < dimensions; i++) {
    // Use Box-Muller transform for normal distribution (more realistic)
    const u1 = rand()
    const u2 = rand()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    vector.push(z)
  }

  // Normalize to unit vector
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0))
  return vector.map((v) => v / magnitude)
}

/**
 * Format embedding array as PostgreSQL vector literal
 * @param {number[]} embedding
 * @returns {string}
 */
function formatEmbedding(embedding) {
  return '[' + embedding.map((v) => v.toFixed(8)).join(',') + ']'
}

/**
 * Seed knowledge domain
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} _supabase - Supabase client (unused)
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedKnowledge(client, _supabase, idMaps) {
  // Load data dynamically
  const { sourcePublishers, sourceDocuments, artifacts, documentChunks } = await loadData(
    'knowledge-data.mjs'
  )

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

  // ===== DOCUMENT CHUNKS =====
  logger.startSection('document chunks')

  let chunksCount = 0
  let chunksSkipped = 0
  const documentChunkCounts = new Map() // Track chunk count per document

  if (await hasData(client, 'sou_document_chunks')) {
    logger.skipSection('Document Chunks')
  } else if (documentChunks && documentChunks.length > 0) {
    for (const docChunks of documentChunks) {
      const documentId = idMaps.documents.get(docChunks.document)

      if (!documentId) {
        logger.warning(`Skipping chunks for "${docChunks.document}" - document not found`)
        chunksSkipped += docChunks.chunks?.length || 0
        continue
      }

      let docChunkCount = 0

      for (let i = 0; i < docChunks.chunks.length; i++) {
        const chunk = docChunks.chunks[i]
        const id = generateUUID()

        // Generate fake embedding from seed
        const embedding = generateFakeEmbedding(chunk.seed)
        const embeddingStr = formatEmbedding(embedding)

        await client.query(
          `INSERT INTO sou_document_chunks
           (id, document_id, chunk_index, content, content_tokens, embedding, metadata)
           VALUES ($1, $2, $3, $4, $5, $6::vector, $7)`,
          [
            id,
            documentId,
            i,
            chunk.content,
            chunk.tokens || null,
            embeddingStr,
            JSON.stringify({}),
          ]
        )

        chunksCount++
        docChunkCount++
      }

      documentChunkCounts.set(documentId, docChunkCount)
    }

    // Update documents with embedding status and chunk count
    for (const [documentId, chunkCount] of documentChunkCounts) {
      await client.query(
        `UPDATE sou_documents
         SET embedding_status = 'completed', chunk_count = $2
         WHERE id = $1`,
        [documentId, chunkCount]
      )
    }

    if (chunksSkipped > 0) {
      logger.warning(`Skipped ${chunksSkipped} chunks due to missing documents`)
    }

    logger.endSection('document chunks', chunksCount)
  } else {
    logger.endSection('document chunks', 0)
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
        columns: ['id', 'title', 'description', 'artifact_type', 'artifact_origin', 'content', 'state', 'state_notes'],
        values: [
          id,
          artifact.title,
          artifact.description || null,
          artifact.artifact_type,
          artifact.artifact_origin || 'extracted',
          artifact.content || null,
          artifact.state || 'draft',
          artifact.state_notes || null,
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
