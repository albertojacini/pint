/**
 * Knowledge - BASE dataset
 * Artifacts demonstrating different knowledge types extracted from sources
 */

export const sourcePublishers = [
  {
    // Special fallback publisher for documents without a known publisher
    id: '00000000-0000-0000-0000-000000000000',
    name: 'Unknown Publisher',
    description: 'Fallback publisher for documents without a known source',
    publisher_type: 'other',
    reliability_score: 0.3,
    is_active: true,
  },
  {
    name: 'Comune di Milano',
    description: 'Official website of the Municipality of Milan',
    url: 'https://www.comune.milano.it',
    publisher_type: 'official',
    language: 'it-IT',
    reliability_score: 9.5,
    update_frequency: 'daily',
    access_method: 'scrape',
    is_active: true,
  },
  {
    name: 'Gazzetta Ufficiale',
    description: 'Official Gazette of the Italian Republic',
    url: 'https://www.gazzettaufficiale.it',
    publisher_type: 'gazette',
    language: 'it-IT',
    reliability_score: 10.0,
    update_frequency: 'daily',
    access_method: 'scrape',
    is_active: true,
  },
]

export const sourceDocuments = [
  {
    publisher: 'Comune di Milano',
    title: 'ATM Annual Report 2023',
    url: 'https://www.atm.it/it/AziendaGruppo/Bilancio/Documents/2023/ATM_Bilancio_2023.pdf',
    document_type: 'report',
    language: 'it-IT',
    published_at: '2024-03-15T00:00:00Z',
  },
  {
    publisher: 'Comune di Milano',
    title: 'ATM Service Statistics Q4 2023',
    url: 'https://www.atm.it/it/AziendaGruppo/Dati/Q4_2023.xlsx',
    document_type: 'report',
    language: 'it-IT',
    published_at: '2024-01-20T00:00:00Z',
  },
  {
    publisher: 'Gazzetta Ufficiale',
    title: 'Area C Regulation Amendment 2024',
    url: 'https://www.gazzettaufficiale.it/atto/serie_generale/caricaDettaglioAtto/originario?atto.dataPubblicazioneGazzetta=2024-02-15',
    document_type: 'legislation',
    language: 'it-IT',
    published_at: '2024-02-15T00:00:00Z',
  },
  {
    publisher: 'Comune di Milano',
    title: 'Area C Annual Report 2023',
    url: 'https://www.comune.milano.it/documents/area-c-report-2023.pdf',
    document_type: 'report',
    language: 'it-IT',
    published_at: '2024-02-01T00:00:00Z',
  },
]

