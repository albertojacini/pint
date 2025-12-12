/**
 * Provisions - BASE dataset
 * Three provisions demonstrating different types
 */

export const provisions = [
  {
    entity: 'Comune di Milano',
    title: 'ATM Ownership Stake',
    description: 'The Comune di Milano holds 100% ownership of ATM (Azienda Trasporti Milanesi), the public transport company.',
    descriptionShort: '100% ownership of ATM public transport company',
    type: 'ownership',
    status: 'active',
    relevance: 8,
    extraData: {
      type: 'ownership',
      assetCategory: 'equity',
      assetName: 'ATM - Azienda Trasporti Milanesi S.p.A.',
      ownershipPercentage: 100,
      purpose: 'public_service',
    },
  },
  {
    entity: 'Comune di Milano',
    title: 'Area C Congestion Charge',
    description: 'Daily access fee for entering Area C (historic center) during enforcement hours Monday-Friday 7:30-19:30.',
    descriptionShort: 'Congestion charge in Milan historic center',
    avatarUrl: './assets/avatars/provisions/area-c-congestion-charge.webp',
    type: 'taxation',
    status: 'active',
    relevance: 10,
    idea: 'Urban congestion charge',
    extraData: {
      type: 'taxation',
      taxType: 'fee',
      rateDescription: 'EUR 7.50 daily access fee per non-exempt vehicle',
      dataYear: '2023',
      taxRevenue: 85000000,
      progressivity: 'regressive',
    },
  },
  {
    entity: 'Comune di Milano',
    title: 'Public Space Occupation Permits (Dehors)',
    description: 'Municipal regulation governing outdoor seating areas for restaurants and bars.',
    descriptionShort: 'Outdoor seating permits for restaurants',
    type: 'regulation',
    status: 'active',
    relevance: 6,
    extraData: {
      type: 'regulation',
      regulationType: 'permit_system',
      domain: 'public_space',
      summary_md: `Businesses must obtain a permit to place outdoor furniture (tables, chairs, planters) on public sidewalks and squares. Permits are granted based on available space, pedestrian flow requirements, and aesthetic compatibility with the urban context.`,
      summary_detailed_md: `## Permit Requirements

Restaurants and bars wishing to occupy public space with outdoor seating areas (**dehors**) must submit an application to the Municipal Office for Public Space.

### Application Process
- **Duration**: Permits are valid for 1-3 years
- **Fees**: Based on occupied surface area (€15-30 per m²/month)
- **Requirements**:
  - Minimum 1.5m pedestrian clearance
  - Uniform furniture design
  - Removable structures only

### Key Restrictions
- **Timing**: Outdoor seating allowed 7:00-24:00 daily
- **Noise**: Amplified music prohibited after 22:00
- **Accessibility**: Must not obstruct building entrances or bus stops

### Benefits
Approved permits allow businesses to:
- Extend seating capacity by up to 50%
- Create attractive outdoor dining experiences
- Contribute to vibrant street life`,
    },
  },
]
