/**
 * Changes data
 * Links events to their target provisions/entities/administrations
 */

export const changes = [
  // ========================================
  // AREA C CONGESTION CHARGE CHANGES
  // ========================================

  {
    event: "Area C Congestion Charge Approved",
    targetType: "provision",
    targetName: "Area C Congestion Charge",
    changeType: "create",
    description: "Legislative approval creating the Area C congestion charge zone",
    effectiveAt: "2012-01-16T00:00:00Z"
  },
  {
    event: "Area C Goes Live",
    targetType: "provision",
    targetName: "Area C Congestion Charge",
    changeType: "activate",
    description: "Area C begins operation with €5 daily fee",
    effectiveAt: "2012-01-16T00:00:00Z"
  },
  {
    event: "Area C Diesel Restrictions Tightened",
    targetType: "provision",
    targetName: "Area C Congestion Charge",
    changeType: "update",
    description: "Euro 3 diesel vehicles banned, Euro 4 diesel fees increased",
    effectiveAt: "2017-10-01T00:00:00Z"
  },
  {
    event: "Area C Fee Increase",
    targetType: "provision",
    targetName: "Area C Congestion Charge",
    changeType: "update",
    description: "Daily fee increased from €5 to €7.50",
    effectiveAt: "2019-04-01T00:00:00Z"
  },
  {
    event: "Area C Electric Vehicle Policy Update",
    targetType: "provision",
    targetName: "Area C Congestion Charge",
    changeType: "update",
    description: "EV exemptions extended through 2030, plug-in hybrids lose exemption",
    effectiveAt: "2023-06-15T00:00:00Z"
  },

  // ========================================
  // ATM OWNERSHIP CHANGES
  // ========================================

  {
    event: "ATM Fare Structure Update",
    targetType: "provision",
    targetName: "ATM Ownership Stake",
    changeType: "update",
    description: "New integrated fare system with increased ticket prices",
    effectiveAt: "2019-07-15T00:00:00Z"
  },
  {
    event: "ATM Fare Update 2024",
    targetType: "provision",
    targetName: "ATM Ownership Stake",
    changeType: "update",
    description: "Single urban ticket increased to €2.20",
    effectiveAt: "2024-01-01T00:00:00Z"
  },

  // ========================================
  // DEHORS REGULATION CHANGES
  // ========================================

  {
    event: "Dehors Temporary COVID Rules Extended",
    targetType: "provision",
    targetName: "Public Space Occupation Permits (Dehors)",
    changeType: "update",
    description: "Temporary expanded outdoor seating rules extended through 2024",
    effectiveAt: "2022-03-01T00:00:00Z"
  },
  {
    event: "New Permanent Dehors Regulation",
    targetType: "provision",
    targetName: "Public Space Occupation Permits (Dehors)",
    changeType: "update",
    description: "New permanent design standards and fee structure adopted",
    effectiveAt: "2024-06-20T00:00:00Z"
  },

  // ========================================
  // RECENT CHANGES (for activity chart demo)
  // ========================================

  {
    event: "Area C Enforcement Hours Extended",
    targetType: "provision",
    targetName: "Area C Congestion Charge",
    changeType: "update",
    description: "Saturday morning enforcement added (7:30-14:00)",
    effectiveAt: "2024-11-15T00:00:00Z"
  },
  {
    event: "ATM Night Service Expansion",
    targetType: "provision",
    targetName: "ATM Ownership Stake",
    changeType: "update",
    description: "Night bus service routes expanded",
    effectiveAt: "2024-12-01T00:00:00Z"
  },
  {
    event: "Area C 2025 Rate Adjustment",
    targetType: "provision",
    targetName: "Area C Congestion Charge",
    changeType: "update",
    description: "2025 rates confirmed, new hybrid vehicle category added",
    effectiveAt: "2025-01-15T00:00:00Z"
  }
]
