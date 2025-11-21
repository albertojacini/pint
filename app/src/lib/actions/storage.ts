'use server'

import { db } from '@/lib/db/client'
import { politicalEntities, people, userProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { uploadFileServer, deleteFileServer, generateFilePath } from '@/lib/storage'
import { revalidatePath } from 'next/cache'

/**
 * Upload and set avatar for a political entity
 */
export async function updateEntityAvatar(entityId: string, formData: FormData) {
  const file = formData.get('avatar') as File
  if (!file) {
    throw new Error('No file provided')
  }

  // Validate file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`)
  }

  const maxSizeBytes = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSizeBytes) {
    throw new Error('File too large. Max size: 5MB')
  }

  // Get current entity to delete old avatar if exists
  const [entity] = await db
    .select()
    .from(politicalEntities)
    .where(eq(politicalEntities.id, entityId))

  // Upload new avatar
  const path = generateFilePath('avatars', 'entities', entityId, file)
  const { url } = await uploadFileServer('avatars', path, file)

  // Update database
  await db
    .update(politicalEntities)
    .set({ avatarUrl: url })
    .where(eq(politicalEntities.id, entityId))

  // Delete old avatar if exists (extract path from URL)
  if (entity?.avatarUrl) {
    try {
      const oldPath = entity.avatarUrl.split('/storage/v1/object/public/avatars/')[1]
      if (oldPath) {
        await deleteFileServer('avatars', oldPath)
      }
    } catch (error) {
      console.error('Failed to delete old avatar:', error)
    }
  }

  revalidatePath(`/entities/${entityId}`)
  return { success: true, url }
}

/**
 * Upload and set avatar for a person
 */
export async function updatePersonAvatar(personId: string, formData: FormData) {
  const file = formData.get('avatar') as File
  if (!file) {
    throw new Error('No file provided')
  }

  // Validate file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`)
  }

  const maxSizeBytes = 5 * 1024 * 1024
  if (file.size > maxSizeBytes) {
    throw new Error('File too large. Max size: 5MB')
  }

  // Get current person to delete old avatar if exists
  const [person] = await db
    .select()
    .from(people)
    .where(eq(people.id, personId))

  // Upload new avatar
  const path = generateFilePath('avatars', 'people', personId, file)
  const { url } = await uploadFileServer('avatars', path, file)

  // Update database
  await db
    .update(people)
    .set({ avatarUrl: url })
    .where(eq(people.id, personId))

  // Delete old avatar if exists
  if (person?.avatarUrl) {
    try {
      const oldPath = person.avatarUrl.split('/storage/v1/object/public/avatars/')[1]
      if (oldPath) {
        await deleteFileServer('avatars', oldPath)
      }
    } catch (error) {
      console.error('Failed to delete old avatar:', error)
    }
  }

  revalidatePath(`/people/${personId}`)
  return { success: true, url }
}

/**
 * Upload and set avatar for a user profile
 */
export async function updateUserAvatar(userId: string, formData: FormData) {
  const file = formData.get('avatar') as File
  if (!file) {
    throw new Error('No file provided')
  }

  // Validate file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`)
  }

  const maxSizeBytes = 5 * 1024 * 1024
  if (file.size > maxSizeBytes) {
    throw new Error('File too large. Max size: 5MB')
  }

  // Get current user to delete old avatar if exists
  const [user] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, userId))

  // Upload new avatar
  const path = generateFilePath('avatars', 'users', userId, file)
  const { url } = await uploadFileServer('avatars', path, file)

  // Update database
  await db
    .update(userProfiles)
    .set({ avatarUrl: url })
    .where(eq(userProfiles.id, userId))

  // Delete old avatar if exists
  if (user?.avatarUrl) {
    try {
      const oldPath = user.avatarUrl.split('/storage/v1/object/public/avatars/')[1]
      if (oldPath) {
        await deleteFileServer('avatars', oldPath)
      }
    } catch (error) {
      console.error('Failed to delete old avatar:', error)
    }
  }

  revalidatePath(`/profile`)
  return { success: true, url }
}
