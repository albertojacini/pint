/**
 * Events data
 * Temporal occurrences that shape provisions (government activities, judicial decrees, etc.)
 */

export const events = [
  // ============================================================================
  // LEGISLATIVE & VOTING EVENTS
  // ============================================================================
  {
    administration: "Milan City Council 2021-2026",
    title: "Elezioni comunali Milano - Rielezione Sala",
    description: "Giuseppe Sala riconfermato sindaco di Milano con il 57,73% dei voti, la percentuale più alta mai raggiunta da un candidato sindaco eletto direttamente",
    type: "legislative_session",
    occurredAt: "2021-10-04T18:00:00Z"
  },
  {
    administration: "Milan City Council 2021-2026",
    title: "Approvazione ordine del giorno Città 30",
    description: "Il Consiglio Comunale approva ordine del giorno per proclamare Milano 'Città 30', con limite di velocità a 30 km/h in ambito urbano dal 2024, escluse solo strade di grande scorrimento",
    type: "legislative_session",
    occurredAt: "2023-01-09T20:00:00Z"
  },
  {
    administration: "Milan City Council 2021-2026",
    title: "Approvazione Bilancio di previsione 2022-2024",
    description: "Il Consiglio Comunale approva il bilancio di previsione triennale 2022-2024",
    type: "budget_approval",
    occurredAt: "2022-06-13T18:00:00Z"
  },
  {
    administration: "Milan City Council 2021-2026",
    title: "Approvazione Bilancio di previsione 2023-2025",
    description: "Bilancio approvato con 27 voti favorevoli e 14 contrari. Per la parte corrente, il bilancio si attesta per il 2023 a 3 miliardi e 594 milioni di euro, in aumento di 22 milioni rispetto al bilancio 2022",
    type: "budget_approval",
    occurredAt: "2023-03-28T19:00:00Z"
  },
  {
    administration: "Milan City Council 2021-2026",
    title: "Approvazione Bilancio consolidato 2023",
    description: "Il Consiglio Comunale approva il Bilancio consolidato per l'esercizio 2023. Il Gruppo Pubblica Amministrazione ha chiuso il 2023 con un risultato lordo di gestione positivo di 372 milioni di euro",
    type: "budget_approval",
    occurredAt: "2024-09-23T18:00:00Z"
  },
  {
    administration: "Milan City Council 2021-2026",
    title: "Discorso programmatico Sindaco Sala",
    description: "Il sindaco Sala presenta gli indirizzi di governo per il mandato 2021-2026: priorità su Olimpiadi 2026, gestione PNRR, sostenibilità ambientale e sociale, digitalizzazione",
    type: "legislative_session",
    occurredAt: "2021-10-21T16:00:00Z"
  },

  // ============================================================================
  // PLANNING & URBAN DEVELOPMENT
  // ============================================================================
  {
    administration: "Milan City Council 2021-2026",
    title: "Approvazione progetto definitivo BEIC",
    description: "Il Consiglio Comunale approva il progetto definitivo della Biblioteca Europea di Informazione e Cultura (BEIC) nell'area ex Scalo Porta Vittoria. Finanziamento totale: €130,7 milioni (€101M da PNRR)",
    type: "plan_adoption",
    occurredAt: "2023-05-15T17:00:00Z"
  },
  {
    administration: "Milan City Council 2021-2026",
    title: "Annuncio vincitore concorso internazionale BEIC",
    description: "Proclamato il progetto vincente del concorso internazionale per la nuova BEIC: team italiano guidato da Onsitestudio (Angelo Raffaele Lunati) insieme a Baukuh. 44 proposte presentate",
    type: "contract_award",
    occurredAt: "2022-07-11T11:00:00Z"
  },
  {
    administration: "Milan City Council 2021-2026",
    title: "Inizio cantiere Villaggio Olimpico Porta Romana",
    description: "Avvio lavori per il Villaggio Olimpico nel quartiere Santa Giulia (Porta Romana), che diventerà successivamente il più grande studentato d'Italia. Parte del progetto Olimpiadi 2026",
    type: "project_launch",
    occurredAt: "2023-03-20T10:00:00Z"
  },
  {
    administration: "Milan City Council 2021-2026",
    title: "Posa prima pietra PalaItalia Santa Giulia",
    description: "Cerimonia di posa della prima pietra della nuova arena PalaItalia a Santa Giulia, progettata da David Chipperfield per ospitare competizioni di hockey su ghiaccio maschile alle Olimpiadi 2026",
    type: "project_launch",
    occurredAt: "2023-06-15T11:00:00Z"
  },

  // ============================================================================
  // TRANSPORTATION & INFRASTRUCTURE
  // ============================================================================
  {
    administration: "Milan City Council 2021-2026",
    title: "Inaugurazione M4 tratta Linate-Dateo",
    description: "Apertura primo tratto della linea metropolitana M4 (blu) da aeroporto di Linate a Dateo, con 6 stazioni: Linate Aeroporto, Repetti, Forlanini, Argonne, Susa, Dateo",
    type: "service_change",
    occurredAt: "2022-11-26T10:00:00Z"
  },
  {
    administration: "Milan City Council 2021-2026",
    title: "Inaugurazione M4 tratta Dateo-San Babila",
    description: "Apertura tratta M4 Dateo-San Babila (1,6 km) con stazione Tricolore, permettendo collegamento diretto con M1. Percorrenza Linate-San Babila: 12 minuti",
    type: "service_change",
    occurredAt: "2023-07-04T09:00:00Z"
  },
  {
    administration: "Milan City Council 2021-2026",
    title: "Inaugurazione completa linea M4",
    description: "Apertura dell'intera linea M4 da San Cristoforo a Linate Aeroporto: 15 km, 21 stazioni, 40 treni bidirezionali senza conducente",
    type: "service_change",
    occurredAt: "2024-10-12T11:00:00Z"
  },

  // ============================================================================
  // ENVIRONMENTAL & MOBILITY REGULATIONS
  // ============================================================================
  {
    administration: "Milan City Council 2021-2026",
    title: "Aggiornamento regolamento Area B - divieti diesel Euro 5",
    description: "Modifica della disciplina di Area B con nuovi divieti per veicoli commerciali Euro 2 benzina e Euro 5 diesel, e veicoli a due tempi",
    type: "regulation_update",
    occurredAt: "2024-10-01T00:00:00Z"
  },
  {
    administration: "Milan City Council 2021-2026",
    title: "Rinvio divieto Area B per diesel Euro 6",
    description: "Delibera di posticipare al 30 settembre 2028 i divieti per veicoli diesel Euro 6 in Area B (originariamente previsti tra ottobre 2024 e ottobre 2027), considerando contesto economico e mercato automotive",
    type: "regulation_update",
    occurredAt: "2024-05-10T15:00:00Z"
  },

  // ============================================================================
  // ENVIRONMENTAL PROGRAMS
  // ============================================================================
  {
    administration: "Milan City Council 2021-2026",
    title: "Lancio Fondo ForestaMi",
    description: "Costituzione del fondo ForestaMi presso Fondazione di Comunità Milano Onlus per raccogliere contributi da aziende e cittadini. Obiettivo: piantare 3 milioni di alberi entro il 2030 (400.000 entro 2022, 2 milioni entro Olimpiadi 2026)",
    type: "funding_decision",
    occurredAt: "2021-06-15T12:00:00Z"
  },
  {
    administration: "Milan City Council 2021-2026",
    title: "Traguardo 300.000 alberi ForestaMi",
    description: "Raggiunto il traguardo di 300.000 alberi piantati con il progetto ForestaMi. Città Metropolitana si aggiudica €2,3 milioni per piantare oltre 30.000 alberi aggiuntivi",
    type: "policy_review",
    occurredAt: "2023-11-20T14:00:00Z"
  },

  // ============================================================================
  // PUBLIC ENGAGEMENT & PROTESTS
  // ============================================================================
  {
    administration: "Milan City Council 2021-2026",
    title: "Sciopero ATM gennaio 2023",
    description: "Primo sciopero dell'anno dei lavoratori ATM organizzato da Cobas, con interruzione servizi metro, bus e tram per 24 ore",
    type: "protest",
    occurredAt: "2023-01-27T00:00:00Z"
  },
  {
    administration: "Milan City Council 2021-2026",
    title: "Sciopero ATM settembre 2023",
    description: "Sciopero di 24 ore proclamato da Cub Trasporti, Sgb, Cobas lavoro privato, Adl Cobas e Faisa-Confail contro liberalizzazione, privatizzazione e bandi di gara per servizi ATM",
    type: "protest",
    occurredAt: "2023-09-18T00:00:00Z"
  },
  {
    administration: "Milan City Council 2021-2026",
    title: "Sciopero ATM marzo 2024",
    description: "Sciopero del trasporto pubblico milanese (metro, bus e tram) proclamato dal sindacato Al Cobas per questioni di sicurezza lavoratori e contro bandi di gara",
    type: "protest",
    occurredAt: "2024-03-22T00:00:00Z"
  },
  {
    administration: "Milan City Council 2021-2026",
    title: "Sciopero ATM maggio 2024",
    description: "Sciopero di 24 ore confermato dai lavoratori ATM del sindacato AL COBAS",
    type: "protest",
    occurredAt: "2024-05-31T00:00:00Z"
  },

  // ============================================================================
  // APPOINTMENTS & ADMINISTRATIVE
  // ============================================================================
  {
    administration: "Milan City Council 2021-2026",
    title: "Dimissioni assessore Giancarlo Tancredi",
    description: "Dimissioni dell'assessore all'Urbanistica Giancarlo Tancredi, stesso giorno in cui Sala difende le sue scelte con lungo discorso in consiglio comunale",
    type: "appointment",
    occurredAt: "2025-07-21T16:00:00Z"
  },

  // ============================================================================
  // OLYMPICS 2026 PREPARATIONS
  // ============================================================================
  {
    administration: "Milan City Council 2021-2026",
    title: "Accordo PNRR per opere olimpiche",
    description: "Firma accordo tra Ministero della Cultura, Comune di Milano e Fondazione BEIC per attuazione opere Olimpiadi 2026. Budget organizzazione: €1,7 miliardi. Opere infrastrutturali SIMICO: €3,4 miliardi",
    type: "partnership_agreement",
    occurredAt: "2021-12-30T14:00:00Z"
  },
  {
    administration: "Milan City Council 2021-2026",
    title: "Sopralluogo cantieri olimpici - 70% completamento",
    description: "Sopralluogo congiunto di Ministro Abodi, Presidente Fontana e Sindaco Sala: cantieri olimpici al 70% di completamento, 4 mesi prima della cerimonia d'apertura. Completate oltre 70 delle 98 opere previste",
    type: "policy_review",
    occurredAt: "2025-10-10T10:00:00Z"
  },
]
