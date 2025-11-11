/**
 * Political entities fixture data
 * Cities, regions, countries, and supranational organizations
 */

export const politicalEntities = [
  // Italy - Milan hierarchy
  {
    name: "Zona 1",
    description: "The first district of Milan",
    avatar_url: "https://example.com/avatar.jpg",
    type: "district",
    population: 100000,
    score_innovation: 8,
    score_sustainability: 7,
    score_impact: 9
  },
  {
    name: "Comune di Milano",
    description: "The city council of Milan",
    avatar_url: "https://example.com/avatar.jpg",
    type: "city",
    population: 1500000,
    score_innovation: 9,
    score_sustainability: 8,
    score_impact: 9,
    identity_data: {
      countryCode: "IT",
      regionName: "Lombardy",
      cityType: "Metropolitan City",
      coatOfArmsUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Coat_of_arms_of_Milan.svg/200px-Coat_of_arms_of_Milan.svg.png",
      officialWebsite: "https://www.comune.milano.it",
      sisterCities: 15
    },
    essential_stats: {
      area: 181.8,
      density: 8249,
      gdpPerCapita: 49500,
      timezone: "CET (UTC+1)",
      languages: ["Italian"],
      elevation: 120,
      founded: "600 BC"
    },
    political_landscape: {
      currentMayor: {
        name: "Giuseppe Sala",
        party: "Centro-sinistra",
        partyColor: "#D32F2F"
      },
      lastElection: {
        date: "2021-10-03",
        turnout: 47.7
      },
      nextElection: {
        date: "2026-10-04"
      },
      councilComposition: [
        { party: "Centro-sinistra", seats: 24, color: "#D32F2F" },
        { party: "Centro-destra", seats: 18, color: "#1976D2" },
        { party: "M5S", seats: 6, color: "#FFB300" }
      ]
    },
    performance_indicators: {
      innovation: {
        overall: 9,
        subcategories: [
          { name: "Digital Infrastructure", score: 9 },
          { name: "Startup Ecosystem", score: 8 },
          { name: "R&D Investment", score: 9 },
          { name: "Smart City Initiatives", score: 8 }
        ]
      },
      sustainability: {
        overall: 8,
        subcategories: [
          { name: "Green Mobility", score: 8 },
          { name: "Renewable Energy", score: 7 },
          { name: "Waste Management", score: 9 },
          { name: "Air Quality", score: 6 }
        ]
      },
      impact: {
        overall: 9,
        subcategories: [
          { name: "Economic Growth", score: 9 },
          { name: "Social Inclusion", score: 8 },
          { name: "Quality of Life", score: 9 },
          { name: "Cultural Influence", score: 10 }
        ]
      }
    },
    community_metrics: {
      userSatisfaction: {
        overall: 7.8,
        responsesCount: 1247
      },
      activeProjects: 34,
      communityEngagement: {
        totalUsers: 8920,
        activeContributors: 156
      },
      surveys: [
        { title: "Public Transport", score: 8.2, responses: 543 },
        { title: "Green Spaces", score: 7.1, responses: 412 },
        { title: "Safety", score: 7.9, responses: 689 },
        { title: "Digital Services", score: 8.5, responses: 398 }
      ]
    }
  },
  {
    name: "Regione Lombardia",
    description: "The regional government of Lombardy",
    avatar_url: "https://example.com/avatar.jpg",
    type: "region",
    population: 10000000,
    score_innovation: 7,
    score_sustainability: 6,
    score_impact: 8
  },
  {
    name: "Repubblica Italiana",
    description: "The Italian Republic",
    avatar_url: "https://example.com/avatar.jpg",
    type: "country",
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
    name: "Bezirk Britz",
    description: "The 6th district of Berlin",
    avatar_url: "https://example.com/avatar.jpg",
    type: "neighborhood"
  },
  {
    name: "Bezirk Neukölln",
    description: "The 7th district of Berlin",
    avatar_url: "https://example.com/avatar.jpg",
    type: "district",
    population: 300000,
    score_innovation: 7,
    score_sustainability: 6,
    score_impact: 8
  },
  {
    name: "Stadt Berlin",
    description: "The city council of Berlin",
    avatar_url: "https://example.com/avatar.jpg",
    type: "city",
    population: 4000000,
    score_innovation: 8,
    score_sustainability: 7,
    score_impact: 9
  },
  {
    name: "Bundesrepublik Deutschland",
    description: "The federal government of Germany",
    avatar_url: "https://example.com/avatar.jpg",
    type: "country",
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
    type: "neighborhood"
  },
  {
    name: "Ajuntament de Barcelona",
    description: "The city council of Barcelona",
    avatar_url: "https://example.com/avatar.jpg",
    type: "city",
    population: 2000000,
    score_innovation: 9,
    score_sustainability: 8,
    score_impact: 9
  },
  {
    name: "Reino de España",
    description: "The federal government of Spain",
    avatar_url: "https://example.com/avatar.jpg",
    type: "country",
    population: 47000000,
    score_innovation: 7,
    score_sustainability: 6,
    score_impact: 8
  },

  // France - Paris hierarchy
  {
    name: "1er arrondissement",
    description: "The 1st district of Paris",
    avatar_url: "https://example.com/avatar.jpg",
    type: "neighborhood"
  },
  {
    name: "Centre de Paris",
    description: "The central district of Paris",
    avatar_url: "https://example.com/avatar.jpg",
    type: "district",
    population: 100000,
    score_innovation: 7,
    score_sustainability: 6,
    score_impact: 8
  },
  {
    name: "Ville de Paris",
    description: "The city council of Paris",
    avatar_url: "https://example.com/avatar.jpg",
    type: "city",
    population: 2200000,
    score_innovation: 9,
    score_sustainability: 8,
    score_impact: 9
  },
  {
    name: "République française",
    description: "The federal government of France",
    avatar_url: "https://example.com/avatar.jpg",
    type: "country",
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
    type: "neighborhood"
  },
  {
    name: "Stadt Wien",
    description: "The city council of Vienna",
    avatar_url: "https://example.com/avatar.jpg",
    type: "city",
    population: 1900000,
    score_innovation: 9,
    score_sustainability: 8,
    score_impact: 9
  },
  {
    name: "Republik Österreich",
    description: "The federal government of Austria",
    avatar_url: "https://example.com/avatar.jpg",
    type: "country",
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
    type: "borough"
  },
  {
    name: "City of London",
    description: "The city council of London",
    avatar_url: "https://example.com/avatar.jpg",
    type: "city",
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
    type: "neighborhood"
  },
  {
    name: "Brooklyn",
    description: "The borough of Brooklyn",
    avatar_url: "https://example.com/avatar.jpg",
    type: "district",
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
    population: 330000000,
    score_innovation: 8,
    score_sustainability: 7,
    score_impact: 9
  }
]