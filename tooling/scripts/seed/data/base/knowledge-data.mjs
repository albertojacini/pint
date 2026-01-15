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