export const artifacts = [
  {
    title: 'ATM Ridership Trends 2020-2023',
    description: 'Historical ridership data showing passenger volume trends across metro, tram, and bus services',
    artifact_type: 'time_series',
    content: `date,metro,tram,bus,total
2020-01-01,350000,180000,420000,950000
2020-04-01,120000,65000,150000,335000
2020-07-01,280000,140000,320000,740000
2020-10-01,310000,160000,370000,840000
2021-01-01,290000,150000,340000,780000
2021-04-01,320000,165000,380000,865000
2021-07-01,340000,175000,400000,915000
2021-10-01,360000,185000,425000,970000
2022-01-01,380000,190000,445000,1015000
2022-04-01,400000,200000,470000,1070000
2022-07-01,410000,205000,480000,1095000
2022-10-01,420000,210000,490000,1120000
2023-01-01,425000,212000,495000,1132000
2023-04-01,430000,215000,500000,1145000
2023-07-01,435000,218000,505000,1158000
2023-10-01,440000,220000,510000,1170000`,
    sourceDocuments: ['ATM Service Statistics Q4 2023'],
    provisions: ['ATM Ownership Stake'],
  },
  {
    title: 'ATM Revenue Breakdown 2023',
    description: 'Revenue distribution by service type and ticket category',
    artifact_type: 'breakdown',
    content: `category,revenue_euros,percentage
Metro Tickets,180500000,42.3
Tram Tickets,85000000,19.9
Bus Tickets,95000000,22.3
Subscriptions,52000000,12.2
Tourist Passes,14500000,3.4`,
    sourceDocuments: ['ATM Annual Report 2023'],
    provisions: ['ATM Ownership Stake'],
  },
  {
    title: 'ATM Operational Parameters',
    description: 'Key operational configuration parameters for ATM service delivery',
    artifact_type: 'parameters',
    content: `service_hours:
  metro_weekday: "06:00-00:30"
  metro_weekend: "06:00-01:30"
  tram_weekday: "05:30-00:00"
  bus_night_service: "00:00-06:00"

fleet_size:
  metro_trains: 147
  trams: 502
  buses: 1390
  trolleybuses: 78

network_extent:
  metro_lines: 5
  metro_stations: 113
  metro_km: 101
  tram_lines: 17
  bus_routes: 131
  service_area_sq_km: 1575

capacity:
  metro_daily_capacity: 1400000
  surface_daily_capacity: 1900000
  peak_hour_frequency_metro: "90-120 seconds"
  peak_hour_frequency_surface: "5-10 minutes"

fares:
  single_ticket: 2.20
  daily_pass: 7.60
  weekly_pass: 19.00
  monthly_pass: 39.00
  annual_pass: 330.00`,
    sourceDocuments: ['ATM Annual Report 2023'],
    provisions: ['ATM Ownership Stake'],
  },
  {
    title: 'Area C Traffic Impact Analysis',
    description: 'Comprehensive analysis of Area C congestion charge effects on traffic patterns, air quality, and public transport usage since implementation',
    artifact_type: 'narrative',
    content: `Since its introduction in January 2012, Area C has fundamentally transformed mobility patterns in Milan's historic center. The congestion charge has achieved its primary objectives of reducing vehicular traffic and improving environmental conditions while generating substantial revenue for sustainable mobility investments.

Traffic Reduction: Vehicle entries into Area C decreased by approximately 30% in the first year of operation, with sustained reductions maintained throughout subsequent years. Daily vehicle entries dropped from an average of 125,000 before implementation to 87,000 afterward. This reduction has been particularly pronounced during peak hours (7:30-9:30 and 17:00-19:00), when congestion was previously most severe.

Air Quality Improvements: Environmental monitoring stations within Area C have recorded measurable improvements in key pollutants. PM10 concentrations decreased by 18% and nitrogen dioxide (NO2) levels fell by 14% during the first three years. These improvements contribute to better respiratory health outcomes for residents and workers in the historic center.

Modal Shift: The charging scheme has accelerated the transition to more sustainable transport modes. Public transport usage in the area increased by 12%, with metro and tram services experiencing the highest growth. Bicycle traffic rose by 25%, supported by expanded cycling infrastructure. Electric and hybrid vehicle registrations in Milan increased by 340% between 2012 and 2023, partly driven by Area C exemptions for zero-emission vehicles.

Economic Impact: Local business associations initially expressed concerns about potential negative effects on commerce, but subsequent studies found no significant impact on retail activity. Tourist numbers remained stable, with improved air quality and reduced traffic potentially enhancing the visitor experience.

Revenue Allocation: Annual revenues of approximately €85 million are dedicated to sustainable mobility initiatives, including public transport improvements, cycling infrastructure, pedestrian zone enhancements, and road maintenance. In 2023, Area C funds contributed to 45 km of new bike lanes, 12 new electric bus purchases, and accessibility improvements at 28 metro and tram stations.

Compliance and Enforcement: The automated license plate recognition system maintains high compliance rates. In 2023, the system processed 28 million vehicle entries, with a violation rate of 3.2%. Fines for unauthorized access (€83-€333 depending on vehicle type and payment timing) provide additional enforcement deterrence.

Policy Evolution: The system has been refined over time based on operational experience. Initial exemptions were gradually reduced as electric vehicle adoption increased. The charge amount was adjusted from €5 (2012) to €7.50 (2024) to maintain effectiveness as economic conditions changed. Integration with Area B (a broader low-emission zone) created a comprehensive traffic management framework for the entire city.

Public Acceptance: Initial controversy has given way to broad public support. Surveys in 2023 showed 72% of Milan residents favor maintaining or expanding the charging zone, up from 51% in 2012. This acceptance reflects visible improvements in urban quality of life and successful communication about environmental and mobility benefits.

Replicability: Area C has become an international case study in urban congestion pricing. Cities including Madrid, Brussels, and Barcelona have studied Milan's implementation when designing their own schemes. The technical infrastructure, particularly the automated enforcement system, has proven reliable and cost-effective, with operational costs representing only 12% of gross revenue.`,
    sourceDocuments: ['Area C Annual Report 2023'],
    provisions: ['Area C Congestion Charge'],
  },
  {
    title: 'Area C Revenue Time Series',
    description: 'Annual revenue generated by Area C congestion charge from 2012 to 2023',
    artifact_type: 'time_series',
    content: `year,gross_revenue_eur,net_revenue_eur,entries_count,avg_daily_entries
2012,16200000,14200000,4350000,11900
2013,42000000,37000000,11200000,30700
2014,45500000,40000000,11800000,32300
2015,48000000,42200000,12100000,33100
2016,51000000,44800000,12400000,33900
2017,54000000,47500000,12700000,34800
2018,58000000,51000000,13100000,35900
2019,62000000,54500000,13500000,37000
2020,28000000,24600000,6800000,18600
2021,47000000,41300000,11000000,30100
2022,78000000,68600000,14200000,38900
2023,85000000,74800000,14800000,40500`,
    sourceDocuments: ['Area C Annual Report 2023', 'Area C Regulation Amendment 2024'],
    provisions: ['Area C Congestion Charge'],
  },
  {
    title: 'Area C Exemption Categories',
    description: 'Breakdown of vehicle entries by exemption category',
    artifact_type: 'breakdown',
    content: `category,annual_entries,percentage,description
Paid Access,10200000,68.9,Standard paid entries
Residents,2800000,18.9,Residents within Area C
Electric Vehicles,950000,6.4,Fully electric and hydrogen vehicles
Disabled Permits,420000,2.8,Vehicles with disability permits
Motorcycles,280000,1.9,Motorcycles and scooters (exempt)
Emergency Vehicles,85000,0.6,Police ambulances fire brigade
Public Transport,65000,0.4,Buses trams official transit vehicles`,
    sourceDocuments: ['Area C Annual Report 2023'],
    provisions: ['Area C Congestion Charge'],
  },
]

