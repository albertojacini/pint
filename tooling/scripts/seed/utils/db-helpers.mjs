/**
 * Database helper utilities for common operations
 */

/**
 * Check if a table has any rows
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {string} tableName - Table name to check
 * @returns {Promise<boolean>} - True if table has data
 */
export async function hasData(client, tableName) {
  const result = await client.query(`SELECT COUNT(*) FROM ${tableName}`)
  return parseInt(result.rows[0].count) > 0
}

/**
 * Insert a single record
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {string} table - Table name
 * @param {object} data - Data to insert
 * @returns {Promise<any>} Query result
 */
export async function insertOne(client, table, data) {
  const columns = Object.keys(data)
  const values = Object.values(data)
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')

  const query = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `

  return await client.query(query, values)
}

/**
 * Build and execute an insert query
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {object} params - Query parameters
 * @param {string} params.table - Table name
 * @param {string[]} params.columns - Column names
 * @param {any[]} params.values - Values to insert
 * @returns {Promise<any>} Query result
 */
export async function insertQuery(client, { table, columns, values }) {
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')

  const query = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES (${placeholders})
  `

  return await client.query(query, values)
}

/**
 * Get records from a table
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {string} table - Table name
 * @param {string} column - Column to select
 * @param {string} [where] - Optional WHERE clause
 * @returns {Promise<Map<string, string>>} Map of column value to ID
 */
export async function getIdMap(client, table, column, where = '') {
  const query = `SELECT id, ${column} FROM ${table} ${where}`
  const result = await client.query(query)

  const map = new Map()
  for (const row of result.rows) {
    map.set(row[column], row.id)
  }

  return map
}

/**
 * Batch insert helper
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {string} table - Table name
 * @param {string[]} columns - Column names
 * @param {any[][]} rows - Array of row values
 * @param {number} [batchSize=100] - Number of rows per batch
 */
export async function batchInsert(client, table, columns, rows, batchSize = 100) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)

    // Begin transaction for this batch
    await client.query('BEGIN')

    try {
      for (const row of batch) {
        await insertQuery(client, { table, columns, values: row })
      }
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    }
  }
}