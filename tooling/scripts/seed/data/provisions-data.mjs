/**
 * Provisions data
 * Generated provisions for Comune di Milano
 */

export const provisions = [
  // ========================================
  // OWNERSHIP PROVISIONS
  // ========================================

  {
    entity: 'Comune di Milano',
    title: 'ATM Ownership Stake',
    description:
      'The Comune di Milano holds 100% ownership of ATM (Azienda Trasporti Milanesi), the public transport company managing metro, tram, bus, and trolleybus services in Milan and 95 surrounding municipalities. This allows complete control over public transportation policies, fares, service expansion, and infrastructure development.',
    descriptionShort: '100% ownership of ATM public transport company',
    type: 'ownership',
    status: 'active',
    significance: 10,
    extraData: {
      type: 'ownership',
      assetCategory: 'equity',
      assetName: 'ATM - Azienda Trasporti Milanesi S.p.A.',
      ownershipPercentage: 100,
      purpose: 'public_service',
      source_url:
        'https://www.comune.milano.it/aree-tematiche/finanza-e-partecipate/societa-ed-enti-partecipati',
      source_snippet: 'ATM is a public company owned by the Municipality of Milan',
    },
  },

  // ========================================
  // REGULATION PROVISIONS
  // ========================================

  {
    entity: 'Comune di Milano',
    title: 'Public Space Occupation Permits (Dehors)',
    description:
      'Municipal regulation governing outdoor seating areas (dehors) for restaurants and bars, including terrace design standards, size limitations, seasonal permissions, and aesthetic requirements. The Comune can modify permit criteria, adjust fees, change allowed seasons, and update design guidelines.',
    descriptionShort: 'Outdoor seating permits for restaurants and bars (dehors)',
    type: 'regulation',
    status: 'active',
    extraData: {
      type: 'regulation',
      regulationType: 'regulation',
      source_url: 'https://www.comune.milano.it/comune/regolamenti',
      source_snippet: "Regolamento per l'occupazione di spazi ed aree pubbliche",
    },
  },

  // ========================================
  // TAXATION PROVISIONS
  // ========================================

  {
    entity: 'Comune di Milano',
    title: 'Area C Congestion Charge',
    description:
      'Daily access fee for entering Area C (historic center) during enforcement hours Monday-Friday 7:30-19:30. The Comune can adjust the daily fee (currently €7.50), modify exemptions for residents and specific vehicle categories, change enforcement hours, update electric vehicle benefits, and set penalty amounts for violations.',
    descriptionShort:
      "Congestion charge attiva dal 2012 nel centro di Milano per scoraggiare l'utilizzo dei mezzi privati",
    avatarUrl: './assets/avatars/provisions/area-c-congestion-charge.webp',
    type: 'taxation',
    status: 'active',
    significance: 9,
    idea: 'Urban congestion charge',
    extraData: {
      type: 'taxation',
      taxType: 'fee',
      rateDescription: 'EUR 7.50 daily access fee per non-exempt vehicle',
      taxRevenueFiscalYear: '2023',
      taxRevenueAmount: 85000000, // €85M annually
      collectionCostAmount: 4200000, // €4.2M annually
      collectionCostYear: '2023',
      revenueGrowth: -2.5, // -2.5% YoY
      revenueGrowthPreviousYear: '2022',
      taxRevenueShare: 12.3, // 12.3% of all tax revenue
      progressivity: 'regressive',
    },
  },
]
