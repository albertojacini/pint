/**
 * Administrations - BASE dataset
 * Single active administration
 */

export const administrations = [
  {
    name: "Milan City Council 2021-2026",
    entity: "Comune di Milano",
    term_start: "2021-10-18T00:00:00Z",
    term_end: null,
    status: "active",
    description: "Current administration led by Giuseppe Sala",
    council_composition: [
      { party: 'PD', seats: 24, color: '#D32F2F' },
      { party: 'FdI', seats: 18, color: '#1B5E20' },
    ],
    election_data: {
      electionDate: "2021-10-03",
      turnout: 67.56,
      nextElection: "2027-03-15",
      results: [
        { candidate: 'Sala', coalition: 'Centro-Sinistra', percentage: 57.73, color: '#D32F2F' },
        { candidate: 'Bernardo', coalition: 'Centro-Destra', percentage: 31.97, color: '#1B5E20' },
      ]
    }
  },
]

export const administrationMembers = [
  {
    admin: "Milan City Council 2021-2026",
    person: "Giuseppe Sala",
    role_type: "mayor",
    role_title: "Mayor of Milan",
    icon: "crown",
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Anna Scavuzzo",
    role_type: "councilor",
    role_title: "Istruzione",
    icon: "graduation-cap",
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
]
