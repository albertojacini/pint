/**
 * Policy-Action relationships data
 * Maps how actions relate to policies (optional, loose relationships)
 */

export const policyActions = [
  {
    policy: "Urban Speed Limit Regulations", // policy title, will be resolved to ID
    action: "Città 30 - Milan 30 km/h zones" // action title, will be resolved to ID
  },
  // Note: "Free ATM Metro Trial" action has no policy relationship (demonstrating loose coupling)
]
