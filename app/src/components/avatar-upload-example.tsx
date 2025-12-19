'use client'

import { useState, useRef } from 'react'
import { updateEntityAvatar } from '@/lib/actions/storage'
import { getAvatarUrl } from '@/lib/storage'

/**
 * Example component showing how to upload an avatar for a political entity
 *
 * Usage:
 * <AvatarUploadExample entityId="uuid-here" currentAvatarUrl="/path/to/avatar.jpg" />
 */
export function AvatarUploadExample({
  entityId,
  currentAvatarUrl,
}: {
  entityId: string
  currentAvatarUrl?: string | null
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const file = formData.get('avatar') as File

    if (!file || file.size === 0) {
      setError('Please select a file')
      return
    }

    setUploading(true)

    try {
      const result = await updateEntityAvatar(entityId, formData)
      setAvatarUrl(getAvatarUrl(result.path))
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Current Avatar Preview */}
      {avatarUrl && (
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover"
          />
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          name="avatar"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={uploading}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer"
        />

        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Avatar'}
        </button>
      </form>

      {/* Usage with Image Transformations */}
      {avatarUrl && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-sm font-medium mb-2">Image Transformations:</p>
          <div className="flex gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Original</p>
              <img
                src={avatarUrl}
                alt="Original"
                className="w-16 h-16 rounded object-cover"
              />
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Thumbnail (64x64)</p>
              <img
                src={`${avatarUrl}?width=64&height=64&quality=80`}
                alt="Thumbnail"
                className="w-16 h-16 rounded object-cover"
              />
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Medium (200x200)</p>
              <img
                src={`${avatarUrl}?width=200&height=200&quality=80`}
                alt="Medium"
                className="w-16 h-16 rounded object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Simple example showing browser-side upload using the storage utilities directly
 * (Note: Server actions are recommended for production use)
 */
export function BrowserUploadExample({ entityId }: { entityId: string }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    try {
      // Import the storage utilities dynamically (client-side only)
      const { uploadEntityAvatar, validateImageFile, getAvatarUrl } = await import('@/lib/storage')

      // Validate first
      validateImageFile(file)

      // Upload
      const result = await uploadEntityAvatar(entityId, file)
      setAvatarUrl(getAvatarUrl(result.path))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt="Uploaded avatar"
          className="w-24 h-24 rounded-full object-cover"
        />
      )}

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full text-sm"
      />

      {error && <div className="text-sm text-red-600">{error}</div>}
      {uploading && <div className="text-sm text-gray-600">Uploading...</div>}
    </div>
  )
}
