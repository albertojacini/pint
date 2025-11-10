/**
 * Provisions data
 * Institutional/legal/operational infrastructure owned by entities
 * Includes laws, institutions, utilities, regulations
 */

export const provisions = [
  // ============================================================================
  // LEGAL & REGULATORY
  // ============================================================================

  // Regulations
  {
    entity: "Comune di Milano",
    title: "Regolamento Edilizio di Milano",
    description: "Building regulations covering energy efficiency, renewable energy, water consumption, and eco-sustainability",
    type: "regulation",
    status: "active",
    effectiveFrom: "2014-11-26",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "Regolamento di Polizia Urbana",
    description: "Urban police regulations governing public space, urban decorum, environmental protection",
    type: "regulation",
    status: "active",
    effectiveFrom: "1920-05-31",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "Regolamento della Qualità dell'Aria 2021",
    description: "Air quality regulation establishing emission standards and restrictions",
    type: "regulation",
    status: "active",
    effectiveFrom: "2021-01-01",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "Regolamento per l'Applicazione del Canone COSAP",
    description: "Regulation for public space occupation fees and permits",
    type: "regulation",
    status: "active",
    effectiveFrom: "2020-01-01",
    effectiveUntil: null,
  },

  // Ordinances
  {
    entity: "Comune di Milano",
    title: "Ordinanza Area B e Area C n. 273918",
    description: "Traffic restriction modifications postponing vehicle bans and extending access periods",
    type: "ordinance",
    status: "active",
    effectiveFrom: "2024-05-15",
    effectiveUntil: null,
  },

  // Standards
  {
    entity: "Comune di Milano",
    title: "Obbligo Sensori Angolo Cieco Veicoli Pesanti",
    description: "Requirement for blind spot sensors on heavy vehicles (N3, N2, M2 categories)",
    type: "standard",
    status: "active",
    effectiveFrom: "2023-10-01",
    effectiveUntil: null,
  },

  // ============================================================================
  // INSTITUTIONAL & SERVICES
  // ============================================================================

  // Utilities
  {
    entity: "Comune di Milano",
    title: "ATM - Azienda Trasporti Milanesi",
    description: "Municipal public transport company operating metro, tram, trolleybus, and bus services across Milan and 95 Lombardy municipalities",
    type: "utility",
    status: "active",
    effectiveFrom: "1931-01-01",
    effectiveUntil: null,
    idea: "Public transit"
  },
  {
    entity: "Comune di Milano",
    title: "AMSA - Azienda Milanese Servizi Ambientali",
    description: "Urban waste collection and disposal service for Milan and 14 metropolitan municipalities",
    type: "utility",
    status: "active",
    effectiveFrom: "1907-01-01",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "MM - Metropolitana Milanese",
    description: "Metro line infrastructure management and water services utility",
    type: "utility",
    status: "active",
    effectiveFrom: "1955-01-01",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "A2A",
    description: "Multi-utility providing energy, district heating, waste management, and environmental services",
    type: "utility",
    status: "active",
    effectiveFrom: "2008-01-01",
    effectiveUntil: null,
  },

  // Institutions
  {
    entity: "Comune di Milano",
    title: "Biblioteca Sormani",
    description: "Central municipal library heading network of 24 municipal libraries across Milan",
    type: "institution",
    status: "active",
    effectiveFrom: "1956-03-10",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "Museo del Novecento",
    description: "Municipal museum dedicated to 20th century art, part of civic museums network",
    type: "institution",
    status: "active",
    effectiveFrom: "2010-12-06",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "Castello Sforzesco Museums",
    description: "Medieval fortification housing municipal museums including Museum of Ancient Art and Pinacoteca",
    type: "institution",
    status: "active",
    effectiveFrom: "1900-01-01",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "Triennale Milano",
    description: "Design and architecture museum and cultural institution in Parco Sempione",
    type: "institution",
    status: "active",
    effectiveFrom: "1933-01-01",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "Palazzo Reale",
    description: "Historic palace serving as major exhibition venue and cultural institution",
    type: "institution",
    status: "active",
    effectiveFrom: "1920-01-01",
    effectiveUntil: null,
  },

  // Agencies
  {
    entity: "Comune di Milano",
    title: "AMAT - Agenzia Mobilità Ambiente e Territorio",
    description: "Agency specializing in mobility, urban design, and climate in urban developments",
    type: "agency",
    status: "active",
    effectiveFrom: "2000-01-01",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "Milano Abitare",
    description: "Agency managing housing policies and rental support programs",
    type: "agency",
    status: "active",
    effectiveFrom: "2015-01-01",
    effectiveUntil: null,
  },

  // Programs
  {
    entity: "Comune di Milano",
    title: "Strade Aperte",
    description: "Open Roads program promoting cycling and pedestrian infrastructure, sustainable mobility strategies",
    type: "program",
    status: "active",
    effectiveFrom: "2020-04-01",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "ForestaMi",
    description: "Tree planting program aiming to plant 3 million trees in Metropolitan City by 2030",
    type: "program",
    status: "active",
    effectiveFrom: "2019-01-01",
    effectiveUntil: "2030-12-31",
  },
  {
    entity: "Comune di Milano",
    title: "Città a 15 Minuti",
    description: "15-minute city urban development program funded by PN METRO Plus 2021-2027",
    type: "program",
    status: "active",
    effectiveFrom: "2021-01-01",
    effectiveUntil: "2027-12-31",
  },
  {
    entity: "Comune di Milano",
    title: "Sezioni Didattiche Museali",
    description: "Educational programs for schools across municipal museums network",
    type: "program",
    status: "active",
    effectiveFrom: "2010-01-01",
    effectiveUntil: null,
  },

  // Funds
  {
    entity: "Comune di Milano",
    title: "Contributi Festival e Rassegne 2023-2025",
    description: "Economic contributions for cultural festivals and reviews",
    type: "fund",
    status: "active",
    effectiveFrom: "2023-01-01",
    effectiveUntil: "2025-12-31",
  },
  {
    entity: "Comune di Milano",
    title: "Fondo Imprese Distretti Urbani del Commercio",
    description: "Support fund for micro, small, and medium enterprises in commercial districts (up to €3,000)",
    type: "fund",
    status: "active",
    effectiveFrom: "2024-01-01",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "Fondo Investimenti a Impatto Sociale",
    description: "Social impact investment fund for enterprises (up to €75,000)",
    type: "fund",
    status: "active",
    effectiveFrom: "2024-01-01",
    effectiveUntil: null,
  },

  // ============================================================================
  // PLANNING
  // ============================================================================

  // Plans
  {
    entity: "Comune di Milano",
    title: "PGT - Piano di Governo del Territorio 2030",
    description: "Municipal urban planning instrument defining layout of entire municipal territory, focusing on services, transit, green areas, sustainability",
    type: "plan",
    status: "active",
    effectiveFrom: "2020-02-05",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "PUMS - Piano Urbano della Mobilità Sostenibile",
    description: "10-year sustainable urban mobility plan with strategies and guidelines for city mobility",
    type: "plan",
    status: "active",
    effectiveFrom: "2018-11-12",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "PGTU - Piano Generale del Traffico Urbano",
    description: "General urban traffic plan coordinating traffic flow and management",
    type: "plan",
    status: "active",
    effectiveFrom: "2013-01-01",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "Piano Aria e Clima",
    description: "Air and climate plan integrating mobility and environmental actions",
    type: "plan",
    status: "active",
    effectiveFrom: "2022-01-01",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "Piano Verde - Visione del Verde",
    description: "Urban green and forestry strategies including parks, orbital forests, green corridors",
    type: "plan",
    status: "active",
    effectiveFrom: "2020-01-01",
    effectiveUntil: null,
  },

  // Zones
  {
    entity: "Comune di Milano",
    title: "Area C",
    description: "Limited traffic zone in historic center (Cerchia dei Bastioni) with paid access, active weekdays 7:30-19:30",
    type: "zone",
    status: "active",
    effectiveFrom: "2012-01-16",
    effectiveUntil: null,
    idea: "Congestion pricing"
  },
  {
    entity: "Comune di Milano",
    title: "Area B",
    description: "Environmental limited traffic zone covering ~75% of municipal territory, restricting polluting vehicles weekdays 7:30-19:30",
    type: "zone",
    status: "active",
    effectiveFrom: "2019-02-25",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "ZTL Navigli",
    description: "Limited traffic zone in Navigli district, active daily 20:00-7:00",
    type: "zone",
    status: "active",
    effectiveFrom: "2010-01-01",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "ZTL Garibaldi",
    description: "24/7 limited traffic zone in Garibaldi neighborhood",
    type: "zone",
    status: "active",
    effectiveFrom: "2015-01-01",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "Isola Pedonale Sarpi",
    description: "Pedestrian island on Via Paolo Sarpi and adjacent streets",
    type: "zone",
    status: "active",
    effectiveFrom: "2014-05-19",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "Zone 30",
    description: "Speed-limited zones (30 km/h) with traffic calming measures throughout city",
    type: "zone",
    status: "active",
    effectiveFrom: "2020-01-01",
    effectiveUntil: null,
    idea: "Introduce urban speed limits"
  },

  // Projects
  {
    entity: "Comune di Milano",
    title: "Prolungamento Metropolitane",
    description: "Metro line extensions project (M4, M5 extensions)",
    type: "project",
    status: "active",
    effectiveFrom: "2022-01-01",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "BEIC - Biblioteca Europea di Informazione e Cultura",
    description: "New European Library of Information and Culture construction project",
    type: "project",
    status: "active",
    effectiveFrom: "2023-01-01",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "Espansione Museo del Novecento",
    description: "Expansion project for Museum of 20th Century",
    type: "project",
    status: "active",
    effectiveFrom: "2023-01-01",
    effectiveUntil: null,
  },

  // Guidelines
  {
    entity: "Comune di Milano",
    title: "Linee di Indirizzo Attività Amministrative Urbanistica ed Edilizia",
    description: "Guidelines for administrative activities in urban planning and construction",
    type: "guideline",
    status: "active",
    effectiveFrom: "2024-02-23",
    effectiveUntil: null,
  },

  // ============================================================================
  // FISCAL
  // ============================================================================

  // Taxes
  {
    entity: "Comune di Milano",
    title: "IMU - Imposta Municipale Unica",
    description: "Municipal property tax with various rates and exemptions",
    type: "tax",
    status: "active",
    effectiveFrom: "2012-01-01",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "TARI - Tassa sui Rifiuti",
    description: "Waste tax paid in two semi-annual installments, with discounts for under-30s",
    type: "tax",
    status: "active",
    effectiveFrom: "2014-01-01",
    effectiveUntil: null,
  },

  // Fees and Tariffs
  {
    entity: "Comune di Milano",
    title: "COSAP Permanente",
    description: "Permanent public space occupation fee (€75-€5,850 per sqm/year)",
    type: "fee",
    status: "active",
    effectiveFrom: "2020-01-01",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "COSAP Temporaneo",
    description: "Temporary public space occupation fee (€3.72-€82.66 per sqm/day)",
    type: "fee",
    status: "active",
    effectiveFrom: "2020-01-01",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "Tariffa Parcheggio Strisce Blu - Area Bastioni",
    description: "Blue line parking tariff in Bastioni area (€3-€4.50/hour)",
    type: "tariff",
    status: "active",
    effectiveFrom: "2023-11-01",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "Tariffa Parcheggio Strisce Blu - Zona Filoviaria",
    description: "Blue line parking tariff inside trolleybus circle (€2/hour, weekdays only)",
    type: "tariff",
    status: "active",
    effectiveFrom: "2020-01-01",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "Tariffa Bus Turistici",
    description: "Tourist bus parking tariff (€8/hour)",
    type: "tariff",
    status: "active",
    effectiveFrom: "2018-01-01",
    effectiveUntil: null,
  },

  // Subsidies
  {
    entity: "Comune di Milano",
    title: "Misura Unica - Contributo Affitto Giovani Lavoratori",
    description: "One-time rental payment for young workers in first job (max €2,400)",
    type: "subsidy",
    status: "active",
    effectiveFrom: "2025-01-01",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "Contributo Superaffitto",
    description: "Annual rental support for under-35s and families (up to €2,000/year for 5 years)",
    type: "subsidy",
    status: "active",
    effectiveFrom: "2024-01-01",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "Sconto TARI Under 30",
    description: "25% TARI discount for under-30s in properties <100 sqm",
    type: "subsidy",
    status: "active",
    effectiveFrom: "2024-01-01",
    effectiveUntil: null,
  },

  // Budget
  {
    entity: "Comune di Milano",
    title: "Bilancio Comunale 2024-2026",
    description: "Municipal budget with €1.3B capital spending, priorities on transit, social policies, culture",
    type: "budget",
    status: "active",
    effectiveFrom: "2024-01-01",
    effectiveUntil: "2026-12-31",
  },

  // ============================================================================
  // ADMINISTRATIVE
  // ============================================================================

  // Procedures
  {
    entity: "Comune di Milano",
    title: "Procedura Occupazione Suolo Pubblico",
    description: "Procedure for temporary and permanent public space occupation permits",
    type: "procedure",
    status: "active",
    effectiveFrom: "2020-01-01",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "Procedura Autorizzazione Ponteggi",
    description: "Scaffolding authorization procedure",
    type: "procedure",
    status: "active",
    effectiveFrom: "2015-01-01",
    effectiveUntil: null,
  },

  // Agreements
  {
    entity: "Comune di Milano",
    title: "Convenzione Fondazione Scuole Civiche di Milano",
    description: "Management and control agreement with municipal foundation for civic schools",
    type: "agreement",
    status: "active",
    effectiveFrom: "2010-01-01",
    effectiveUntil: null,
  },

  // Protocols
  {
    entity: "Comune di Milano",
    title: "Protocollo Gruppo di Lavoro Consultivo Edilizia",
    description: "Consultative working group protocol for construction procedure managers",
    type: "protocol",
    status: "active",
    effectiveFrom: "2024-03-13",
    effectiveUntil: null,
  },

  // Policies
  {
    entity: "Comune di Milano",
    title: "Politica Accessibilità Biblioteche",
    description: "Extended evening opening hours policy for Sormani library and municipal libraries",
    type: "policy",
    status: "active",
    effectiveFrom: "2024-09-01",
    effectiveUntil: null,
  },
  {
    entity: "Comune di Milano",
    title: "Politica Parcheggio Residenti",
    description: "Resident parking protection interventions and policies",
    type: "policy",
    status: "active",
    effectiveFrom: "2024-01-01",
    effectiveUntil: null,
  },
]