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
    description: "Legislative approval creating the Area C congestion charge zone"
  },
  {
    event: "Area C Goes Live",
    targetType: "provision",
    targetName: "Area C Congestion Charge",
    description: "Area C begins operation with €5 daily fee"
  },
  {
    event: "Area C Diesel Restrictions Tightened",
    targetType: "provision",
    targetName: "Area C Congestion Charge",
    description: "Euro 3 diesel vehicles banned, Euro 4 diesel fees increased"
  },
  {
    event: "Area C Fee Increase",
    targetType: "provision",
    targetName: "Area C Congestion Charge",
    description: "Daily fee increased from €5 to €7.50"
  },
  {
    event: "Area C Electric Vehicle Policy Update",
    targetType: "provision",
    targetName: "Area C Congestion Charge",
    description: "EV exemptions extended through 2030, plug-in hybrids lose exemption"
  },

  // ========================================
  // ATM OWNERSHIP CHANGES
  // ========================================

  {
    event: "ATM Fare Structure Update",
    targetType: "provision",
    targetName: "ATM Ownership Stake",
    description: "New integrated fare system with increased ticket prices"
  },
  {
    event: "ATM Fare Update 2024",
    targetType: "provision",
    targetName: "ATM Ownership Stake",
    description: "Single urban ticket increased to €2.20"
  },

  // ========================================
  // DEHORS REGULATION CHANGES
  // ========================================

  {
    event: "Dehors Temporary COVID Rules Extended",
    targetType: "provision",
    targetName: "Public Space Occupation Permits (Dehors)",
    description: "Temporary expanded outdoor seating rules extended through 2024"
  },
  {
    event: "New Permanent Dehors Regulation",
    targetType: "provision",
    targetName: "Public Space Occupation Permits (Dehors)",
    description: "New permanent design standards and fee structure adopted"
  },

  // ========================================
  // RECENT CHANGES (for activity chart demo)
  // ========================================

  {
    event: "Area C Enforcement Hours Extended",
    targetType: "provision",
    targetName: "Area C Congestion Charge",
    description: "Saturday morning enforcement added (7:30-14:00)"
  },
  {
    event: "ATM Night Service Expansion",
    targetType: "provision",
    targetName: "ATM Ownership Stake",
    description: "Night bus service routes expanded"
  },
  {
    event: "Area C 2025 Rate Adjustment",
    targetType: "provision",
    targetName: "Area C Congestion Charge",
    description: "2025 rates confirmed, new hybrid vehicle category added"
  }
]
