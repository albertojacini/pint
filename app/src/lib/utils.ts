import { sql, type SQL, type Column } from 'drizzle-orm'

export { cn } from './cn'

/**
 * Create a SQL condition to match UUID by prefix (casts to text for LIKE)
 * Used for slug-based routing where we match by first 4 chars of UUID
 */
export function idStartsWith(column: Column, prefix: string): SQL {
  return sql`${column}::text LIKE ${prefix + '%'}`
}

/**
 * Generate a slug from a text string
 * e.g., "Comune di Milano" → "comune-di-milano"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
}

/**
 * Create a URL-friendly slug with ID prefix
 * e.g., id="a1b2c3d4-..." + name="Comune di Milano" → "a1b2-comune-di-milano"
 */
export function createUrlSlug(id: string, text: string): string {
  const idPrefix = id.substring(0, 4)
  const slug = generateSlug(text)
  return `${idPrefix}-${slug}`
}

/**
 * Parse a URL slug to extract the ID prefix
 * e.g., "a1b2-comune-di-milano" → { idPrefix: "a1b2", slug: "comune-di-milano" }
 */
export function parseUrlSlug(urlSlug: string): { idPrefix: string; slug: string } {
  const idPrefix = urlSlug.substring(0, 4)
  const slug = urlSlug.substring(5) // Skip "a1b2-"
  return { idPrefix, slug }
}

/**
 * Build entity URL path
 */
export function entityPath(entity: { id: string; slug: string }): string {
  return `/pe/${entity.id.substring(0, 4)}-${entity.slug}`
}

/**
 * Build provision URL path
 */
export function provisionPath(
  entity: { id: string; slug: string },
  provision: { id: string; slug: string }
): string {
  return `/pe/${entity.id.substring(0, 4)}-${entity.slug}/pr/${provision.id.substring(0, 4)}-${provision.slug}`
}
