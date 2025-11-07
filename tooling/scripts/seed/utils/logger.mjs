/**
 * Logger utilities for consistent output during database seeding
 */

export const logger = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg, err) => console.error(`❌ ${msg}`, err || ''),

  startSection: (name) => {
    console.log(`\n📊 Seeding ${name}...`)
  },

  endSection: (name, count) => {
    console.log(`✅ ${count} ${name} inserted`)
  },

  skipSection: (name) => {
    console.log(`⚠️  ${name} already exist, skipping...`)
  },

  start: () => {
    console.log('🌱 Starting database seeding...')
  },

  complete: () => {
    console.log('\n🎉 Database seeding completed successfully!')
  },

  connectionSuccess: () => {
    console.log('✅ Connected to database')
  },

  adminUser: {
    creating: () => console.log('👤 Creating admin user...'),
    created: (email) => console.log(`✅ Admin user created: ${email}`),
    exists: () => console.log('⚠️  Admin user already exists'),
    skipped: (reason) => console.log(`ℹ️  Skipping admin user creation (${reason})`)
  }
}