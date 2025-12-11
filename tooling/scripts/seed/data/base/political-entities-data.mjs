/**
 * Political entities - BASE dataset
 * Minimal set: 1 city for understanding schema
 */

export const politicalEntities = [
  {
    name: 'Comune di Milano',
    description: 'The city council of Milan',
    avatar_url: './assets/avatars/entities/comune-di-milano.webp',
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
  },
]
