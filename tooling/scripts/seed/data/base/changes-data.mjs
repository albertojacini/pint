/**
 * Changes - BASE dataset
 * Links events to provisions
 *
 * A "change" is a manually tracked record of a modification to a target (provision, entity, administration).
 * - type: 'actual' = already happened, 'planned' = announced future modification
 * - effectiveDate: when the change takes/took effect (ISO date string)
 * - relevance: 1-10 scale indicating significance of the change
 */

export const changes = [
  // 2020
  {
    event: "Avvio installazione telecamere Area B",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2020-01-07",
    relevance: 6,
    description: "Primo lotto 10 telecamere Area B attivate"
  },
  {
    event: "Estensione MoveIn ad Area B",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2020-01-01",
    relevance: 7,
    description: "Scatola nera MoveIn valida anche per Area B"
  },
  {
    event: "Sospensione Area B e Area C per COVID-19",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2020-03-12",
    relevance: 9,
    description: "ZTL sospese per emergenza COVID-19"
  },
  {
    event: "Seconda sospensione Area C per COVID-19",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2020-11-05",
    relevance: 7,
    description: "Area C sospesa per seconda ondata COVID"
  },
  // 2021
  {
    event: "Riattivazione Area B e Area C post-COVID",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2021-06-09",
    relevance: 8,
    description: "Ripristino regole pre-COVID per entrambe le ZTL"
  },
  // 2022
  {
    event: "Completamento sistema telecamere Area B",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2022-04-20",
    relevance: 7,
    description: "188 telecamere operative, perimetro Area B completo"
  },
  {
    event: "Divieto diesel Euro 5 in Area C",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2022-10-01",
    relevance: 9,
    description: "Stop Euro 2 benzina, Euro 3-4-5 diesel in Area C"
  },
  {
    event: "Obbligo ticket Area C per veicoli ibridi",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2022-10-01",
    relevance: 6,
    description: "Ibridi con CO2 >100 g/km pagano ticket"
  },
  {
    event: "Divieto diesel Euro 4/5 in Area B",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2022-10-01",
    relevance: 9,
    description: "Stop Euro 2 benzina, Euro 4-5 diesel in Area B"
  },
  // 2023
  {
    event: "Nuovo sistema deroghe Area B",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2023-10-01",
    relevance: 7,
    description: "50 giorni primo anno, poi 25/5 per residenti/non residenti"
  },
  {
    event: "Aumento tariffa ticket Area C",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2023-10-30",
    relevance: 8,
    description: "Ticket da €5 a €7,50 (+50%)"
  },
  // 2024
  {
    event: "Divieto benzina Euro 3 in Area C",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2024-10-01",
    relevance: 8,
    description: "Stop benzina Euro 3 in Area C"
  },
  {
    event: "Rinvio divieto moto e scooter al 2026",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2024-10-01",
    relevance: 6,
    description: "Divieto moto Euro 2-3 due tempi rinviato di 2 anni"
  },
  // 2025
  {
    event: "Avvio ZTL Quadrilatero della Moda",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2025-05-12",
    relevance: 8,
    description: "Nuova ZTL 24/7 nel distretto della moda"
  },
  {
    event: "Attivazione telecamere Quadrilatero della Moda",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2025-09-15",
    relevance: 6,
    description: "Sanzionamento elettronico attivo nel Quadrilatero"
  },
  {
    event: "Divieto benzina Euro 3 in Area B",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2025-10-01",
    relevance: 8,
    description: "Stop benzina Euro 3 esteso ad Area B"
  },
  // 2026
  {
    event: "Estensione Area C al weekend",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2026-01-01",
    relevance: 9,
    description: "Area C attiva 7 giorni su 7"
  },
  {
    event: "Divieto moto e scooter inquinanti",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "actual",
    effectiveDate: "2026-10-01",
    relevance: 7,
    description: "Stop moto Euro 2-3 due tempi in Area B e C"
  },
  // Futuri (planned)
  {
    event: "Divieto benzina Euro 4 e diesel Euro 6 A-B-C in Area B",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "planned",
    effectiveDate: "2028-10-01",
    relevance: 9,
    description: "Stop benzina Euro 4 e diesel Euro 6 A-B-C"
  },
  {
    event: "Divieto diesel Euro 6 D in Area B",
    targetType: "provision",
    targetName: "Pedaggi urbani",
    type: "planned",
    effectiveDate: "2030-10-01",
    relevance: 9,
    description: "Eliminazione completa diesel da Area B"
  },
]
