/**
 * Categories seeder
 * Seeds the hierarchical policy categories tree
 */

import { categoriesTree } from '../data/categories-tree.mjs'
import { logger } from '../utils/logger.mjs'
import { generateUUID } from '../utils/uuid.mjs'
import { hasData, insertQuery } from '../utils/db-helpers.mjs'

/**
 * Flatten the categories tree into a list of insertable records
 * @param {Array} tree - The categories tree
 * @returns {Array} Flattened categories with parent relationships
 */
function flattenCategories(tree) {
  const categories = []
  let orderIndex = 0

  function processCategory(category, parentId = null, path = []) {
    const currentPath = [...path, category.title]
    const id = generateUUID()

    // Only insert if it's a leaf node (no children or empty children array)
    const hasChildren = category.children && category.children.length > 0

    // Skip nodes with empty children array (they're just containers)
    if (!hasChildren && category.children !== undefined && category.children.length === 0) {
      return { id, skipped: true }
    }

    // Add the category
    categories.push({
      id,
      parent_id: parentId,
      title: category.title,
      description: category.description || null,
      order_index: orderIndex++,
      only_entities_with_types: category.only_entities_with_types || null,
      path: currentPath
    })

    // Process children if they exist
    if (hasChildren) {
      for (const child of category.children) {
        processCategory(child, id, currentPath)
      }
    }

    return { id, skipped: false }
  }

  // Process each root category
  for (const category of tree) {
    processCategory(category)
  }

  return categories
}

/**
 * Seed categories into the database
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client (unused here)
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedCategories(client, supabase, idMaps) {
  logger.startSection('categories')

  // Check if categories already exist
  if (await hasData(client, 'categories')) {
    logger.skipSection('Categories')
    return idMaps
  }

  // Flatten the tree structure
  const categories = flattenCategories(categoriesTree)

  // Insert each category
  for (const category of categories) {
    await insertQuery(client, {
      table: 'categories',
      columns: [
        'id',
        'parent_id',
        'title',
        'description',
        'order_index',
        'only_entities_with_types'
      ],
      values: [
        category.id,
        category.parent_id,
        category.title,
        category.description,
        category.order_index,
        category.only_entities_with_types
      ]
    })

    // Store ID mapping for later reference
    idMaps.categories.set(category.title, category.id)
  }

  logger.endSection('categories', categories.length)

  return idMaps
}