/**
 * Document chunks for semantic search testing
 * Each chunk has content and a seed for generating deterministic fake embeddings
 */
export const documentChunks = [
  // ATM Annual Report 2023 - 3 chunks
  {
    document: 'ATM Annual Report 2023',
    chunks: [
      {
        content: `ATM SpA Annual Report 2023 - Executive Summary

ATM, Milan's public transport company, delivered strong operational and financial performance in 2023. Total ridership reached 1.17 billion passengers, representing a full recovery to pre-pandemic levels. Revenue increased 8.3% year-over-year to €427 million, driven by higher ridership and fare adjustments.

Key achievements include the completion of Metro Line 4 extension to Linate Airport, adding 15 new stations to the network. The electric bus fleet expanded to 180 vehicles, with plans to reach 1,200 by 2030. Customer satisfaction scores improved to 7.8/10, the highest level in a decade.`,
        tokens: 112,
        seed: 1001,
      },
      {
        content: `Fleet and Infrastructure Investment

Capital expenditure totaled €892 million in 2023, focused on fleet renewal and infrastructure modernization. Major investments included:

- 45 new metro trains for Lines 1 and 2 (€320M)
- 180 electric buses replacing diesel vehicles (€95M)
- Station accessibility improvements at 28 locations (€45M)
- Digital ticketing system upgrade (€32M)
- Depot modernization and charging infrastructure (€78M)

The company secured €1.2 billion in EU Next Generation funding for the 2024-2026 investment program, supporting Milan's carbon neutrality goals.`,
        tokens: 98,
        seed: 1002,
      },
      {
        content: `Sustainability and Environmental Impact

ATM's sustainability initiatives achieved measurable results in 2023:

CO2 emissions reduced by 12% compared to 2022, reaching 145,000 tonnes. The transition to electric buses prevented 8,500 tonnes of emissions. Energy efficiency improvements in metro operations saved 15 GWh of electricity.

Solar panel installations on depot rooftops now generate 4.2 MW of renewable energy. Green bond issuance of €500M funded zero-emission vehicle procurement. ATM received ISO 14001 environmental certification renewal with zero non-conformities.`,
        tokens: 94,
        seed: 1003,
      },
    ],
  },
  // ATM Service Statistics Q4 2023 - 2 chunks
  {
    document: 'ATM Service Statistics Q4 2023',
    chunks: [
      {
        content: `Q4 2023 Ridership Statistics by Mode

Metro services carried 440 million passengers in Q4 2023, up 3.2% from Q4 2022. Line 1 (red) remained the busiest with 165 million trips. The new M4 line exceeded projections with 28 million passengers in its first full quarter of operation.

Surface network (tram and bus) transported 730 million passengers. Tram ridership showed particular strength at 220 million, benefiting from dedicated lane expansions. Night bus services saw 15% growth as entertainment district activity recovered.`,
        tokens: 91,
        seed: 2001,
      },
      {
        content: `Service Quality Metrics Q4 2023

Punctuality rates improved across all modes:
- Metro: 97.2% on-time performance (target: 95%)
- Tram: 89.4% on-time (target: 85%)
- Bus: 84.7% on-time (target: 82%)

Average vehicle occupancy during peak hours: Metro 78%, Tram 65%, Bus 58%. Customer complaints decreased 18% year-over-year. Mobile app ticket purchases grew to 42% of total transactions, up from 31% in 2022.`,
        tokens: 82,
        seed: 2002,
      },
    ],
  },
  // Area C Regulation Amendment 2024 - 2 chunks
  {
    document: 'Area C Regulation Amendment 2024',
    chunks: [
      {
        content: `Decreto del Comune di Milano - Modifica Regolamento Area C

Articolo 1 - Adeguamento Tariffa
A decorrere dal 1° marzo 2024, la tariffa di accesso ad Area C è fissata in €7,50 per veicolo/giorno, in aumento rispetto ai precedenti €5,00. L'adeguamento riflette l'inflazione cumulata dal 2019 e mira a mantenere l'efficacia deterrente della misura.

Articolo 2 - Esenzioni Veicoli Elettrici
Le esenzioni per veicoli a zero emissioni sono prorogate fino al 31 dicembre 2025. Dal 1° gennaio 2026, i veicoli elettrici corrisponderanno una tariffa ridotta di €3,00.`,
        tokens: 118,
        seed: 3001,
      },
      {
        content: `Articolo 3 - Orari di Applicazione
Gli orari di applicazione della tariffa restano invariati: dalle ore 7:30 alle ore 19:30, dal lunedì al venerdì, esclusi i giorni festivi. È introdotta una fascia serale sperimentale (19:30-22:00) con tariffa ridotta di €2,00 per i mesi di giugno-settembre 2024.

Articolo 4 - Destinazione Proventi
I proventi derivanti dall'adeguamento tariffario sono vincolati al finanziamento di:
a) Potenziamento trasporto pubblico locale (60%)
b) Infrastrutture ciclabili (25%)
c) Manutenzione stradale (15%)`,
        tokens: 108,
        seed: 3002,
      },
    ],
  },
  // Area C Annual Report 2023 - 3 chunks
  {
    document: 'Area C Annual Report 2023',
    chunks: [
      {
        content: `Area C Performance Report 2023 - Traffic and Revenue

The congestion charge zone processed 14.8 million vehicle entries in 2023, generating gross revenue of €85 million. Net revenue after operational costs reached €74.8 million, representing an operating margin of 88%.

Daily average entries stabilized at 40,500 vehicles, compared to 125,000 before Area C implementation in 2012. Peak hour traffic (8:00-9:00 and 17:30-18:30) decreased 35% versus pre-implementation levels. The automated enforcement system maintained 99.7% accuracy in license plate recognition.`,
        tokens: 96,
        seed: 4001,
      },
      {
        content: `Environmental Impact Assessment 2023

Air quality monitoring within Area C showed continued improvement:

PM10 annual average: 28 μg/m³ (limit: 40 μg/m³)
PM2.5 annual average: 18 μg/m³ (limit: 25 μg/m³)
NO2 annual average: 36 μg/m³ (limit: 40 μg/m³)

Compared to 2011 baseline, PM10 levels decreased 32% and NO2 decreased 28%. The zone recorded zero air quality exceedance days in 2023, down from 87 days in 2011. Health impact assessment estimates 120 fewer premature deaths annually attributable to improved air quality.`,
        tokens: 105,
        seed: 4002,
      },
      {
        content: `Modal Shift and Sustainable Mobility

Public transport mode share within Area C reached 58% in 2023, up from 42% in 2011. Cycling increased from 6% to 14% of trips. Private car usage decreased from 48% to 24%.

Bicycle infrastructure investments funded by Area C revenues added 45 km of protected bike lanes in 2023. The BikeMi sharing system recorded 8.2 million trips, a 22% increase. Electric vehicle registrations in Milan reached 45,000, with Area C exemptions cited as a key incentive by 67% of EV buyers surveyed.`,
        tokens: 98,
        seed: 4003,
      },
    ],
  },
]
