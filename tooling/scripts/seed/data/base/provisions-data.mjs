/**
 * Provisions - BASE dataset
 * Three provisions demonstrating different types
 */

export const provisions = [
  {
    entity: 'Comune di Milano',
    title: 'ATM Ownership Stake',
    descriptionShort: '100% ownership of ATM public transport company',
    description: 'The Comune di Milano holds 100% ownership of ATM (Azienda Trasporti Milanesi), the public transport company managing metro, tram, bus, and trolleybus services across Milan and surrounding municipalities.',
    summary_md: 'The Comune di Milano maintains complete ownership of ATM (Azienda Trasporti Milanesi S.p.A.), the public transport operator serving Milan and 95 surrounding municipalities. This 100% stake provides full control over all aspects of the public transportation network including metro lines, trams, buses, and trolleybuses. The ownership structure enables the municipality to directly influence strategic decisions on fare policies, service expansion, route planning, infrastructure investments, and operational standards. ATM serves as a critical public service provider, ensuring mobility for millions of residents and visitors while aligning transport policy with broader urban planning and sustainability goals.',
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
    descriptionShort: 'Congestion charge in Milan historic center',
    description: 'Daily access fee for entering Area C (historic center) during enforcement hours Monday-Friday 7:30-19:30. Exemptions apply to residents, electric vehicles, and specific categories.',
    summary_md: 'Area C is a congestion charging zone covering Milan\'s historic center, operational since January 2012. The system requires drivers to pay a €7.50 daily fee to access the zone during enforcement hours (Monday-Friday 7:30-19:30, excluding public holidays). The charge aims to reduce traffic congestion, improve air quality, and encourage use of public transportation. Exemptions include residents within Area C, motorcycles and scooters, fully electric and hydrogen vehicles, vehicles for disabled persons, emergency vehicles, and public transport. The system uses automatic license plate recognition cameras at 43 entry gates. Revenues fund sustainable mobility initiatives, public transport improvements, and road maintenance. In 2023, Area C generated approximately €85 million in revenue while contributing to a 30% reduction in vehicle traffic within the zone and measurable improvements in air quality indicators.',
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
    descriptionShort: 'Outdoor seating permits for restaurants',
    description: 'Municipal regulation governing outdoor seating areas (dehors) for restaurants and bars, including design standards, size limits, seasonal permissions, and accessibility requirements.',
    summary_md: `## Overview

Restaurants and bars must obtain permits from the Municipal Office for Public Space to place outdoor furniture (tables, chairs, planters) on public sidewalks and squares. The regulation balances commercial activity with pedestrian flow, accessibility, and urban aesthetics.

## Permit Requirements

### Application Process
- **Duration**: Permits valid for 1-3 years (renewable)
- **Fees**: Based on occupied surface area (€15-30 per m²/month)
- **Processing time**: 30-60 days for standard applications

### Design Standards
- Minimum 1.5m pedestrian clearance must be maintained
- Uniform furniture design required (matching tables, chairs)
- Removable structures only (no permanent installations)
- Materials must meet safety and durability standards

### Key Restrictions
- **Operating hours**: Outdoor seating allowed 7:00-24:00 daily
- **Noise limits**: Amplified music prohibited after 22:00
- **Accessibility**: Cannot obstruct building entrances, bus stops, or accessible routes
- **Seasonal**: Some permits restricted to warm months (April-October)

## Benefits

Approved permits enable businesses to:
- Extend seating capacity by up to 50%
- Create attractive outdoor dining experiences
- Contribute to vibrant street life and urban vitality
- Increase revenue during peak seasons

## Enforcement

The Municipal Police conduct regular inspections. Violations may result in permit suspension, fines, or mandatory removal of structures.`,
    type: 'regulation',
    status: 'active',
    relevance: 6,
    extraData: {
      type: 'regulation',
      regulationType: 'permit_system',
      domain: 'public_space',
    },
  },
]
