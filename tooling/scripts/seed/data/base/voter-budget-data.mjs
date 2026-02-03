/**
 * Voter Budget Game - BASE dataset
 * Items, sessions, and votes for the Voter Budget game
 */

export const voterBudgetItems = [
  // ===== IDEAS (proposals for new things) =====
  {
    entity: 'Comune di Milano',
    dimension: 'ideas',
    text: 'More bike lanes connecting neighborhoods',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'ideas',
    text: 'Free public WiFi in all parks',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'ideas',
    text: '24-hour metro service on weekends',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'ideas',
    text: 'Community gardens in every district',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'ideas',
    text: 'Electric scooter sharing program',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'ideas',
    text: 'More public drinking fountains',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'ideas',
    text: 'Free coding bootcamps for youth',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'ideas',
    text: 'Night buses to the suburbs',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'ideas',
    text: 'Public outdoor gyms in parks',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'ideas',
    text: 'Solar panels on all public buildings',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'ideas',
    text: 'More pedestrian-only streets',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'ideas',
    text: 'City app for reporting issues',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'ideas',
    text: 'Subsidized electric vehicle charging',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'ideas',
    text: 'Public art installations in metro stations',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'ideas',
    text: 'Dog parks in every neighborhood',
  },

  // ===== LIKES (things people appreciate) =====
  {
    entity: 'Comune di Milano',
    dimension: 'likes',
    text: 'Efficient metro system',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'likes',
    text: 'Abundant green spaces and parks',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'likes',
    text: 'Strong cultural scene and museums',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'likes',
    text: 'Historic architecture preservation',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'likes',
    text: 'Good public library system',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'likes',
    text: 'Bike sharing program (BikeMi)',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'likes',
    text: 'Vibrant food and restaurant scene',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'likes',
    text: 'University and research institutions',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'likes',
    text: 'Public sports facilities',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'likes',
    text: 'Navigli canal district',
  },

  // ===== DISLIKES (things people want improved) =====
  {
    entity: 'Comune di Milano',
    dimension: 'dislikes',
    text: 'Air pollution levels',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'dislikes',
    text: 'High cost of housing',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'dislikes',
    text: 'Traffic congestion',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'dislikes',
    text: 'Limited parking availability',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'dislikes',
    text: 'Noise pollution in city center',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'dislikes',
    text: 'Metro overcrowding at rush hour',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'dislikes',
    text: 'Insufficient green spaces in periphery',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'dislikes',
    text: 'Poor pedestrian crossings',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'dislikes',
    text: 'Lack of nighttime public transport',
  },
  {
    entity: 'Comune di Milano',
    dimension: 'dislikes',
    text: 'Street cleanliness in some areas',
  },
]

// Completed sessions with votes (to populate stats)
export const voterBudgetSessions = [
  { entity: 'Comune di Milano', anonymousId: 'anon-seed-001', status: 'completed' },
  { entity: 'Comune di Milano', anonymousId: 'anon-seed-002', status: 'completed' },
  { entity: 'Comune di Milano', anonymousId: 'anon-seed-003', status: 'completed' },
  { entity: 'Comune di Milano', anonymousId: 'anon-seed-004', status: 'completed' },
  { entity: 'Comune di Milano', anonymousId: 'anon-seed-005', status: 'completed' },
  { entity: 'Comune di Milano', anonymousId: 'anon-seed-006', status: 'completed' },
  { entity: 'Comune di Milano', anonymousId: 'anon-seed-007', status: 'completed' },
  { entity: 'Comune di Milano', anonymousId: 'anon-seed-008', status: 'completed' },
  { entity: 'Comune di Milano', anonymousId: 'anon-seed-009', status: 'completed' },
  { entity: 'Comune di Milano', anonymousId: 'anon-seed-010', status: 'completed' },
  { entity: 'Comune di Milano', anonymousId: 'anon-seed-011', status: 'completed' },
  { entity: 'Comune di Milano', anonymousId: 'anon-seed-012', status: 'completed' },
]

