/**
 * Political entities - BASE dataset
 * Minimal set: 1 city for understanding schema
 */

export const politicalEntities = [
  {
    name: 'Comune di Milano',
    language: 'it-IT',
    description: 'The city council of Milan',
    avatar_url: 'entities/comune-di-milano.png',
    type: 'city',
    population: 1500000,
    score_innovation: 9,
    score_sustainability: 8,
    score_impact: 9,
    essential_stats: {
      area: 181.8,
      density: 8249,
      gdpPerCapita: 49500,
      unemploymentRate: 5.8,
      povertyRate: 12,
    },
    performance_indicators: {
      innovation: {
        overall: 9,
        subcategories: [
          { name: 'Digital Infrastructure', score: 9 },
          { name: 'Smart City Initiatives', score: 8 },
        ],
      },
      sustainability: {
        overall: 8,
        subcategories: [
          { name: 'Green Mobility', score: 8 },
          { name: 'Air Quality', score: 6 },
        ],
      },
      impact: {
        overall: 9,
        subcategories: [
          { name: 'Economic Growth', score: 9 },
          { name: 'Quality of Life', score: 9 },
        ],
      },
    },
    community_metrics: {
      userSatisfaction: { overall: 7.8, responsesCount: 1247 },
      activeProjects: 34,
      communityEngagement: { totalUsers: 8920, activeContributors: 156 },
    },
    financial_overview_csv: 'milano-financial-overview.csv',
  },
  {
    name: 'Zona 1',
    language: 'it-IT',
    description: 'Municipio 1 - Centro Storico di Milano',
    type: 'district',
    population: 100000,
    score_innovation: 8,
    score_sustainability: 7,
    score_impact: 9,
  },
  {
    name: 'Regione Lombardia',
    language: 'it-IT',
    description: 'The regional government of Lombardy',
    type: 'region',
    population: 10000000,
    score_innovation: 7,
    score_sustainability: 6,
    score_impact: 8,
  },
]
