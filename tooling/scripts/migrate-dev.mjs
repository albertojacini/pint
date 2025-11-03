#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '../..')

// Set default DATABASE_URL if not present
if (!process.env.DATABASE_URL) {
  console.log('⚠️  DATABASE_URL not set, using default local database')
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:54322/pint'
}

console.log('🔄 Running Drizzle migrations...')

const result = spawnSync('pnpm', ['-C', 'app', 'run', 'db:migrate'], {
  stdio: 'inherit',
  cwd: rootDir,
  env: process.env,
})

if (result.error) {
  console.error('❌ Migration failed:', result.error)
  process.exit(1)
}

if (result.status !== 0) {
  console.error('❌ Migration failed with exit code:', result.status)
  process.exit(result.status)
}

console.log('✅ Migrations completed successfully')
