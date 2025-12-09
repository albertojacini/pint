/**
 * Administrations and their members
 * Government terms and the people who served in them
 */

// Milan administrations
export const administrations = [
  {
    name: "Milan City Council 2021-2026",
    entity: "Comune di Milano", // entity name, will be resolved to ID
    term_start: "2021-10-18T00:00:00Z",
    term_end: null,
    status: "active",
    description: "Current administration led by Giuseppe Sala",
    council_composition: [
      { party: 'PD', seats: 24, color: '#D32F2F' },
      { party: 'FdI', seats: 18, color: '#1B5E20' },
      { party: 'Lega', seats: 6, color: '#F57C00' },
    ],
    election_data: {
      electionDate: "2021-10-03",
      turnout: 67.56,
      nextElection: "2027-03-15",
      results: [
        { candidate: 'Sala', coalition: 'Centro-Sinistra', percentage: 57.73, color: '#D32F2F' },
        { candidate: 'Bernardo', coalition: 'Centro-Destra', percentage: 31.97, color: '#1B5E20' },
        { candidate: 'Paragone', coalition: 'Paragone', percentage: 2.99, color: '#7B1FA2' },
        { candidate: 'Pavone', coalition: 'Movimento 5 Stelle', percentage: 2.7, color: '#F5C71A' },
        { candidate: 'Mariani', coalition: 'Mariani', percentage: 1.57, color: '#00ACC1' },
      ]
    }
  },
  {
    name: "Milan City Council 2016-2021",
    entity: "Comune di Milano",
    term_start: "2016-06-20T00:00:00Z",
    term_end: "2021-10-18T00:00:00Z",
    status: "historical",
    description: "Second term of Giuseppe Sala",
    election_data: {
      electionDate: "2016-06-05",
      turnout: 67.56,
      results: [
        { candidate: 'Sala', coalition: 'Centro-Sinistra', percentage: 41.7, color: '#D32F2F' },
        { candidate: 'Parisi', coalition: 'Centro-Destra', percentage: 40.78, color: '#1B5E20' },
        { candidate: 'Corrado', coalition: 'Movimento 5 Stelle', percentage: 10.06, color: '#F5C71A' },
        { candidate: 'Rizzo', coalition: 'Milano in Comune', percentage: 3.56, color: '#E91E63' },
        { candidate: 'Cappato', coalition: 'Radicali Federalisti Laici Ecologisti', percentage: 1.88, color: '#009688' },
        { candidate: 'Mardegan', coalition: 'Movimento 5 Stelle', percentage: 1.12, color: '#F5C71A' },
      ]
    }
  },
  {
    name: "Milan City Council 2011-2016",
    entity: "Comune di Milano",
    term_start: "2011-06-13T00:00:00Z",
    term_end: "2016-06-20T00:00:00Z",
    status: "historical",
    description: "Administration led by Giuliano Pisapia",
    election_data: {
      electionDate: "2011-05-15",
      turnout: 67.56,
      results: [
        { candidate: 'Pisapia', coalition: 'Centro-Sinistra', percentage: 48.05, color: '#D32F2F' },
        { candidate: 'Moratti', coalition: 'Centro-Destra', percentage: 41.59, color: '#1B5E20' },
        { candidate: 'Palmeri', coalition: 'Palmeri', percentage: 5.54, color: '#FF5722' },
        { candidate: 'Calise', coalition: 'Movimento 5 Stelle', percentage: 3.23, color: '#F5C71A' },
        { candidate: 'Pagliarini', coalition: 'Pagliarini', percentage: 0.64, color: '#795548' },
      ]
    }
  },
  {
    name: "Milan City Council 2006-2011",
    entity: "Comune di Milano",
    term_start: "2006-05-29T00:00:00Z",
    term_end: "2011-06-13T00:00:00Z",
    status: "historical",
    description: "Administration led by Letizia Moratti"
  }
]

