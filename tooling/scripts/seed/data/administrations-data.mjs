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
    description: "Current administration led by Giuseppe Sala"
  },
  {
    name: "Milan City Council 2016-2021",
    entity: "Comune di Milano",
    term_start: "2016-06-20T00:00:00Z",
    term_end: "2021-10-18T00:00:00Z",
    status: "historical",
    description: "Second term of Giuseppe Sala"
  },
  {
    name: "Milan City Council 2011-2016",
    entity: "Comune di Milano",
    term_start: "2011-06-13T00:00:00Z",
    term_end: "2016-06-20T00:00:00Z",
    status: "historical",
    description: "Administration led by Giuliano Pisapia"
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
  // Current administration (2021-2026)
  {
    admin: "Milan City Council 2021-2026",
    person: "Giuseppe Sala",
    role_type: "mayor",
    role_title: "Mayor of Milan",
    appointed_at: "2021-10-18T00:00:00Z",
    left_at: null,
    status: "active"
  },
  {
    admin: "Milan City Council 2021-2026",
    person: "Marco Granelli",
    role_type: "councilor",
    role_title: "Councilor for Mobility",
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