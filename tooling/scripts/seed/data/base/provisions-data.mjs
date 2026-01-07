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
    types: ['ownership'],
    status: 'active',
    relevance: 8,
    displayData: {
      items: [
        { label: 'Ownership', value: '100%' },
        { label: 'Asset Type', value: 'Public Transport' },
        { label: 'Service Area', value: '96 Municipalities' },
      ],
    },
    displayChanges: {
      items: [
        { timestamp: '2003-01-15T09:00:00Z', changeType: 'create', label: '100% stake acquired by City of Milan' },
        { timestamp: '2015-03-20T14:30:00Z', changeType: 'update', label: 'Metro Line 5 expansion approved' },
        { timestamp: '2020-09-10T11:00:00Z', changeType: 'update', label: 'New electric bus fleet contract signed' },
        { timestamp: '2023-06-05T16:00:00Z', changeType: 'update', label: 'Metro Line 4 operational expansion' },
        { timestamp: '2025-03-15T10:00:00Z', changeType: 'update', label: 'New fare structure for seniors implemented' },
        { timestamp: '2025-08-20T14:00:00Z', changeType: 'update', label: 'Night bus service expansion approved' },
        { timestamp: '2025-11-10T09:00:00Z', changeType: 'update', label: 'Digital ticketing system upgrade' },
      ],
    },
  },
  {
    entity: 'Comune di Milano',
    title: 'Area C Congestion Charge',
    descriptionShort: 'Congestion charge in Milan historic center',
    description: 'Daily access fee for entering Area C (historic center) during enforcement hours Monday-Friday 7:30-19:30. Exemptions apply to residents, electric vehicles, and specific categories.',
    summary_md: 'Area C is a congestion charging zone covering Milan\'s historic center, operational since January 2012. The system requires drivers to pay a €7.50 daily fee to access the zone during enforcement hours (Monday-Friday 7:30-19:30, excluding public holidays). The charge aims to reduce traffic congestion, improve air quality, and encourage use of public transportation. Exemptions include residents within Area C, motorcycles and scooters, fully electric and hydrogen vehicles, vehicles for disabled persons, emergency vehicles, and public transport. The system uses automatic license plate recognition cameras at 43 entry gates. Revenues fund sustainable mobility initiatives, public transport improvements, and road maintenance. In 2023, Area C generated approximately €85 million in revenue while contributing to a 30% reduction in vehicle traffic within the zone and measurable improvements in air quality indicators.',
    avatarUrl: './assets/avatars/provisions/area-c-congestion-charge.webp',
    types: ['taxation'],
    status: 'active',
    relevance: 10,
    idea: 'Urban congestion charge',
    displayData: {
      items: [
        { label: 'Daily Fee', value: '€7.50' },
        { label: 'Annual Revenue', value: '€85M' },
        { label: 'Operational Since', value: '2012' },
        { label: 'Traffic Reduction', value: '30%' },
      ],
    },
    displayChanges: {
      items: [
        { timestamp: '2012-01-16T00:00:00Z', changeType: 'create', label: 'Area C congestion charge launched' },
        { timestamp: '2020-03-08T00:00:00Z', changeType: 'deactivate', label: 'Suspended due to COVID-19' },
        { timestamp: '2021-06-14T00:00:00Z', changeType: 'activate', label: 'Reactivated post-COVID' },
        { timestamp: '2023-06-15T00:00:00Z', changeType: 'update', label: 'EV exemptions extended to 2030' },
        { timestamp: '2025-02-10T00:00:00Z', changeType: 'update', label: 'Fee increased to €8.00 for 2025' },
        { timestamp: '2025-05-22T00:00:00Z', changeType: 'update', label: 'Weekend enforcement hours extended' },
        { timestamp: '2025-09-05T00:00:00Z', changeType: 'update', label: 'Additional entry gates activated' },
        { timestamp: '2025-12-01T00:00:00Z', changeType: 'update', label: 'Hybrid vehicle exemption removed' },
      ],
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
    types: ['regulation'],
    status: 'active',
    relevance: 6,
    displayData: {
      items: [
        { label: 'Permit Duration', value: '1-3 Years' },
        { label: 'Monthly Fee', value: '€15-30/m²' },
        { label: 'Minimum Clearance', value: '1.5m' },
      ],
    },
    displayChanges: {
      items: [
        { timestamp: '2020-04-20T00:00:00Z', changeType: 'update', label: 'Emergency expansion during COVID-19' },
        { timestamp: '2022-09-01T00:00:00Z', changeType: 'update', label: 'Design standards and clearance rules revised' },
        { timestamp: '2024-03-15T00:00:00Z', changeType: 'update', label: 'Permit renewal process simplified' },
        { timestamp: '2025-04-01T00:00:00Z', changeType: 'update', label: 'Seasonal permit fees adjusted for inflation' },
        { timestamp: '2025-07-15T00:00:00Z', changeType: 'update', label: 'New sustainability requirements for furniture materials' },
        { timestamp: '2025-10-20T00:00:00Z', changeType: 'update', label: 'Digital permit application system launched' },
      ],
    },
  },
]
