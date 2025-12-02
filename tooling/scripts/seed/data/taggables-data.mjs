/**
 * Taggables fixture data
 * Associates tags with entities, provisions, ideas, etc.
 */

export const taggablesData = [
  // Milano entity tags
  { tagSlug: 'european', taggableType: 'entity', taggableName: 'Comune di Milano' },
  { tagSlug: 'urban', taggableType: 'entity', taggableName: 'Comune di Milano' },
  { tagSlug: 'climate-change', taggableType: 'entity', taggableName: 'Comune di Milano' },
  { tagSlug: 'public-transit', taggableType: 'entity', taggableName: 'Comune di Milano' },
  { tagSlug: 'urban-planning', taggableType: 'entity', taggableName: 'Comune di Milano' },

  // Provision tags - ATM Ownership
  { tagSlug: 'public-transit', taggableType: 'provision', taggableName: 'ATM Ownership Stake' },
  { tagSlug: 'economic-impact', taggableType: 'provision', taggableName: 'ATM Ownership Stake' },

  // Provision tags - SEA Ownership
  { tagSlug: 'economic-development', taggableType: 'provision', taggableName: 'SEA (Aeroporti di Milano) Ownership Stake' },
  { tagSlug: 'economic-impact', taggableType: 'provision', taggableName: 'SEA (Aeroporti di Milano) Ownership Stake' },

  // Provision tags - A2A Ownership
  { tagSlug: 'climate-change', taggableType: 'provision', taggableName: 'A2A Ownership Stake' },
  { tagSlug: 'environmental-impact', taggableType: 'provision', taggableName: 'A2A Ownership Stake' },

  // Provision tags - MM Ownership
  { tagSlug: 'public-transit', taggableType: 'provision', taggableName: 'MM Ownership Stake' },
  { tagSlug: 'urban-planning', taggableType: 'provision', taggableName: 'MM Ownership Stake' },

  // Provision tags - Area B Regulation
  { tagSlug: 'climate-change', taggableType: 'provision', taggableName: 'Area B Vehicle Access Regulation' },
  { tagSlug: 'environmental-impact', taggableType: 'provision', taggableName: 'Area B Vehicle Access Regulation' },

  // Provision tags - IMU Tax
  { tagSlug: 'affordable-housing', taggableType: 'provision', taggableName: 'IMU - Imposta Municipale Unica' },
  { tagSlug: 'economic-impact', taggableType: 'provision', taggableName: 'IMU - Imposta Municipale Unica' },
]
