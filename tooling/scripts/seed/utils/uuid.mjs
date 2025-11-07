/**
 * UUID generation utilities
 */

export const generateUUID = () => crypto.randomUUID()

/**
 * Generate a UUID with a prefix for debugging
 * @param {string} prefix - Optional prefix for debugging
 * @returns {string} UUID
 */
export const generateUUIDWithPrefix = (prefix) => {
  const uuid = crypto.randomUUID()
  if (prefix && process.env.DEBUG_UUIDS) {
    console.log(`Generated UUID for ${prefix}: ${uuid}`)
  }
  return uuid
}