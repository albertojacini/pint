#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readdirSync } from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '../..')
const migrationsDir = join(rootDir, 'supabase/migrations')

// Set default DATABASE_URL if not present
if (!process.env.DATABASE_URL) {
  console.log('⚠️  DATABASE_URL not set, using default local database')
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
}

console.log('🔄 Running SQL migrations from /supabase/migrations...')

// Get all .sql files and sort them
const sqlFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.sql'))
  .sort()

for (const file of sqlFiles) {
  console.log(`📄 Applying ${file}...`)
  const migrationPath = join(migrationsDir, file)

  const result = spawnSync(
    'psql',
    [process.env.DATABASE_URL, '-f', migrationPath],
    {
      stdio: 'inherit',
      cwd: rootDir,
      env: process.env,
    }
  )

  if (result.error) {
    console.error(`❌ Migration failed for ${file}:`, result.error)
    process.exit(1)
  }

  if (result.status !== 0) {
    console.error(`❌ Migration failed for ${file} with exit code:`, result.status)
    process.exit(result.status)
  }
}

console.log('✅ All migrations completed successfully')
