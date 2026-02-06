/**
 * Changes - BASE dataset
 * Links events to targets (entities, provisions, administrations)
 *
 * A "change" is a manually tracked record of a modification to a target.
 * - type: 'actual' = already happened, 'planned' = announced future modification
 * - effectiveDate: when the change takes/took effect (ISO date string)
 * - relevance: 1-10 scale indicating significance of the change
 *
 * Every event has at least one change targeting the entity "Comune di Milano".
 * Some events also have changes targeting specific provisions.
 */

export const changes = [
  // Approvazione bilancio previsionale 2025
  {
    event: "Approvazione bilancio previsionale 2025",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2025-01-15",
    relevance: 8,
    description: "Bilancio 2025 approvato con focus su trasporto pubblico e verde"
  },
  {
    event: "Approvazione bilancio previsionale 2025",
    targetType: "provision",
    targetName: "Partecipazione ATM",
    type: "actual",
    effectiveDate: "2025-01-15",
    relevance: 6,
    description: "Aumento fondi trasporto pubblico nel bilancio 2025"
  },
  // Nuova ordinanza dehors invernali
  {
    event: "Nuova ordinanza dehors invernali",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2025-01-22",
    relevance: 4,
    description: "Aggiornamento regolamento dehors invernali"
  },
  {
    event: "Nuova ordinanza dehors invernali",
    targetType: "provision",
    targetName: "Public Space Occupation Permits (Dehors)",
    type: "actual",
    effectiveDate: "2025-01-22",
    relevance: 6,
    description: "Estensione orari consentiti per dehors invernali"
  },
  // Piano straordinario manutenzione strade
  {
    event: "Piano straordinario manutenzione strade",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2025-02-03",
    relevance: 5,
    description: "Piano manutenzione straordinaria 120km strade"
  },
  // Consultazione pubblica su piano del traffico
  {
    event: "Consultazione pubblica su piano del traffico",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2025-02-18",
    relevance: 6,
    description: "Aperta consultazione sul Piano Traffico 2025-2030"
  },
  {
    event: "Consultazione pubblica su piano del traffico",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2025-02-18",
    relevance: 5,
    description: "Piano traffico include revisione sistema pedaggi"
  },
  // Nomina nuovo assessore alla mobilità
  {
    event: "Nomina nuovo assessore alla mobilità",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2025-03-05",
    relevance: 5,
    description: "Nominato nuovo assessore mobilità e lavori pubblici"
  },
  // Sentenza TAR su limiti Area B
  {
    event: "Sentenza TAR su limiti Area B",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2025-03-12",
    relevance: 7,
    description: "TAR conferma legittimità restrizioni Area B"
  },
  {
    event: "Sentenza TAR su limiti Area B",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2025-03-12",
    relevance: 8,
    description: "Confermata legittimità limiti diesel Euro 5 in Area B"
  },
  // Approvazione regolamento piste ciclabili
  {
    event: "Approvazione regolamento piste ciclabili",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2025-04-08",
    relevance: 6,
    description: "Nuovo regolamento rete ciclabile con corsie protette"
  },
  // Avvio cantiere Metro Linea 6
  {
    event: "Avvio cantiere Metro Linea 6",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2025-04-22",
    relevance: 9,
    description: "Apertura cantiere Metro M6 Baggio-Porta Romana"
  },
  {
    event: "Avvio cantiere Metro Linea 6",
    targetType: "provision",
    targetName: "Partecipazione ATM",
    type: "actual",
    effectiveDate: "2025-04-22",
    relevance: 8,
    description: "ATM gestirà la nuova linea M6"
  },
  // Aumento frequenze ATM linee di superficie
  {
    event: "Aumento frequenze ATM linee di superficie",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2025-05-05",
    relevance: 5,
    description: "Incremento frequenze tram e bus nelle fasce di punta"
  },
  {
    event: "Aumento frequenze ATM linee di superficie",
    targetType: "provision",
    targetName: "Partecipazione ATM",
    type: "actual",
    effectiveDate: "2025-05-05",
    relevance: 7,
    description: "Miglioramento servizio su linee tram 1, 3, 15 e bus 54, 61, 95"
  },
  // Petizione cittadina per zona 30 in centro
  {
    event: "Petizione cittadina per zona 30 in centro",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2025-05-20",
    relevance: 6,
    description: "15.000 firme per zona 30 km/h entro i Navigli"
  },
  // Bando ATM per 200 bus elettrici
  {
    event: "Bando ATM per 200 bus elettrici",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2025-06-02",
    relevance: 7,
    description: "Bando per 200 bus elettrici per flotta ATM"
  },
  {
    event: "Bando ATM per 200 bus elettrici",
    targetType: "provision",
    targetName: "Partecipazione ATM",
    type: "actual",
    effectiveDate: "2025-06-02",
    relevance: 8,
    description: "Rinnovo flotta con 200 bus elettrici"
  },
  // Dichiarazione emergenza caldo urbano
  {
    event: "Dichiarazione emergenza caldo urbano",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2025-06-28",
    relevance: 7,
    description: "Emergenza caldo: attivati centri di raffreddamento"
  },
  // Aggiudicazione appalto riqualificazione Navigli
  {
    event: "Aggiudicazione appalto riqualificazione Navigli",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2025-07-10",
    relevance: 8,
    description: "Appalto da 85M per riqualificazione Darsena-Navigli"
  },
  // Revisione tariffe sosta su strada
  {
    event: "Revisione tariffe sosta su strada",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2025-07-25",
    relevance: 5,
    description: "Tariffe sosta +20% in centro, invariate in periferia"
  },
  {
    event: "Revisione tariffe sosta su strada",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2025-07-25",
    relevance: 6,
    description: "Aumento tariffe strisce blu in zona centrale"
  },
  // Accordo Regione-Comune su qualità aria
  {
    event: "Accordo Regione-Comune su qualità aria",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2025-08-14",
    relevance: 7,
    description: "Protocollo Regione-Comune per misure anti-inquinamento"
  },
  // Apertura nuova pista ciclabile Loreto-Sesto
  {
    event: "Apertura nuova pista ciclabile Loreto-Sesto",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2025-09-08",
    relevance: 5,
    description: "Inaugurata ciclabile protetta Loreto-Sesto, 7.5 km"
  },
  // Consiglio comunale approva piano dehors 2026
  {
    event: "Consiglio comunale approva piano dehors 2026",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2025-09-22",
    relevance: 5,
    description: "Piano triennale dehors con nuovi criteri estetici"
  },
  {
    event: "Consiglio comunale approva piano dehors 2026",
    targetType: "provision",
    targetName: "Public Space Occupation Permits (Dehors)",
    type: "actual",
    effectiveDate: "2025-09-22",
    relevance: 8,
    description: "Criteri accessibilità e design aggiornati per permessi dehors"
  },
  // Estensione divieto Euro 3 benzina ad Area B
  {
    event: "Estensione divieto Euro 3 benzina ad Area B",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2025-10-01",
    relevance: 7,
    description: "Divieto Euro 3 benzina esteso ad Area B"
  },
  {
    event: "Estensione divieto Euro 3 benzina ad Area B",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2025-10-01",
    relevance: 9,
    description: "Stop benzina Euro 3 in Area B con 50 ingressi gratuiti"
  },
  // Protesta trasportatori per restrizioni Area B
  {
    event: "Protesta trasportatori per restrizioni Area B",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2025-10-15",
    relevance: 6,
    description: "2.000 trasportatori protestano contro restrizioni Area B"
  },
  // Stanziamento fondi riforestazione urbana
  {
    event: "Stanziamento fondi riforestazione urbana",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2025-11-03",
    relevance: 7,
    description: "12M euro per ForestaMi: 50.000 alberi entro 2027"
  },
  // Adozione piano urbanistico zona Bovisa
  {
    event: "Adozione piano urbanistico zona Bovisa",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2025-11-18",
    relevance: 6,
    description: "Piano rigenerazione ex-Triennale Bovisa adottato"
  },
  // Revisione policy di risposta alle crisi
  {
    event: "Revisione policy di risposta alle crisi",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2025-12-05",
    relevance: 5,
    description: "Aggiornamento protocolli protezione civile"
  },
  // Approvazione bilancio previsionale 2026
  {
    event: "Approvazione bilancio previsionale 2026",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2025-12-18",
    relevance: 8,
    description: "Bilancio 2026: 3.2 miliardi, +8% trasporto, +15% verde"
  },
  {
    event: "Approvazione bilancio previsionale 2026",
    targetType: "provision",
    targetName: "Partecipazione ATM",
    type: "actual",
    effectiveDate: "2025-12-18",
    relevance: 7,
    description: "Aumento 8% fondi trasporto pubblico nel bilancio 2026"
  },
  // Estensione Area C al weekend
  {
    event: "Estensione Area C al weekend",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2026-01-01",
    relevance: 9,
    description: "Area C attiva 7 giorni su 7"
  },
  {
    event: "Estensione Area C al weekend",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2026-01-01",
    relevance: 10,
    description: "Area C estesa a sabato e domenica, tariffa weekend €5"
  },
  // Riforma amministrativa zone municipali
  {
    event: "Riforma amministrativa zone municipali",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2026-01-15",
    relevance: 7,
    description: "Municipi con più autonomia su verde e viabilità"
  },
  // Lancio piattaforma digitale partecipazione
  {
    event: "Lancio piattaforma digitale partecipazione",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2026-02-10",
    relevance: 6,
    description: "Piattaforma online per partecipazione su bilancio e urbanistica"
  },
  // Proposta di legge regionale su ZTL metropolitane
  {
    event: "Proposta di legge regionale su ZTL metropolitane",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2026-02-20",
    relevance: 6,
    description: "Proposta legge per armonizzare ZTL area metropolitana"
  },
  {
    event: "Proposta di legge regionale su ZTL metropolitane",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "planned",
    effectiveDate: "2026-02-20",
    relevance: 7,
    description: "Possibile armonizzazione pedaggi a livello metropolitano"
  },
  // Inaugurazione stazione Metro M4 Linate
  {
    event: "Inaugurazione stazione Metro M4 Linate",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2026-03-03",
    relevance: 9,
    description: "Stazione M4 Linate aperta, collegamento centro-aeroporto completo"
  },
  {
    event: "Inaugurazione stazione Metro M4 Linate",
    targetType: "provision",
    targetName: "Partecipazione ATM",
    type: "actual",
    effectiveDate: "2026-03-03",
    relevance: 9,
    description: "ATM gestisce collegamento diretto centro-Linate su M4"
  },
  // Consultazione piano clima 2030
  {
    event: "Consultazione piano clima 2030",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2026-03-15",
    relevance: 8,
    description: "Consultazione pubblica Piano Clima: -55% emissioni entro 2030"
  },
  // Variazione di bilancio per emergenza maltempo
  {
    event: "Variazione di bilancio per emergenza maltempo",
    targetType: "entity",
    targetName: "Comune di Milano",
    type: "actual",
    effectiveDate: "2026-03-28",
    relevance: 7,
    description: "18M euro per interventi urgenti post-alluvione Niguarda"
  },
]