// Administration members (people in roles)
export const administrationMembers = [
  // Current administration (2021-2026) - Executive members
  {
    admin: "Milan City Council 2021-2026",
    person: "Giuseppe Sala",
    role_type: "mayor",
    role_title: "Mayor of Milan",
    icon: "🎖️",
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Anna Scavuzzo",
    role_type: "councilor",
    role_title: "Istruzione",
    icon: "🎓",
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Guido Bardelli",
    role_type: "councilor",
    role_title: "Casa",
    icon: "🏠",
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Lamberto Bertolé",
    role_type: "councilor",
    role_title: "Welfare e Salute",
    icon: "🏥",
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Alessia Cappello",
    role_type: "councilor",
    role_title: "Sviluppo Economico e Politiche del Lavoro",
    icon: "💼",
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Arianna Censi",
    role_type: "councilor",
    role_title: "Mobilità",
    icon: "🚇",
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Emmanuel Conte",
    role_type: "councilor",
    role_title: "Risorse Finanziarie, Economiche e Patrimoniali",
    icon: "💰",
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Elena Grandi",
    role_type: "councilor",
    role_title: "Ambiente e Verde",
    icon: "🌳",
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Marco Granelli",
    role_type: "councilor",
    role_title: "Sicurezza",
    icon: "🛡️",
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Martina Riva",
    role_type: "councilor",
    role_title: "Sport, Turismo e Politiche Giovanili",
    icon: "⚽",
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Gaia Romani",
    role_type: "councilor",
    role_title: "Decentramento, Quartieri e Partecipazione, Servizi Civici e Generali",
    icon: "🏘️",
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Tommaso Sacchi",
    role_type: "councilor",
    role_title: "Cultura",
    icon: "🎭",
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Giancarlo Tancredi",
    role_type: "councilor",
    role_title: "Rigenerazione Urbana",
    icon: "🏗️",
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Roberta Guaineri",
    role_type: "councilor",
    role_title: "Councilor for Tourism",
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Pierfrancesco Maran",
    role_type: "councilor",
    role_title: "Councilor for Urban Planning",
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Gabriele Rabaiotti",
    role_type: "councilor",
    role_title: "Councilor for Social Housing",
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },

  // Previous administration (2016-2021)
  {
    admin: "Milan City Council 2016-2021",
    person: "Giuseppe Sala",
    role_type: "mayor",
    role_title: "Mayor of Milan",
    appointed_at: "2016-06-20T00:00:00Z",
    left_at: "2021-10-18T00:00:00Z",
    status: "historical"
  },
  {
    admin: "Milan City Council 2016-2021",
    person: "Marco Granelli",
    role_type: "councilor",
    role_title: "Councilor for Mobility",
    appointed_at: "2016-06-20T00:00:00Z",
    left_at: "2021-10-18T00:00:00Z",
    status: "historical"
  },
  {
    admin: "Milan City Council 2016-2021",
    person: "Cristina Tajani",
    role_type: "councilor",
    role_title: "Councilor for Labor",
    appointed_at: "2016-06-20T00:00:00Z",
    left_at: "2021-10-18T00:00:00Z",
    status: "historical"
  },
  {
    admin: "Milan City Council 2016-2021",
    person: "Lorenzo Lipparini",
    role_type: "councilor",
    role_title: "Councilor for Youth",
    appointed_at: "2016-06-20T00:00:00Z",
    left_at: "2021-10-18T00:00:00Z",
    status: "historical"
  },
  {
    admin: "Milan City Council 2016-2021",
    person: "Pierfrancesco Maran",
    role_type: "councilor",
    role_title: "Councilor for Urban Planning",
    appointed_at: "2016-06-20T00:00:00Z",
    left_at: "2021-10-18T00:00:00Z",
    status: "historical"
  },

  // Earlier administration (2011-2016)
  {
    admin: "Milan City Council 2011-2016",
    person: "Giuliano Pisapia",
    role_type: "mayor",
    role_title: "Mayor of Milan",
    appointed_at: "2011-06-13T00:00:00Z",
    left_at: "2016-06-20T00:00:00Z",
    status: "historical"
  },
  {
    admin: "Milan City Council 2011-2016",
    person: "Carmela Rozza",
    role_type: "councilor",
    role_title: "Councilor for Social Policy",
    appointed_at: "2011-06-13T00:00:00Z",
    left_at: "2016-06-20T00:00:00Z",
    status: "historical"
  },
  {
    admin: "Milan City Council 2011-2016",
    person: "Francesco Cappelli",
    role_type: "councilor",
    role_title: "Councilor for Mobility",
    appointed_at: "2011-06-13T00:00:00Z",
    left_at: "2016-06-20T00:00:00Z",
    status: "historical"
  },
  {
    admin: "Milan City Council 2011-2016",
    person: "Chiara Bisconti",
    role_type: "councilor",
    role_title: "Councilor for Environment",
    appointed_at: "2011-06-13T00:00:00Z",
    left_at: "2016-06-20T00:00:00Z",
    status: "historical"
  },
  {
    admin: "Milan City Council 2011-2016",
    person: "Marco Barbieri",
    role_type: "councilor",
    role_title: "Councilor for Culture",
    appointed_at: "2011-06-13T00:00:00Z",
    left_at: "2016-06-20T00:00:00Z",
    status: "historical"
  },

  // Even earlier (2006-2011)
  {
    admin: "Milan City Council 2006-2011",
    person: "Letizia Moratti",
    role_type: "mayor",
    role_title: "Mayor of Milan",
    appointed_at: "2006-05-29T00:00:00Z",
    left_at: "2011-06-13T00:00:00Z",
    status: "historical"
  },
  {
    admin: "Milan City Council 2006-2011",
    person: "Bruno Tabacci",
    role_type: "councilor",
    role_title: "Deputy Mayor",
    appointed_at: "2006-05-29T00:00:00Z",
    left_at: "2011-06-13T00:00:00Z",
    status: "historical"
  },
  {
    admin: "Milan City Council 2006-2011",
    person: "Massimiliano Orsatti",
    role_type: "councilor",
    role_title: "Councilor for Urban Planning",
    appointed_at: "2006-05-29T00:00:00Z",
    left_at: "2011-06-13T00:00:00Z",
    status: "historical"
  },
]