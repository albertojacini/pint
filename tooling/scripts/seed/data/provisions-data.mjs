/**
 * Provisions data
 * Institutional/legal/operational infrastructure owned by entities
 * Includes laws, institutions, utilities, regulations
 */

export const provisions = [
  {
    entity: "City of Milan", // entity name, will be resolved to ID
    title: "Area C Congestion Charge",
    description: "Traffic restriction zone in central Milan with access fees for vehicles during business hours",
    type: "regulation",
    status: "active",
    effectiveFrom: "2012-01-16",
    effectiveUntil: null,
    idea: "Congestion pricing" // optional: idea that inspired this provision
  },
  {
    entity: "City of Milan",
    title: "Urban Speed Limit Regulations",
    description: "Municipal regulations governing speed limits in residential and urban zones",
    type: "regulation",
    status: "active",
    effectiveFrom: "2015-01-01",
    effectiveUntil: null,
    idea: "Introduce urban speed limits"
  },
]