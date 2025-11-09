/**
 * Provision-Event relationships data
 * Maps how events relate to provisions (optional, loose relationships)
 */

export const provisionEvents = [
  {
    provision: "Urban Speed Limit Regulations", // provision title, will be resolved to ID
    event: "Città 30 - Milan 30 km/h zones", // event title, will be resolved to ID
    relationshipType: "modifies" // how the event relates to the provision
  },
  // Note: "Free ATM Metro Trial" event has no provision relationship (demonstrating loose coupling)
]
