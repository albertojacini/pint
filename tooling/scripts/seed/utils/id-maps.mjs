/**
 * ID mapping utilities for managing foreign key relationships during seeding
 */

/**
 * Create ID maps for managing foreign key relationships
 * @returns {object} Object containing maps for each domain
 */
export function createIdMaps() {
  const maps = {
    users: new Map(),
    categories: new Map(),
    entities: new Map(),
    tags: new Map(),
    tagValues: new Map(),
    goals: new Map(),
    people: new Map(),
    administrations: new Map(),
    measurables: new Map(),
    ideas: new Map(),
    effects: new Map(),
    contributions: new Map(),
    policies: new Map()
  }

  /**
   * Lookup helper with error handling
   * @param {string} mapName - Name of the map
   * @param {string} key - Key to lookup
   * @returns {string} UUID value
   * @throws {Error} If key not found
   */
  maps.lookup = (mapName, key) => {
    if (!maps[mapName]) {
      throw new Error(`Unknown map: ${mapName}`)
    }

    const value = maps[mapName].get(key)
    if (!value) {
      throw new Error(`No ID found for ${mapName}:${key}`)
    }
    return value
  }

  /**
   * Safe lookup that returns null instead of throwing
   * @param {string} mapName - Name of the map
   * @param {string} key - Key to lookup
   * @returns {string|null} UUID value or null
   */
  maps.safeLookup = (mapName, key) => {
    if (!maps[mapName]) {
      console.warn(`Unknown map: ${mapName}`)
      return null
    }
    return maps[mapName].get(key) || null
  }

  /**
   * Set a value in a map
   * @param {string} mapName - Name of the map
   * @param {string} key - Key to set
   * @param {string} value - UUID value
   */
  maps.set = (mapName, key, value) => {
    if (!maps[mapName]) {
      throw new Error(`Unknown map: ${mapName}`)
    }
    maps[mapName].set(key, value)
  }

  /**
   * Get all keys from a map
   * @param {string} mapName - Name of the map
   * @returns {string[]} Array of keys
   */
  maps.keys = (mapName) => {
    if (!maps[mapName]) {
      throw new Error(`Unknown map: ${mapName}`)
    }
    return Array.from(maps[mapName].keys())
  }

  /**
   * Debug helper to print map contents
   * @param {string} mapName - Name of the map to print
   */
  maps.debug = (mapName) => {
    if (!mapName) {
      // Print all maps
      console.log('\n=== ID Maps Debug ===')
      for (const [name, map] of Object.entries(maps)) {
        if (typeof map === 'object' && map instanceof Map) {
          console.log(`\n${name}: ${map.size} entries`)
          if (map.size > 0 && map.size <= 10) {
            // Only print details for small maps
            for (const [key, value] of map) {
              console.log(`  ${key} -> ${value}`)
            }
          }
        }
      }
    } else if (maps[mapName] && maps[mapName] instanceof Map) {
      console.log(`\n${mapName}: ${maps[mapName].size} entries`)
      for (const [key, value] of maps[mapName]) {
        console.log(`  ${key} -> ${value}`)
      }
    }
  }

  return maps
}