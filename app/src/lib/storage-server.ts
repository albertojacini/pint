'use server'

import { createClient as createServerClient } from './supabase/server'
import type { StorageBucket, UploadResult } from './storage'

/**
 * Upload a file to Supabase Storage (server-side)
 */
export async function uploadFileServer(
  bucket: StorageBucket,
  path: string,
  file: File
): Promise<UploadResult> {
  const supabase = await createServerClient()

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
 * Delete a file from Supabase Storage (server-side)
 */
export async function deleteFileServer(bucket: StorageBucket, path: string): Promise<void> {
  const supabase = await createServerClient()

  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}
