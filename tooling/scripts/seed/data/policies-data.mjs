/**
 * Policies data
 * Concrete implementations of ideas by specific entities
 */

export const policies = [
  {
    idea: "Introduce urban speed limits", // idea title, will be resolved to ID
    entity: "City of Milan", // entity name, will be resolved to ID
    administration: "Milan City Council 2021-2026", // admin name, will be resolved to ID
    title: "Città 30 - Milan 30 km/h zones",
    description: "Implementation of 30 km/h speed limits in all residential areas and urban zones",
    status: "active",
    start_date: "2024-01-01T00:00:00Z",
    end_date: null,
    budget_allocated: 2500000,
    budget_currency: "EUR",
    implementation_notes: "Phased rollout across all city districts with new signage and traffic calming measures"
  },
  {
    idea: "Subsidize public transport",
    entity: "City of Milan",
    administration: "Milan City Council 2021-2026",
    title: "Free ATM Metro Trial",
    description: "Pilot program offering free metro access for students and low-income residents (100% subsidy)",
    status: "planned",
    start_date: "2025-09-01T00:00:00Z",
    end_date: null,
    budget_allocated: 15000000,
    budget_currency: "EUR",
    implementation_notes: "Initial 6-month trial targeting 100,000 beneficiaries, with potential expansion based on results"
  },
]