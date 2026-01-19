/**
 * Changes - BASE dataset
 * Links events to provisions
 *
 * A "change" is a manually tracked record of a modification to a target (provision, entity, administration).
 * - type: 'actual' = already happened, 'planned' = announced future modification
 * - effectiveDate: when the change takes/took effect (ISO date string)
 * - relevance: 1-10 scale indicating significance of the change
 */

export const changes = [
  {
    event: "Area C Post-COVID Reactivation",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2021-02-15",
    relevance: 8,
    description: "Area C enforcement resumed"
  },
  {
    event: "Area C Electric Vehicle Policy Update",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2024-01-01",
    relevance: 6,
    description: "EV exemptions extended through 2030"
  },
]
