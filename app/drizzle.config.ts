import { defineConfig } from 'drizzle-kit'

// NOTE: This config is ONLY used for Drizzle Studio (pnpm db:studio)
// Migrations are managed in /infra/supabase/migrations/ using SQL files
export default defineConfig({
  schema: './src/lib/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
})
