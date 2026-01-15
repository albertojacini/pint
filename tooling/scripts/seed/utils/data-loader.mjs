/**
 * Data Loader Utility
 * Loads seed data from the base dataset
 */

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Dynamically import a data file from the base dataset
 * @param {string} filename - The data file name (e.g., 'provisions-data.mjs')
 * @returns {Promise<object>} The exported module
 */
export async function loadData(filename) {
  const dataPath = join(__dirname, '..', 'data', 'base', filename)
  return import(dataPath)
}
