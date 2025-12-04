/**
 * Storage utility functions for uploading files to Supabase Storage during seeding
 */

import { readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { logger } from './logger.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ASSETS_DIR = join(__dirname, '..', 'assets', 'avatars')

/**
 * Upload image to Supabase Storage
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client
 * @param {string} bucket - Bucket name
 * @param {string} path - File path in bucket
 * @param {Buffer} buffer - Image buffer
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} Public URL of uploaded file
 */
async function uploadToStorage(supabase, bucket, path, buffer, contentType) {
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType,
      cacheControl: '3600',
      upsert: true, // Allow overwriting for idempotent seeding
    })

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`)
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Upload an avatar image from local filesystem to Supabase Storage
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client
 * @param {string} localPath - Relative path to the local file (e.g., "./assets/avatars/entities/comune-di-milano.webp")
 * @param {string} entityName - Name of the entity (used for file naming)
 * @param {string} entityType - Type of entity (entities, people, users)
 * @returns {Promise<string|null>} Public URL of uploaded file, or null if failed
 */
export async function uploadAvatar(supabase, localPath, entityName, entityType = 'entities') {
  if (!supabase) {
    logger.warning('Supabase client not available, skipping avatar upload')
    return null
  }

  if (!localPath || localPath === 'https://example.com/avatar.jpg') {
    return null
  }

  try {
    // Read the local file
    const filePath = localPath.startsWith('./')
      ? join(__dirname, '..', localPath.replace('./', ''))
      : localPath

    const buffer = await readFile(filePath)

    // Determine content type from file extension
    const extension = filePath.split('.').pop()
    const contentType = extension === 'webp' ? 'image/webp'
      : extension === 'png' ? 'image/png'
      : extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg'
      : extension === 'svg' ? 'image/svg+xml'
      : 'image/webp'

    // Generate a safe filename
    const sanitizedName = entityName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const fileName = `${sanitizedName}.${extension}`
    const storagePath = `${entityType}/${fileName}`

    // Upload to Supabase Storage
    const publicUrl = await uploadToStorage(supabase, 'avatars', storagePath, buffer, contentType)

    return publicUrl
  } catch (error) {
    logger.warning(`Failed to upload avatar for ${entityName}: ${error.message}`)
    return null
  }
}
