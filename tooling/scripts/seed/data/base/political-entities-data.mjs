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
    section_insights: {
      politics: 'Milano è governata da una **coalizione di centrosinistra** dal 2011. L\'attuale sindaco *Giuseppe Sala* è al secondo mandato (2021-2026), con una maggioranza solida in consiglio comunale di **32 seggi su 48**.',
      administration: 'L\'amministrazione gestisce oltre **160 provvedimenti attivi** che coprono mobilità, urbanistica, fiscalità locale e servizi sociali. Il focus principale del mandato è su *transizione ecologica* e *digitalizzazione dei servizi*.',
      financials: 'Il bilancio 2024 ha raggiunto **€7,2 miliardi** di entrate, in crescita del *+4,3%* rispetto al 2023. Le entrate tributarie rappresentano il 38% del totale. La città mantiene un avanzo di bilancio positivo dal 2015.',
      events: 'Nel 2024 Milano ha registrato oltre **85 eventi** normativi e istituzionali significativi, tra cui l\'approvazione del nuovo *PGT* e l\'aggiornamento delle tariffe di *Area C*.',
      performanceIndicators: 'Milano si conferma al **1° posto in Italia** per innovazione e attrattività economica (ICity Rank 2024). Punti critici: qualità dell\'aria (*PM10* ancora sopra i limiti UE) e costo della vita in crescita del *+8%* in 3 anni.',
      community: 'La community di Pint per Milano conta **8.920 utenti** registrati e *156 contributori attivi*. Il gradimento medio delle politiche cittadine è di **7,8/10** su 1.247 risposte raccolte.',
    },
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
