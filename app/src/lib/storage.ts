import { createClient as createBrowserClient } from './supabase/client'

export type StorageBucket = 'avatars' | 'media' | 'documents'

const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL

export type UploadResult = {
  url: string
  path: string
}

/**
 * Generate a unique file path for storage
 */
export function generateFilePath(
  bucket: StorageBucket,
  folder: string,
  entityId: string,
  file: File
): string {
  const timestamp = Date.now()
  const extension = file.name.split('.').pop()
  return `${folder}/${entityId}-${timestamp}.${extension}`
}

/**
 * Upload a file to Supabase Storage (browser)
 */
export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File
): Promise<UploadResult> {
  const supabase = createBrowserClient()

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`)
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  return {
    url: data.publicUrl,
    path,
  }
}

/**
 * Delete a file from Supabase Storage (browser)
 */
export async function deleteFile(bucket: StorageBucket, path: string): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

/**
 * Get Supabase Storage URL for a file with optional transformations
 * Returns null if path is null/empty
 * If NEXT_PUBLIC_SUPABASE_STORAGE_URL is set, uses that as the base URL
 * (useful for pointing local dev to production storage)
 */
export function getStorageUrl(
  bucket: StorageBucket,
  path: string | null,
  options?: {
    width?: number
    height?: number
    quality?: number
  }
): string | null {
  if (!path) return null

  // Use custom storage base URL if configured (e.g., for using prod images locally)
  if (STORAGE_BASE_URL) {
    const baseUrl = `${STORAGE_BASE_URL}/storage/v1/object/public/${bucket}/${path}`
    if (options) {
      const params = new URLSearchParams()
      if (options.width) params.set('width', options.width.toString())
      if (options.height) params.set('height', options.height.toString())
      if (options.quality) params.set('quality', options.quality.toString())
      const queryString = params.toString()
      return queryString ? `${baseUrl}?${queryString}` : baseUrl
    }
    return baseUrl
  }

  const supabase = createBrowserClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path, {
    transform: options
      ? {
          width: options.width,
          height: options.height,
          quality: options.quality,
        }
      : undefined,
  })

  return data.publicUrl
}

/**
 * Upload avatar for an entity (convenience function)
 */
export async function uploadEntityAvatar(entityId: string, file: File): Promise<UploadResult> {
  const path = generateFilePath('avatars', 'entities', entityId, file)
  return uploadFile('avatars', path, file)
}

/**
 * Upload avatar for a person (convenience function)
 */
export async function uploadPersonAvatar(personId: string, file: File): Promise<UploadResult> {
  const path = generateFilePath('avatars', 'people', personId, file)
  return uploadFile('avatars', path, file)
}

/**
 * Upload avatar for a user (convenience function)
 */
export async function uploadUserAvatar(userId: string, file: File): Promise<UploadResult> {
  const path = generateFilePath('avatars', 'users', userId, file)
  return uploadFile('avatars', path, file)
}

/**
 * Validate file before upload
 */
export function validateImageFile(file: File, maxSizeMB: number = 5): void {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`)
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    throw new Error(`File too large. Max size: ${maxSizeMB}MB`)
  }
}
