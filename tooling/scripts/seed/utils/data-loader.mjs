/**
 * Data Loader Utility
 * Dynamically loads seed data from either 'base' or 'extended' dataset
 * based on SEED_DATASET environment variable
 */

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Get the current dataset name
 * @returns {'base' | 'extended'}
 */
export function getDataset() {
  return process.env.SEED_DATASET || 'base'
}

/**
 * Dynamically import a data file from the current dataset
 * @param {string} filename - The data file name (e.g., 'provisions-data.mjs')
 * @returns {Promise<object>} The exported module
 */
export async function loadData(filename) {
  const dataset = getDataset()
  const dataPath = join(__dirname, '..', 'data', dataset, filename)
  return import(dataPath)
}
