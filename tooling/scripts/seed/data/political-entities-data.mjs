/**
 * Political entities fixture data
 * Cities, regions, countries, and supranational organizations
 */

export const politicalEntities = [
  // Italy - Milan hierarchy
  {
    name: "Zone 1",
    description: "The first district of Milan",
    avatar_url: "https://example.com/avatar.jpg",
    type: "district",
    native_name: "Zona 1",
    population: 100000,
    score_innovation: 8,
    score_sustainability: 7,
    score_impact: 9
  },
  {
    name: "City of Milan",
    description: "The city council of Milan",
    avatar_url: "https://example.com/avatar.jpg",
    type: "city",
    native_name: "Comune di Milano",
    population: 1500000,
    score_innovation: 9,
    score_sustainability: 8,
    score_impact: 9
  },
  {
    name: "Lombardy",
    description: "The regional government of Lombardy",
    avatar_url: "https://example.com/avatar.jpg",
    type: "region",
    native_name: "Regione Lombardia",
    population: 10000000,
    score_innovation: 7,
    score_sustainability: 6,
    score_impact: 8
  },
  {
    name: "Republic of Italy",
    description: "The Italian Republic",
    avatar_url: "https://example.com/avatar.jpg",
    type: "country",
    native_name: "Repubblica Italiana",
    population: 60000000,
    score_innovation: 6,
    score_sustainability: 5,
    score_impact: 7
  },

  // Supranational
  {
    name: "European Union",
    description: "The European Union",
    avatar_url: "https://example.com/avatar.jpg",
    type: "supranational",
    population: 450000000,
    score_innovation: 8,
    score_sustainability: 7,
    score_impact: 9
  },
  {
    name: "United Nations",
    description: "The United Nations",
    avatar_url: "https://example.com/avatar.jpg",
    type: "supranational",
    score_innovation: 7,
    score_sustainability: 6,
    score_impact: 8
  },

  // Germany - Berlin hierarchy
  {
    name: "Britz",
    description: "The 6th district of Berlin",
    avatar_url: "https://example.com/avatar.jpg",
    type: "neighborhood",
    native_name: "Bezirk Britz"
  },
  {
    name: "Neukölln",
    description: "The 7th district of Berlin",
    avatar_url: "https://example.com/avatar.jpg",
    type: "district",
    native_name: "Bezirk Neukölln",
    population: 300000,
    score_innovation: 7,
    score_sustainability: 6,
    score_impact: 8
  },
  {
    name: "City of Berlin",
    description: "The city council of Berlin",
    avatar_url: "https://example.com/avatar.jpg",
    type: "city",
    native_name: "Stadt Berlin",
    population: 4000000,
    score_innovation: 8,
    score_sustainability: 7,
    score_impact: 9
  },
  {
    name: "Federal Republic of Germany",
    description: "The federal government of Germany",
    avatar_url: "https://example.com/avatar.jpg",
    type: "country",
    native_name: "Bundesrepublik Deutschland",
    population: 80000000,
    score_innovation: 8,
    score_sustainability: 7,
    score_impact: 9
  },

  // Spain - Barcelona hierarchy
  {
    name: "Eixample",
    description: "The 2nd district of Barcelona",
    avatar_url: "https://example.com/avatar.jpg",
    type: "neighborhood",
    native_name: "Eixample"
  },
  {
    name: "City of Barcelona",
    description: "The city council of Barcelona",
    avatar_url: "https://example.com/avatar.jpg",
    type: "city",
    native_name: "Ajuntament de Barcelona",
    population: 2000000,
    score_innovation: 9,
    score_sustainability: 8,
    score_impact: 9
  },
  {
    name: "Kingdom of Spain",
    description: "The federal government of Spain",
    avatar_url: "https://example.com/avatar.jpg",
    type: "country",
    native_name: "Reino de España",
    population: 47000000,
    score_innovation: 7,
    score_sustainability: 6,
    score_impact: 8
  },

  // France - Paris hierarchy
  {
    name: "1st arrondissement",
    description: "The 1st district of Paris",
    avatar_url: "https://example.com/avatar.jpg",
    type: "neighborhood",
    native_name: "1er arrondissement"
  },
  {
    name: "Paris Centre",
    description: "The central district of Paris",
    avatar_url: "https://example.com/avatar.jpg",
    type: "district",
    native_name: "Centre de Paris",
    population: 100000,
    score_innovation: 7,
    score_sustainability: 6,
    score_impact: 8
  },
  {
    name: "City of Paris",
    description: "The city council of Paris",
    avatar_url: "https://example.com/avatar.jpg",
    type: "city",
    native_name: "Ville de Paris",
    population: 2200000,
    score_innovation: 9,
    score_sustainability: 8,
    score_impact: 9
  },
  {
    name: "French Republic",
    description: "The federal government of France",
    avatar_url: "https://example.com/avatar.jpg",
    type: "country",
    native_name: "République française",
    population: 67000000,
    score_innovation: 8,
    score_sustainability: 7,
    score_impact: 9
  },

  // Austria - Vienna hierarchy
  {
    name: "Leopoldstadt",
    description: "The 2nd district of Vienna",
    avatar_url: "https://example.com/avatar.jpg",
    type: "neighborhood",
    native_name: "Leopoldstadt"
  },
  {
    name: "City of Vienna",
    description: "The city council of Vienna",
    avatar_url: "https://example.com/avatar.jpg",
    type: "city",
    native_name: "Stadt Wien",
    population: 1900000,
    score_innovation: 9,
    score_sustainability: 8,
    score_impact: 9
  },
  {
    name: "Republic of Austria",
    description: "The federal government of Austria",
    avatar_url: "https://example.com/avatar.jpg",
    type: "country",
    native_name: "Republik Österreich",
    population: 9000000,
    score_innovation: 8,
    score_sustainability: 7,
    score_impact: 9
  },

  // UK - London hierarchy
  {
    name: "London Borough of Hackney",
    description: "The local government of Hackney",
    avatar_url: "https://example.com/avatar.jpg",
    type: "borough",
    native_name: "London Borough of Hackney"
  },
  {
    name: "City of London",
    description: "The city council of London",
    avatar_url: "https://example.com/avatar.jpg",
    type: "city",
    native_name: "City of London",
    population: 9000000,
    score_innovation: 9,
    score_sustainability: 8,
    score_impact: 9
  },
  {
    name: "United Kingdom",
    description: "The federal government of the United Kingdom",
    avatar_url: "https://example.com/avatar.jpg",
    type: "country",
    native_name: "United Kingdom",
    population: 66000000,
    score_innovation: 8,
    score_sustainability: 7,
    score_impact: 9
  },

  // USA - New York hierarchy
  {
    name: "Bedford–Stuyvesant",
    description: "The neighborhood of Brooklyn",
    avatar_url: "https://example.com/avatar.jpg",
    type: "neighborhood",
    native_name: "Bedford–Stuyvesant"
  },
  {
    name: "Brooklyn",
    description: "The borough of Brooklyn",
    avatar_url: "https://example.com/avatar.jpg",
    type: "district",
    native_name: "Brooklyn",
    population: 2600000,
    score_innovation: 9,
    score_sustainability: 8,
    score_impact: 9
  },
  {
    name: "City of New York",
    description: "The city council of New York",
    avatar_url: "https://example.com/avatar.jpg",
    type: "city",
    native_name: "City of New York",
    population: 8500000,
    score_innovation: 9,
    score_sustainability: 8,
    score_impact: 9
  },
  {
    name: "State of New York",
    description: "The state government of New York",
    avatar_url: "https://example.com/avatar.jpg",
    type: "region",
    native_name: "State of New York",
    population: 20000000,
    score_innovation: 8,
    score_sustainability: 7,
    score_impact: 9
  },
  {
    name: "United States of America",
    description: "The federal government of the United States",
    avatar_url: "https://example.com/avatar.jpg",
    type: "country",
    native_name: "United States of America",
    population: 330000000,
    score_innovation: 8,
    score_sustainability: 7,
    score_impact: 9
  }
]