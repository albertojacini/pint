import { createClient } from './supabase/server'
import { db } from './db/client'
import { userProfiles } from './db/schema'
import { eq } from 'drizzle-orm'

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function requireUser() {
  const user = await getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Sync user to local database if not exists
  try {
    const existingProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.id, user.id),
    })

    if (!existingProfile) {
      await db.insert(userProfiles).values({
        id: user.id,
        email: user.email || '',
        fullName: user.user_metadata?.full_name || null,
        avatarUrl: user.user_metadata?.avatar_url || null,
      })
    }
  } catch (error) {
    console.error('Error syncing user profile:', error)
    // Continue even if sync fails - user is still authenticated
  }

  return user
}
