/**
 * Entity relationships - BASE dataset
 * Hierarchical: Zona 1 → Comune di Milano → Regione Lombardia
 */

export const entityRelationships = [
  { entity: 'Zona 1', related: 'Comune di Milano', type: 'parent city' },
  { entity: 'Comune di Milano', related: 'Regione Lombardia', type: 'parent region' },
]
