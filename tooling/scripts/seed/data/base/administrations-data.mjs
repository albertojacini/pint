/**
 * Administrations - BASE dataset
 * Milan administrations with extended data for UI testing
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
      { party: 'PD', seats: 32 },
      { party: 'FdI', seats: 22 },
      { party: 'Lega', seats: 14 },
      { party: 'M5S', seats: 12 },
    ],
    election_data: {
      electionDate: "2021-10-03",
      turnout: 47.69,
      nextElection: "2026-06-15",
      results: [
        { candidate: 'Sala', coalition: 'Centro-Sinistra', percentage: 57.73, color: 'hsl(var(--tag-pink))' },
        { candidate: 'Bernardo', coalition: 'Centro-Destra', percentage: 31.97, color: 'hsl(var(--tag-blue))' },
        { candidate: 'Pavone', coalition: 'M5S', percentage: 3.94, color: 'hsl(var(--tag-orange))' },
        { candidate: 'Pascale', coalition: 'Sinistra', percentage: 2.81, color: 'hsl(var(--tag-teal))' },
        { candidate: 'Bisin', coalition: 'Liberisti', percentage: 1.23, color: 'hsl(var(--tag-purple))' },
        { candidate: 'Quartapelle', coalition: 'Europa Verde', percentage: 0.98, color: 'hsl(var(--tag-green))' },
        { candidate: 'Rossi', coalition: 'Indipendente', percentage: 0.72, color: 'hsl(var(--tag-cyan))' },
        { candidate: 'Altri', coalition: 'Altri', percentage: 0.62, color: 'hsl(var(--tag-slate))' },
      ]
    }
  },
  {
    name: "Milan City Council 2016-2021",
    entity: "Comune di Milano",
    term_start: "2016-06-20T00:00:00Z",
    term_end: "2021-10-17T00:00:00Z",
    status: "historical",
    description: "First Sala administration",
    council_composition: [
      { party: 'PD', seats: 28 },
      { party: 'FI', seats: 18 },
      { party: 'Lega', seats: 16 },
      { party: 'M5S', seats: 18 },
    ],
    election_data: {
      electionDate: "2016-06-19",
      turnout: 54.65,
      results: [
        { candidate: 'Sala', coalition: 'Centro-Sinistra', percentage: 51.70, color: 'hsl(var(--tag-pink))' },
        { candidate: 'Parisi', coalition: 'Centro-Destra', percentage: 48.30, color: 'hsl(var(--tag-blue))' },
        { candidate: 'Corrado', coalition: 'M5S', percentage: 10.43, color: 'hsl(var(--tag-orange))' },
        { candidate: 'Ferrante', coalition: 'Sinistra', percentage: 2.12, color: 'hsl(var(--tag-teal))' },
        { candidate: 'Rizzo', coalition: 'PC', percentage: 0.89, color: 'hsl(var(--tag-purple))' },
        { candidate: 'Caparini', coalition: 'Lega Autonoma', percentage: 0.67, color: 'hsl(var(--tag-green))' },
        { candidate: 'Morelli', coalition: 'Lista Civica', percentage: 0.45, color: 'hsl(var(--tag-cyan))' },
        { candidate: 'Nardella', coalition: 'Indipendente', percentage: 0.34, color: 'hsl(var(--tag-slate))' },
      ]
    }
  },
  {
    name: "Milan City Council 2011-2016",
    entity: "Comune di Milano",
    term_start: "2011-05-31T00:00:00Z",
    term_end: "2016-06-19T00:00:00Z",
    status: "historical",
    description: "Pisapia administration",
    council_composition: [
      { party: 'PD', seats: 22 },
      { party: 'PDL', seats: 24 },
      { party: 'Lega', seats: 18 },
      { party: 'SEL', seats: 16 },
    ],
    election_data: {
      electionDate: "2011-05-30",
      turnout: 67.56,
      results: [
        { candidate: 'Pisapia', coalition: 'Centro-Sinistra', percentage: 55.11, color: 'hsl(var(--tag-pink))' },
        { candidate: 'Moratti', coalition: 'Centro-Destra', percentage: 44.89, color: 'hsl(var(--tag-blue))' },
        { candidate: 'Ferrario', coalition: 'M5S', percentage: 4.06, color: 'hsl(var(--tag-orange))' },
        { candidate: 'Catricala', coalition: 'UDC', percentage: 2.34, color: 'hsl(var(--tag-teal))' },
        { candidate: 'Zamparutti', coalition: 'Radicali', percentage: 1.56, color: 'hsl(var(--tag-purple))' },
        { candidate: 'Ferrara', coalition: 'Lista Civica', percentage: 1.12, color: 'hsl(var(--tag-green))' },
        { candidate: 'Agnoli', coalition: 'Verdi', percentage: 0.78, color: 'hsl(var(--tag-cyan))' },
        { candidate: 'Pagani', coalition: 'Indipendente', percentage: 0.45, color: 'hsl(var(--tag-slate))' },
      ]
    }
  },
  {
    name: "Milan City Council 2006-2011",
    entity: "Comune di Milano",
    term_start: "2006-05-30T00:00:00Z",
    term_end: "2011-05-30T00:00:00Z",
    status: "historical",
    description: "Moratti administration",
    council_composition: [
      { party: 'FI', seats: 26 },
      { party: 'AN', seats: 18 },
      { party: 'UDC', seats: 12 },
      { party: 'Ulivo', seats: 24 },
    ],
    election_data: {
      electionDate: "2006-05-29",
      turnout: 72.31,
      results: [
        { candidate: 'Moratti', coalition: 'Centro-Destra', percentage: 51.97, color: 'hsl(var(--tag-blue))' },
        { candidate: 'Ferrante', coalition: 'Centro-Sinistra', percentage: 48.03, color: 'hsl(var(--tag-pink))' },
        { candidate: 'Ferrario', coalition: 'Rifondazione', percentage: 3.45, color: 'hsl(var(--tag-teal))' },
        { candidate: 'Pedrazzi', coalition: 'Lega Nord', percentage: 2.89, color: 'hsl(var(--tag-green))' },
        { candidate: 'Colombo', coalition: 'Socialisti', percentage: 1.67, color: 'hsl(var(--tag-orange))' },
        { candidate: 'Bianchi', coalition: 'Verdi', percentage: 1.23, color: 'hsl(var(--tag-cyan))' },
        { candidate: 'Rossi', coalition: 'Lista Civica', percentage: 0.89, color: 'hsl(var(--tag-purple))' },
        { candidate: 'Neri', coalition: 'Indipendente', percentage: 0.56, color: 'hsl(var(--tag-slate))' },
      ]
    }
  },
]

export const administrationMembers = [
  // Mayor
  {
    admin: "Milan City Council 2021-2026",
    person: "Giuseppe Sala",
    role_type: "mayor",
    role_title: "Sindaco",
    icon: "crown",
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  // Vice Mayor
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
  // Assessors (12)
  {
    admin: "Milan City Council 2021-2026",
    person: "Pierfrancesco Maran",
    role_type: "councilor",
    role_title: "Urbanistica",
    icon: null,
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Marco Granelli",
    role_type: "councilor",
    role_title: "Sicurezza",
    icon: null,
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Arianna Censi",
    role_type: "councilor",
    role_title: "Mobilità",
    icon: null,
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Lamberto Bertolé",
    role_type: "councilor",
    role_title: "Welfare",
    icon: null,
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Gaia Romani",
    role_type: "councilor",
    role_title: "Casa",
    icon: null,
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Emmanuel Conte",
    role_type: "councilor",
    role_title: "Bilancio",
    icon: null,
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Martina Riva",
    role_type: "councilor",
    role_title: "Sport",
    icon: null,
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Tommaso Sacchi",
    role_type: "councilor",
    role_title: "Cultura",
    icon: null,
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Elena Grandi",
    role_type: "councilor",
    role_title: "Ambiente",
    icon: null,
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Giancarlo Tancredi",
    role_type: "councilor",
    role_title: "Rigenerazione Urbana",
    icon: null,
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Mario Bianchi",
    role_type: "councilor",
    role_title: "Lavori Pubblici",
    icon: null,
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Laura Rossi",
    role_type: "councilor",
    role_title: "Commercio",
    icon: null,
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  // Councilors (11)
  {
    admin: "Milan City Council 2021-2026",
    person: "Francesco Neri",
    role_type: "councilor",
    role_title: "Turismo",
    icon: null,
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Giulia Verdi",
    role_type: "councilor",
    role_title: "Giovani",
    icon: null,
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Alessandro Blu",
    role_type: "councilor",
    role_title: "Innovazione",
    icon: null,
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Chiara Gialli",
    role_type: "councilor",
    role_title: "Pari Opportunità",
    icon: null,
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Roberto Arancio",
    role_type: "councilor",
    role_title: "Partecipazione",
    icon: null,
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Silvia Viola",
    role_type: "councilor",
    role_title: "Decentramento",
    icon: null,
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Andrea Marrone",
    role_type: "councilor",
    role_title: "Periferie",
    icon: null,
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Federica Rosa",
    role_type: "councilor",
    role_title: "Servizi Civici",
    icon: null,
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Luca Celeste",
    role_type: "councilor",
    role_title: "Trasparenza",
    icon: null,
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Valentina Grigio",
    role_type: "councilor",
    role_title: "Legalità",
    icon: null,
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Davide Nero",
    role_type: "councilor",
    role_title: "Protezione Civile",
    icon: null,
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
]