// Votes linking sessions to items with amounts
// Each vote has: session (by anonymousId), itemText, amount (5-100)
export const voterBudgetVotes = [
  // Session 1 - Focus on transport and environment
  { session: 'anon-seed-001', itemText: 'More bike lanes connecting neighborhoods', amount: 35 },
  { session: 'anon-seed-001', itemText: 'Efficient metro system', amount: 25 },
  { session: 'anon-seed-001', itemText: 'Air pollution levels', amount: 40 },

  // Session 2 - Green and tech focus
  { session: 'anon-seed-002', itemText: 'Community gardens in every district', amount: 30 },
  { session: 'anon-seed-002', itemText: 'Free public WiFi in all parks', amount: 25 },
  { session: 'anon-seed-002', itemText: 'Solar panels on all public buildings', amount: 45 },

  // Session 3 - Urban mobility
  { session: 'anon-seed-003', itemText: '24-hour metro service on weekends', amount: 50 },
  { session: 'anon-seed-003', itemText: 'Night buses to the suburbs', amount: 30 },
  { session: 'anon-seed-003', itemText: 'Metro overcrowding at rush hour', amount: 20 },

  // Session 4 - Quality of life
  { session: 'anon-seed-004', itemText: 'More pedestrian-only streets', amount: 35 },
  { session: 'anon-seed-004', itemText: 'Abundant green spaces and parks', amount: 25 },
  { session: 'anon-seed-004', itemText: 'Noise pollution in city center', amount: 40 },

  // Session 5 - Tech and youth
  { session: 'anon-seed-005', itemText: 'Free coding bootcamps for youth', amount: 40 },
  { session: 'anon-seed-005', itemText: 'City app for reporting issues', amount: 35 },
  { session: 'anon-seed-005', itemText: 'University and research institutions', amount: 25 },

  // Session 6 - Transport enthusiast
  { session: 'anon-seed-006', itemText: 'More bike lanes connecting neighborhoods', amount: 40 },
  { session: 'anon-seed-006', itemText: 'Bike sharing program (BikeMi)', amount: 30 },
  { session: 'anon-seed-006', itemText: 'Traffic congestion', amount: 30 },

  // Session 7 - Environment focused
  { session: 'anon-seed-007', itemText: 'Solar panels on all public buildings', amount: 35 },
  { session: 'anon-seed-007', itemText: 'Air pollution levels', amount: 45 },
  { session: 'anon-seed-007', itemText: 'Subsidized electric vehicle charging', amount: 20 },

  // Session 8 - Culture and recreation
  { session: 'anon-seed-008', itemText: 'Public art installations in metro stations', amount: 30 },
  { session: 'anon-seed-008', itemText: 'Strong cultural scene and museums', amount: 35 },
  { session: 'anon-seed-008', itemText: 'Public outdoor gyms in parks', amount: 35 },

  // Session 9 - Pet owner
  { session: 'anon-seed-009', itemText: 'Dog parks in every neighborhood', amount: 45 },
  { session: 'anon-seed-009', itemText: 'More public drinking fountains', amount: 25 },
  { session: 'anon-seed-009', itemText: 'Street cleanliness in some areas', amount: 30 },

  // Session 10 - Housing concerned
  { session: 'anon-seed-010', itemText: 'High cost of housing', amount: 50 },
  { session: 'anon-seed-010', itemText: 'Community gardens in every district', amount: 25 },
  { session: 'anon-seed-010', itemText: 'Insufficient green spaces in periphery', amount: 25 },

  // Session 11 - Night owl
  { session: 'anon-seed-011', itemText: '24-hour metro service on weekends', amount: 40 },
  { session: 'anon-seed-011', itemText: 'Night buses to the suburbs', amount: 35 },
  { session: 'anon-seed-011', itemText: 'Lack of nighttime public transport', amount: 25 },

  // Session 12 - All-rounder
  { session: 'anon-seed-012', itemText: 'More bike lanes connecting neighborhoods', amount: 20 },
  { session: 'anon-seed-012', itemText: 'Efficient metro system', amount: 20 },
  { session: 'anon-seed-012', itemText: 'Air pollution levels', amount: 20 },
  { session: 'anon-seed-012', itemText: 'Navigli canal district', amount: 20 },
  { session: 'anon-seed-012', itemText: 'Traffic congestion', amount: 20 },
]
