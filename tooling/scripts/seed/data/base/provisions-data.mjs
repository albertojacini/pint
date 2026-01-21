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
    summary_md: `**Funziona?** ATM serve 800M+ passeggeri/anno in 96 comuni. Affidabilità migliorata nel 2024-25 con aumento frequenze metro ed elettrificazione flotta.

**Chi vince, chi perde?** Vincono: residenti (tariffe agevolate), ambiente (riduzione emissioni). Perdono: contribuenti (coprono deficit), automobilisti (minore priorità stradale).

**Quadro finanziario?** Il Comune copre i deficit operativi con sussidi. I ricavi tariffari coprono ~35% dei costi. Investimenti in Metro Linea 4 e bus elettrici.

**Come si confronta?** Simile ad altre città italiane (Torino, Roma) con proprietà municipale totale. Diverso da Londra/Parigi con privatizzazione parziale.

**Cosa sta cambiando?** Metro Linea 4 operativa, espansione bus elettrici in corso, pagamenti contactless al 60%.

**Cosa si discute?** Aumenti tariffari vs qualità servizio, negoziati sindacali, copertura zone periferiche.

**Va modificata?** Alcuni propongono privatizzazione parziale per efficienza; altri sostengono che il controllo pubblico sia essenziale per equità sociale e pianificazione urbana.

**Quali alternative?** Modello concessione (come Londra), misto pubblico-privato (come Parigi), o privatizzazione totale (rara per trasporto urbano).`,
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
        { timestamp: '2025-01-08T09:00:00Z', label: 'Annual service performance review completed' },
        { timestamp: '2025-01-15T10:30:00Z', label: 'New fare structure for seniors implemented' },
        { timestamp: '2025-01-22T14:00:00Z', label: 'Winter maintenance protocol activated' },
        { timestamp: '2025-01-29T11:00:00Z', label: 'Staff training program for new ticketing system' },
        { timestamp: '2025-02-05T09:30:00Z', label: 'Bus route 73 frequency increased' },
        { timestamp: '2025-02-12T15:00:00Z', label: 'Metro Line 2 station lighting upgrades begin' },
        { timestamp: '2025-02-19T10:00:00Z', label: 'Electric bus fleet expanded by 15 units' },
        { timestamp: '2025-02-26T13:30:00Z', label: 'Customer satisfaction survey launched' },
        { timestamp: '2025-03-05T11:00:00Z', label: 'Tram track maintenance on Line 9 completed' },
        { timestamp: '2025-03-12T14:00:00Z', label: 'New bus shelter designs unveiled' },
        { timestamp: '2025-03-19T09:00:00Z', label: 'Integration with regional rail ticket system' },
        { timestamp: '2025-03-26T16:00:00Z', label: 'Spring service schedule adjustments' },
        { timestamp: '2025-04-02T10:30:00Z', label: 'Metro Line 3 platform accessibility improvements' },
        { timestamp: '2025-04-09T13:00:00Z', label: 'Real-time crowding data feature added to app' },
        { timestamp: '2025-04-16T11:30:00Z', label: 'Night bus route N24 extended to Rho' },
        { timestamp: '2025-04-23T15:00:00Z', label: 'New uniforms for customer service staff' },
        { timestamp: '2025-04-30T09:00:00Z', label: 'Depot modernization project approved' },
        { timestamp: '2025-05-07T14:00:00Z', label: 'Bike rack installations at 20 metro stations' },
        { timestamp: '2025-05-14T10:00:00Z', label: 'Summer timetable begins' },
        { timestamp: '2025-05-21T11:00:00Z', label: 'Tourist pass options expanded' },
        { timestamp: '2025-05-28T16:30:00Z', label: 'Metro Line 1 extension to Monza feasibility study' },
        { timestamp: '2025-06-04T09:30:00Z', label: 'Air conditioning upgrades on tram fleet' },
        { timestamp: '2025-06-11T13:00:00Z', label: 'Partnership with ride-sharing services announced' },
        { timestamp: '2025-06-18T10:00:00Z', label: 'Environmental impact report published' },
        { timestamp: '2025-06-25T14:30:00Z', label: 'Suburban rail integration agreement signed' },
        { timestamp: '2025-07-02T11:00:00Z', label: 'Bus route 95 rerouted for construction' },
        { timestamp: '2025-07-09T15:00:00Z', label: 'Summer internship program begins' },
        { timestamp: '2025-07-16T09:00:00Z', label: 'Metro Line 4 service frequency increased' },
        { timestamp: '2025-07-23T13:30:00Z', label: 'New security cameras installed at key stations' },
        { timestamp: '2025-07-30T10:30:00Z', label: 'Contactless payment usage reaches 60%' },
        { timestamp: '2025-08-06T14:00:00Z', label: 'Station naming rights policy reviewed' },
        { timestamp: '2025-08-13T11:00:00Z', label: 'Employee wellness program launched' },
        { timestamp: '2025-08-20T15:30:00Z', label: 'Night bus service expansion approved' },
        { timestamp: '2025-08-27T09:00:00Z', label: 'Automated announcement system upgraded' },
        { timestamp: '2025-09-03T10:00:00Z', label: 'Back-to-school service adjustments' },
        { timestamp: '2025-09-10T13:00:00Z', label: 'New articulated trams for Line 16' },
        { timestamp: '2025-09-17T11:30:00Z', label: 'Carbon neutrality roadmap published' },
        { timestamp: '2025-09-24T14:00:00Z', label: 'Bus stop accessibility audit completed' },
        { timestamp: '2025-10-01T09:30:00Z', label: 'Fall service schedule begins' },
        { timestamp: '2025-10-08T16:00:00Z', label: 'Smart parking integration at metro stations' },
        { timestamp: '2025-10-15T10:00:00Z', label: 'Mobile ticketing fraud detection improved' },
        { timestamp: '2025-10-22T13:30:00Z', label: 'Tram Line 12 track renewal project starts' },
        { timestamp: '2025-10-29T11:00:00Z', label: 'Winter operations plan finalized' },
        { timestamp: '2025-11-05T14:00:00Z', label: 'Partnership with universities for student passes' },
        { timestamp: '2025-11-12T09:00:00Z', label: 'Digital ticketing system upgrade' },
        { timestamp: '2025-11-19T15:00:00Z', label: 'Service reliability improvements on Metro Line 2' },
        { timestamp: '2025-11-26T10:30:00Z', label: 'Holiday service schedule announced' },
        { timestamp: '2025-12-03T13:00:00Z', label: 'Year-end performance metrics published' },
        { timestamp: '2025-12-10T11:00:00Z', label: 'New year service planning begins' },
        { timestamp: '2025-12-17T14:30:00Z', label: 'Annual ridership reaches 800 million passengers' },
      ],
    },
    evaluationSummary: {
      effectiveness: {
        type: 'score',
        value: 7,
        trend: 'up',
        label: 'Funziona',
        confidence: 'medium',
      },
      impact: {
        type: 'impact',
        balance: 0.3,
        winners: [
          { group: 'Residenti', detail: 'Tariffe agevolate, mobilità accessibile' },
          { group: 'Ambiente', detail: 'Riduzione emissioni, elettrificazione' },
        ],
        losers: [
          { group: 'Contribuenti', detail: 'Coprono deficit operativi' },
          { group: 'Automobilisti', detail: 'Minore priorità stradale' },
        ],
        confidence: 'medium',
      },
      financial: {
        type: 'financial',
        value: '-€200M',
        label: 'deficit/anno',
        isPositive: false,
        trend: 'stable',
        confidence: 'medium',
      },
      sentiment: {
        type: 'sentiment',
        score: 68,
        label: 'Soddisfazione utenti',
        confidence: 'medium',
      },
      activity: {
        type: 'activity',
        changesCount: 51,
        period: 'ultimo anno',
        trend: 'stable',
        confidence: 'high',
      },
      dataConfidence: {
        type: 'dataConfidence',
        level: 'medium',
        coverage: 55,
        label: 'Dati parziali',
      },
      stakeholders: {
        type: 'stakeholders',
        items: [
          { group: 'Utenti trasporto pubblico', impact: 'positive', size: 'large', detail: '800M passeggeri/anno' },
          { group: 'Dipendenti ATM', impact: 'positive', size: 'medium', detail: 'Stabilità occupazionale' },
          { group: 'Contribuenti', impact: 'negative', size: 'large', detail: 'Sussidi per deficit' },
          { group: 'Commercianti', impact: 'positive', size: 'medium', detail: 'Accessibilità clienti' },
          { group: 'Turisti', impact: 'positive', size: 'medium', detail: 'Rete capillare' },
        ],
        confidence: 'medium',
      },
    },
  },
  {
    entity: 'Comune di Milano',
    title: 'Pedaggi urbani',
    descriptionShort: 'Zone a traffico limitato per ridurre inquinamento e congestione con pedaggi e restrizioni.',
    description: 'Il Comune di Milano gestisce un sistema articolato di zone a traffico limitato (ZTL) composto da Area C (zona centrale a pagamento con ticket da 5€) e Area B (zona estesa di 128 km² con restrizioni ambientali gratuite). Area C opera tramite 43 varchi elettronici nella Cerchia dei Bastioni, mentre Area B copre il 72% del territorio comunale escludendo i veicoli più inquinanti. Il sistema, evoluzione di Ecopass (2008), mira a ridurre l\'inquinamento atmosferico e finanziare il trasporto pubblico, con restrizioni progressive fino al 2030. I risultati documentati mostrano riduzioni significative di PM10 (-50% in 4 anni) e NOx (-11% annuo dal 2023).',
    summary_md: `**Funziona?** Sì, con risultati significativi: PM10 ridotto del 50% in 4 anni, NOx -11% annuo dal 2023. Traffico in Area C -30% rispetto ai livelli pre-Ecopass.

**Chi vince, chi perde?** Vincono: residenti (aria più pulita, meno congestione), trasporto pubblico (€30M/anno di finanziamenti). Perdono: proprietari di veicoli vecchi costretti a cambiare, pendolari che pagano €5/giorno, piccole imprese con costi di consegna.

**Quadro finanziario?** Area C genera €30M/anno vs €6M di costi operativi. I €24M netti finanziano il trasporto pubblico. Area B non ha ricavi diretti ma riduce i costi sanitari da inquinamento.

**Come si confronta?** Ispirata a Londra/Stoccolma. Area B (128 km²) è la ZTL più grande d'Italia. Tariffa fissa (€5) più semplice del modello dinamico londinese ma meno efficiente nella gestione della domanda.

**Cosa sta cambiando?** Area C estesa a 7 giorni/settimana da gennaio 2026. Divieti progressivi: Euro 4 benzina vietati dal 2028, Euro 6 diesel D dal 2030.

**Cosa dicono i cittadini?** Opinioni divise: ambientalisti favorevoli, pendolari suburbani contrari. Referendum 2011 approvò Area C con 79% (ma affluenza 49%). Associazioni commerciali chiedono esenzioni.

**Cosa si discute?** Equità verso guidatori a basso reddito che non possono permettersi veicoli nuovi. Efficacia delle esenzioni (troppe scappatoie?). Se i ricavi debbano finanziare più trasporto pubblico o manutenzione stradale.

**Va modificata?** Critici propongono: tariffe dinamiche come Londra, orari estesi, meno esenzioni. Sostenitori del modello attuale citano semplicità e risultati provati.

**Va eliminata?** Nessun supporto mainstream per l'eliminazione. Procedure d'infrazione UE per qualità dell'aria rendono le restrizioni legalmente necessarie. Il dibattito è sulla calibrazione, non sull'eliminazione.

**Quali alternative?** Tariffazione a km (sistema MoVe-In offre questa opzione), tariffe parcheggi, tasse carburanti, divieto totale auto in centro (come alcune città UE).

**Cosa manca?** Dati correlazione qualità aria in tempo reale, studi impatto traffico spostato verso aree circostanti, analisi equità per livello di reddito.

**È a prova di futuro?** Progettata con roadmap 2030. Crescita veicoli elettrici potrebbe ridurre ricavi; potrebbe servire ristrutturazione. Obiettivi climatici probabilmente stringeranno ulteriormente le restrizioni.`,
    avatarUrl: './assets/avatars/provisions/comune-di-milano-areac.png',
    types: ['taxation'],
    status: 'active',
    relevance: 9,
    idea: 'Urban congestion charge',
    displayData: {
      items: [
        { label: 'Estensione Area B', value: '128 km²' },
        { label: 'Tariffa Area C', value: '€5' },
        { label: 'Entrate Annuali', value: '€30M' },
        { label: 'Riduzione PM10 (4 anni)', value: '-50%' },
        { label: 'Varchi Elettronici', value: '43' },
      ],
    },
    displayChanges: {
      items: [
        { label: 'Area C extended to weekends - now active 7 days/week (7:30-19:30)', timestamp: '2026' },
      ],
    },
    evaluationSummary: {
      effectiveness: {
        type: 'score',
        value: 8,
        trend: 'stable',
        label: 'Funziona',
        confidence: 'high',
      },
      impact: {
        type: 'impact',
        balance: 0.2,
        winners: [
          { group: 'Residenti centro', detail: 'Aria più pulita, meno congestione' },
          { group: 'Trasporto pubblico', detail: '€30M/anno finanziamenti' },
        ],
        losers: [
          { group: 'Automobilisti', detail: '€5/giorno pedaggio' },
          { group: 'Proprietari veicoli vecchi', detail: 'Costretti a cambiare' },
          { group: 'Piccole imprese', detail: 'Costi consegna aumentati' },
        ],
        confidence: 'high',
      },
      financial: {
        type: 'financial',
        value: '€24M',
        label: 'netto/anno',
        isPositive: true,
        trend: 'stable',
        confidence: 'high',
      },
      sentiment: {
        type: 'sentiment',
        score: 65,
        label: 'Supporto misto',
        confidence: 'medium',
      },
      activity: {
        type: 'activity',
        changesCount: 1,
        period: 'ultimo anno',
        trend: 'stable',
        confidence: 'high',
      },
      dataConfidence: {
        type: 'dataConfidence',
        level: 'high',
        coverage: 75,
        label: 'Dati buoni',
      },
      stakeholders: {
        type: 'stakeholders',
        items: [
          { group: 'Residenti centro', impact: 'positive', size: 'medium', detail: 'Meno traffico e inquinamento' },
          { group: 'Pendolari auto', impact: 'negative', size: 'large', detail: 'Pagano €5/giorno' },
          { group: 'Trasporto pubblico', impact: 'positive', size: 'large', detail: 'Più finanziamenti e utenti' },
          { group: 'Commercianti centro', impact: 'mixed', size: 'medium', detail: 'Meno traffico ma anche meno clienti in auto' },
          { group: 'Proprietari veicoli vecchi', impact: 'negative', size: 'medium', detail: 'Costretti a cambiare veicolo' },
          { group: 'Ambiente', impact: 'positive', size: 'large', detail: 'PM10 -50%, NOx -11%/anno' },
        ],
        confidence: 'high',
      },
    },
  },
  {
    entity: 'Comune di Milano',
    title: 'Public Space Occupation Permits (Dehors)',
    descriptionShort: 'Outdoor seating permits for restaurants',
    description: 'Municipal regulation governing outdoor seating areas (dehors) for restaurants and bars, including design standards, size limits, seasonal permissions, and accessibility requirements.',
    summary_md: `**Funziona?** Tasso di conformità 92% nel 2025. 1.247 permessi attivi generano €2,2M/anno. Capacità posti esterni aumentata dell'8% in città.

**Chi vince, chi perde?** Vincono: ristoratori (+50% posti a sedere, più ricavi), vita cittadina (vivacità), Comune (entrate da canoni). Perdono: pedoni (meno spazio sui marciapiedi), residenti vicino ai locali (rumore), attività senza spazio disponibile.

**Quadro finanziario?** Canoni €15-30/m²/mese generano ~€185K/mese. Costi di gestione e controllo coperti dai ricavi dei permessi. Bilancio netto positivo per il Comune.

**Come si confronta?** Simile ad altre città italiane. Milano più permissiva dei centri storici (Firenze, Venezia) ma più restrittiva delle regole emergenziali COVID che permettevano espansione diffusa.

**Cosa sta cambiando?** Portale domande digitale lanciato ottobre 2025. Permessi pluriennali ora disponibili. Nuovi requisiti sostenibilità per materiali arredi. Linee guida per dehors riscaldati introdotte.

**Cosa dicono i cittadini?** Ristoratori vogliono canoni più bassi e orari più lunghi. Residenti lamentano rumore dopo le 22:00. Associazioni disabili chiedono controlli più rigidi sugli spazi di passaggio.

**Cosa si discute?** Equilibrio tra vitalità commerciale e diritti dei pedoni. Adeguatezza controlli rumore. Se i canoni riflettano il vero valore dello spazio pubblico. Espansioni COVID: rendere permanenti o revocare?

**Va modificata?** Proposte: canoni più alti in zone pregiate, controlli rumore più severi, verifiche accessibilità obbligatorie, restrizioni stagionali in zone residenziali.

**Quali alternative?** Pedonalizzare intere strade (elimina il conflitto), aste per i permessi (prezzi di mercato), requisiti di beneficio comunitario (orari di seduta pubblica).

**Cosa manca?** Studio impatto flussi pedonali, dati monitoraggio livelli rumore, analisi economica effetti su attività vicine.`,
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
        { timestamp: '2025-01-10T09:00:00Z', label: 'Winter permit renewals begin' },
        { timestamp: '2025-01-17T11:00:00Z', label: 'Inspection schedule published for Q1' },
        { timestamp: '2025-01-24T14:00:00Z', label: 'New guidelines for heated outdoor seating' },
        { timestamp: '2025-01-31T10:30:00Z', label: 'Permit compliance rate: 92%' },
        { timestamp: '2025-02-07T13:00:00Z', label: 'Accessibility audit of existing permits' },
        { timestamp: '2025-02-14T09:30:00Z', label: 'Fee structure review initiated' },
        { timestamp: '2025-02-21T15:00:00Z', label: 'Digital application portal update' },
        { timestamp: '2025-02-28T11:00:00Z', label: 'Enforcement actions: 12 violations addressed' },
        { timestamp: '2025-03-07T14:30:00Z', label: 'Spring permit season preparation' },
        { timestamp: '2025-03-14T10:00:00Z', label: 'New design catalog published' },
        { timestamp: '2025-03-21T16:00:00Z', label: 'Collaboration with restaurant association' },
        { timestamp: '2025-03-28T09:00:00Z', label: 'Pedestrian clearance compliance check' },
        { timestamp: '2025-04-04T13:30:00Z', label: 'Seasonal permit fees adjusted for inflation' },
        { timestamp: '2025-04-11T11:00:00Z', label: 'Spring permit applications open' },
        { timestamp: '2025-04-18T14:00:00Z', label: 'Sustainability guidelines updated' },
        { timestamp: '2025-04-25T10:30:00Z', label: 'Permit approval process streamlined' },
        { timestamp: '2025-05-02T15:00:00Z', label: 'Summer season permit deadline announced' },
        { timestamp: '2025-05-09T09:00:00Z', label: 'New furniture suppliers approved' },
        { timestamp: '2025-05-16T13:00:00Z', label: 'Inspection training for municipal staff' },
        { timestamp: '2025-05-23T11:30:00Z', label: 'Tourist district special permits issued' },
        { timestamp: '2025-05-30T14:00:00Z', label: 'Outdoor seating capacity increased 8%' },
        { timestamp: '2025-06-06T10:00:00Z', label: 'Summer enforcement schedule begins' },
        { timestamp: '2025-06-13T16:00:00Z', label: 'Heat protection requirements introduced' },
        { timestamp: '2025-06-20T09:30:00Z', label: 'Noise complaint resolution protocol updated' },
        { timestamp: '2025-06-27T13:30:00Z', label: 'Monthly revenue from permits: €185K' },
        { timestamp: '2025-07-04T11:00:00Z', label: 'Pedestrian flow study initiated' },
        { timestamp: '2025-07-11T14:00:00Z', label: 'New sustainability requirements for furniture materials' },
        { timestamp: '2025-07-18T10:30:00Z', label: 'Emergency removal procedures clarified' },
        { timestamp: '2025-07-25T15:00:00Z', label: 'Summer compliance inspections completed' },
        { timestamp: '2025-08-01T09:00:00Z', label: 'Permit extension requests processed' },
        { timestamp: '2025-08-08T13:00:00Z', label: 'Public space optimization study published' },
        { timestamp: '2025-08-15T11:30:00Z', label: 'Violation penalties adjusted' },
        { timestamp: '2025-08-22T14:30:00Z', label: 'Partnership with design schools announced' },
        { timestamp: '2025-08-29T10:00:00Z', label: 'Fall transition guidelines issued' },
        { timestamp: '2025-09-05T16:00:00Z', label: 'Permit database system upgraded' },
        { timestamp: '2025-09-12T09:30:00Z', label: 'Accessibility compliance reaches 96%' },
        { timestamp: '2025-09-19T13:00:00Z', label: 'Fall permit applications open' },
        { timestamp: '2025-09-26T11:00:00Z', label: 'Weather protection standards updated' },
        { timestamp: '2025-10-03T14:00:00Z', label: 'Annual economic impact report published' },
        { timestamp: '2025-10-10T10:30:00Z', label: 'Winter preparation checklist released' },
        { timestamp: '2025-10-17T15:00:00Z', label: 'Digital permit application system launched' },
        { timestamp: '2025-10-24T09:00:00Z', label: 'Heating element safety regulations' },
        { timestamp: '2025-10-31T13:30:00Z', label: 'Halloween special event permits issued' },
        { timestamp: '2025-11-07T11:00:00Z', label: 'Winter permit season begins' },
        { timestamp: '2025-11-14T14:00:00Z', label: 'Multi-year permit option introduced' },
        { timestamp: '2025-11-21T10:00:00Z', label: 'Holiday decoration guidelines published' },
        { timestamp: '2025-11-28T16:00:00Z', label: 'Snow removal responsibility clarified' },
        { timestamp: '2025-12-05T09:30:00Z', label: 'Year-end compliance audit completed' },
        { timestamp: '2025-12-12T13:00:00Z', label: 'Holiday season enforcement schedule' },
        { timestamp: '2025-12-19T11:00:00Z', label: 'Annual permits issued: 1,247 total' },
      ],
    },
    evaluationSummary: {
      effectiveness: {
        type: 'score',
        value: 7,
        trend: 'up',
        label: 'Funziona',
        confidence: 'high',
      },
      impact: {
        type: 'impact',
        balance: 0.1,
        winners: [
          { group: 'Ristoratori', detail: '+50% posti, più ricavi' },
          { group: 'Vita cittadina', detail: 'Maggiore vivacità urbana' },
          { group: 'Comune', detail: '€2,2M/anno entrate' },
        ],
        losers: [
          { group: 'Pedoni', detail: 'Meno spazio marciapiedi' },
          { group: 'Residenti', detail: 'Rumore serale' },
        ],
        confidence: 'medium',
      },
      financial: {
        type: 'financial',
        value: '€2,2M',
        label: 'entrate/anno',
        isPositive: true,
        trend: 'up',
        confidence: 'high',
      },
      sentiment: {
        type: 'sentiment',
        score: 58,
        label: 'Opinioni divise',
        confidence: 'medium',
      },
      activity: {
        type: 'activity',
        changesCount: 50,
        period: 'ultimo anno',
        trend: 'increasing',
        confidence: 'high',
      },
      dataConfidence: {
        type: 'dataConfidence',
        level: 'medium',
        coverage: 60,
        label: 'Dati parziali',
      },
      stakeholders: {
        type: 'stakeholders',
        items: [
          { group: 'Ristoratori/bar', impact: 'positive', size: 'medium', detail: '1.247 permessi attivi' },
          { group: 'Pedoni', impact: 'negative', size: 'large', detail: 'Spazio ridotto sui marciapiedi' },
          { group: 'Residenti zona locali', impact: 'negative', size: 'small', detail: 'Rumore dopo le 22:00' },
          { group: 'Turisti', impact: 'positive', size: 'medium', detail: 'Atmosfera vivace' },
          { group: 'Disabili', impact: 'mixed', size: 'small', detail: '96% conformità accessibilità' },
          { group: 'Comune', impact: 'positive', size: 'small', detail: 'Entrate da canoni' },
        ],
        confidence: 'medium',
      },
    },
  },
]
