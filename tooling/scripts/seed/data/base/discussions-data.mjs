/**
 * Discussions - BASE dataset
 * Seed posts, comments, votes, and proposal votes for provisions
 */

// Extra profiles for discussion participants (created in seeder)
export const discussionProfiles = [
  { key: 'marco', email: 'marco.rossi@example.com', fullName: 'Marco Rossi' },
  { key: 'giulia', email: 'giulia.bianchi@example.com', fullName: 'Giulia Bianchi' },
  { key: 'luca', email: 'luca.ferrari@example.com', fullName: 'Luca Ferrari' },
  { key: 'anna', email: 'anna.colombo@example.com', fullName: 'Anna Colombo' },
  { key: 'paolo', email: 'paolo.moretti@example.com', fullName: 'Paolo Moretti' },
]

export const discussionPosts = [
  // ===== Partecipazione ATM posts =====
  {
    provision: 'Partecipazione ATM',
    author: 'marco',
    title: 'Metro Linea 4: impatto sulla mobilità periferica',
    body: `Con l'apertura della Metro Linea 4, ho notato un miglioramento significativo nei tempi di percorrenza dalla zona di Linate verso il centro.

Tuttavia, ci sono ancora **zone scoperte** nella periferia sud che non beneficiano della nuova linea. Sarebbe interessante discutere:

1. Come collegare meglio le fermate M4 con il servizio bus periferico
2. Se l'aumento di frequenza delle linee di superficie sia sufficiente
3. Quali dati ha ATM sull'effettivo aumento di utenza nelle nuove fermate

Qualcuno ha esperienze dirette da condividere?`,
    postType: 'discussion',
    isPinned: true,
  },
  {
    provision: 'Partecipazione ATM',
    author: 'giulia',
    title: 'Proposta: abbonamento unico regionale Lombardia',
    body: `Propongo di valutare la creazione di un **abbonamento unico regionale** che integri tutti i servizi di trasporto pubblico in Lombardia:

- Metro, tram e bus ATM
- Treni regionali Trenord
- Bus extraurbani

**Vantaggi attesi:**
- Semplificazione per pendolari (un solo titolo di viaggio)
- Aumento utenza del trasporto pubblico
- Riduzione traffico automobilistico sulle direttrici regionali

**Costo stimato:** €120/mese (vs €39 ATM + €89 Trenord oggi)

**Finanziamento:** Il risparmio per i pendolari sarebbe compensato dall'aumento di volume e da una contribuzione regionale.

Siete favorevoli? Quali criticità vedete?`,
    postType: 'proposal',
  },
  {
    provision: 'Partecipazione ATM',
    author: 'luca',
    title: 'Perché il servizio notturno è ancora così limitato?',
    body: `Il servizio notturno ATM è attivo solo venerdì e sabato notte. In una città come Milano, con una vita notturna e lavorativa che va ben oltre questi giorni, perché non si estende il servizio?

Confronto con altre città europee:
- **Berlino**: U-Bahn/S-Bahn operano tutta la notte nel weekend, bus notturni ogni giorno
- **Londra**: Night Tube su 5 linee, venerdì-sabato
- **Barcellona**: NitBus ogni giorno della settimana

Non sarebbe possibile almeno aggiungere il giovedì sera e la domenica notte?`,
    postType: 'question',
  },
  {
    provision: 'Partecipazione ATM',
    author: 'anna',
    title: 'Analisi: efficienza operativa ATM vs benchmark europeo',
    body: `Ho raccolto dati pubblici per confrontare le performance di ATM con operatori simili:

| Indicatore | ATM Milano | RATP Parigi | TfL Londra | BVG Berlino |
|---|---|---|---|---|
| Passeggeri/anno | 800M | 3.5B | 2.2B | 1.1B |
| Copertura ricavi | ~35% | ~40% | ~45% | ~33% |
| Puntualità metro | 96% | 95% | 94% | 97% |
| Costo/km | €4.2 | €5.1 | €6.8 | €3.9 |

**Osservazioni:**
1. La copertura ricavi di ATM (35%) è sotto la media, indicando forte dipendenza dai sussidi
2. La puntualità è competitiva
3. Il costo per km è nella media, meglio di Parigi e Londra

La domanda chiave è: come aumentare la copertura ricavi senza sacrificare l'accessibilità del servizio?`,
    postType: 'analysis',
  },

  // ===== Pedaggi urbani posts =====
  {
    provision: 'Pedaggi urbani',
    author: 'paolo',
    title: 'Area C 7 giorni su 7: troppo o giusto?',
    body: `Da gennaio 2026, Area C è attiva 7 giorni su 7. Prima di questo cambiamento, il weekend era libero.

**Pro:**
- Riduzione inquinamento anche nel weekend
- Coerenza del sistema (meno confusione sulle regole)
- Più entrate per il trasporto pubblico

**Contro:**
- Impatto su commercianti del centro nel weekend
- Famiglie che usavano l'auto nel weekend per attività con bambini
- Turisti che arrivano in auto

Cosa ne pensate? Il Comune ha fatto bene?`,
    postType: 'discussion',
  },
  {
    provision: 'Pedaggi urbani',
    author: 'anna',
    title: 'Proposta: esenzione per redditi bassi (ISEE < €15.000)',
    body: `La mia proposta è introdurre un sistema di esenzione dal pedaggio Area C per famiglie con **ISEE inferiore a €15.000**.

**Motivazione:** Il pedaggio da €5/giorno colpisce in modo sproporzionato chi non può permettersi un'auto nuova Euro 6 o chi non ha alternative di trasporto pubblico dalla periferia.

**Implementazione suggerita:**
- Richiesta online tramite il portale del Comune
- Verifica automatica ISEE tramite INPS
- Esenzione valida per 1 anno, rinnovabile
- Limite di 200 accessi/anno per evitare abusi

**Costo stimato:** Con circa 15.000 famiglie potenzialmente beneficiarie × 100 accessi medi × €5 = €7.5M/anno di mancati introiti (su €30M totali).

È un compromesso accettabile per rendere il sistema più equo?`,
    postType: 'proposal',
  },
  {
    provision: 'Pedaggi urbani',
    author: 'marco',
    title: 'Analisi: dove va il traffico escluso da Area B?',
    body: `Un aspetto poco discusso delle zone a traffico limitato è **l'effetto di spostamento**: dove finisce il traffico che non può entrare?

Ho analizzato i dati ARPA Lombardia sulle centraline di monitoraggio aria nelle zone appena fuori Area B:

- **Zona Forlanini**: PM10 +8% rispetto a 2023
- **Zona Ponte Lambro**: PM10 +12% rispetto a 2023
- **Zona Baggio**: PM10 +5% rispetto a 2023

Questi dati suggeriscono che parte del traffico si sta semplicemente **spostando verso zone meno protette**, spesso proprio quelle dove vivono famiglie a reddito più basso.

Il Comune dovrebbe commissionare uno studio approfondito sull'effetto di spostamento prima di stringere ulteriormente le restrizioni nel 2028.`,
    postType: 'analysis',
  },

  // ===== Public Space Occupation Permits (Dehors) posts =====
  {
    provision: 'Public Space Occupation Permits (Dehors)',
    author: 'giulia',
    title: 'Dehors e accessibilità: il passaggio da 1.5m è sufficiente?',
    body: `Utilizzo una sedia a rotelle e spesso mi trovo in difficoltà nei marciapiedi con dehors. Il requisito minimo di **1.5m di passaggio** sembra sulla carta ragionevole, ma nella pratica:

- I tavoli spesso invadono lo spazio quando i clienti si alzano
- Le sedie spostate riducono il passaggio effettivo
- D'inverno, le strutture di copertura chiuse creano un corridoio ancora più stretto

Qualcuno ha avuto esperienze simili? Credo che il minimo dovrebbe essere portato a **2m** e che i controlli debbano essere più frequenti.`,
    postType: 'discussion',
  },
  {
    provision: 'Public Space Occupation Permits (Dehors)',
    author: 'luca',
    title: 'Proposta: canoni differenziati per zone della città',
    body: `Attualmente il canone per i dehors è di €15-30/m²/mese. Propongo un sistema più granulare:

| Zona | Canone proposto | Canone attuale |
|---|---|---|
| Centro storico (Duomo, Brera) | €50/m² | €30/m² |
| Semi-centro | €25/m² | €20/m² |
| Periferia | €10/m² | €15/m² |

**Motivazione:**
- I dehors in centro hanno un valore commerciale molto più alto
- I ristoranti in periferia hanno margini più bassi
- Il canone attuale non riflette il vero valore dello spazio pubblico nelle zone pregiate

I maggiori introiti dal centro potrebbero finanziare programmi di riqualificazione nelle periferie.`,
    postType: 'proposal',
  },
  {
    provision: 'Public Space Occupation Permits (Dehors)',
    author: 'paolo',
    title: 'Dopo il COVID, rendere permanenti le espansioni?',
    body: `Durante il COVID, molti ristoranti hanno ottenuto permessi temporanei per espandere i dehors su strade e piazze normalmente non disponibili. Molte di queste espansioni sono ancora in vigore.

La domanda è: dovremmo renderle permanenti?

Da un lato, hanno rivitalizzato quartieri interi. Dall'altro, hanno ridotto spazi per pedoni e parcheggi.

Sarei curioso di sentire opinioni sia da ristoratori che da residenti.`,
    postType: 'question',
  },
]

export const discussionComments = [
  // Comments on "Metro Linea 4" post (index 0)
  {
    postIndex: 0,
    author: 'giulia',
    body: 'Confermo, dalla zona Forlanini il M4 ha ridotto il mio pendolarismo di 25 minuti. Però il collegamento bus dalla fermata M4 Repetti verso Rogoredo è pessimo, passa ogni 20 minuti.',
    depth: 0,
  },
  {
    postIndex: 0,
    author: 'luca',
    body: 'ATM ha pubblicato dati interessanti: le nuove fermate M4 hanno visto un aumento del 15% di utenza nel primo trimestre. Ma concordo che il feeder bus service va potenziato.',
    depth: 0,
  },
  {
    postIndex: 0,
    parentCommentIndex: 0,
    author: 'marco',
    body: 'Il collegamento Repetti-Rogoredo è effettivamente critico. Ho scritto ad ATM tramite il portale reclami e mi hanno risposto che stanno valutando una nuova linea bus per Q2 2026.',
    depth: 1,
  },
  {
    postIndex: 0,
    parentCommentIndex: 0,
    author: 'anna',
    body: 'Lo stesso problema esiste dalla fermata Linate Aeroporto verso la zona industriale di Segrate. Il bus 73 non basta.',
    depth: 1,
  },
  {
    postIndex: 0,
    author: 'paolo',
    body: 'Non dimentichiamo che M4 ha anche ridotto il traffico sulla Tangenziale Est. I dati ANAS mostrano un calo del 12% negli ultimi 6 mesi.',
    depth: 0,
  },

  // Comments on "Abbonamento unico regionale" post (index 1)
  {
    postIndex: 1,
    author: 'anna',
    body: 'Idea eccellente. Come pendolare Milano-Bergamo spendo €128/mese tra ATM e Trenord. Un unico abbonamento a €120 sarebbe un risparmio e una semplificazione enorme.',
    depth: 0,
  },
  {
    postIndex: 1,
    author: 'paolo',
    body: 'Attenzione: Trenord e ATM hanno sistemi tariffari e informatici completamente diversi. L\'integrazione tecnica sarebbe complessa. Forse meglio iniziare con un "biglietto giornaliero integrato".',
    depth: 0,
  },
  {
    postIndex: 1,
    parentCommentIndex: 6,
    author: 'giulia',
    body: 'Giusto, ma la complessità tecnica non dovrebbe essere una scusa. La Svizzera ha lo Swiss Pass che integra treni, bus, battelli e funivie. Se ce la fanno loro, possiamo farcela anche noi.',
    depth: 1,
  },
  {
    postIndex: 1,
    author: 'marco',
    body: 'Il modello tedesco del Deutschlandticket a €49/mese per tutti i trasporti regionali potrebbe essere un riferimento ancora migliore. Certo, richiede un forte contributo federale/regionale.',
    depth: 0,
  },

  // Comments on "Area C 7 giorni" post (index 4)
  {
    postIndex: 4,
    author: 'giulia',
    body: 'Come residente del centro, sono favorevole. Il weekend prima era un inferno di traffico con gente che arrivava in auto per lo shopping. Ora i Navigli sono molto più vivibili.',
    depth: 0,
  },
  {
    postIndex: 4,
    author: 'luca',
    body: 'Da commerciante in via Torino, ho visto un calo del 15% delle vendite nel weekend dal primo mese. I clienti dalla provincia non vengono più. Servono compensazioni.',
    depth: 0,
  },
  {
    postIndex: 4,
    parentCommentIndex: 11,
    author: 'paolo',
    body: 'I dati di Confcommercio mostrano che il calo è temporaneo. Quando Stoccolma ha introdotto il congestion charge, i commercianti hanno protestato ma dopo 2 anni le vendite erano tornate ai livelli precedenti.',
    depth: 1,
  },

  // Comments on "Dehors e accessibilità" post (index 7)
  {
    postIndex: 7,
    author: 'anna',
    body: 'Assolutamente d\'accordo. Mia madre usa un deambulatore e in via Paolo Sarpi è quasi impossibile passare in certi tratti. I 1.5m sono teorici, nella pratica il passaggio è spesso di 80cm.',
    depth: 0,
  },
  {
    postIndex: 7,
    author: 'paolo',
    body: 'Come ristoratore, capisco il problema ma aumentare il minimo a 2m significherebbe perdere 2-3 tavoli per molti di noi. Forse la soluzione è un controllo più rigoroso dei 1.5m attuali?',
    depth: 0,
  },
  {
    postIndex: 7,
    parentCommentIndex: 14,
    author: 'giulia',
    body: 'Capisco la vostra posizione, ma l\'accessibilità non è negoziabile. Se non c\'è spazio per 2m di passaggio, il dehors dovrebbe essere ridotto. Lo spazio pubblico è di tutti.',
    depth: 1,
  },

  // Comments on "Canoni differenziati" post (index 8)
  {
    postIndex: 8,
    author: 'marco',
    body: 'La proposta ha senso economico. Un tavolo da 4 in Piazza Duomo genera ricavi incomparabilmente superiori a uno in Via Padova. I canoni dovrebbero riflettere questo.',
    depth: 0,
  },
  {
    postIndex: 8,
    author: 'anna',
    body: 'Rischio: canoni troppo alti in centro spingerebbero via i piccoli ristoratori a favore delle catene. Bisognerebbe prevedere agevolazioni per le attività storiche.',
    depth: 0,
  },
]

// Votes on posts (upvotes)
export const discussionPostVotes = [
  // Metro Linea 4 post gets many votes
  { postIndex: 0, voter: 'giulia' },
  { postIndex: 0, voter: 'anna' },
  { postIndex: 0, voter: 'paolo' },
  { postIndex: 0, voter: 'luca' },
  // Abbonamento unico proposal
  { postIndex: 1, voter: 'marco' },
  { postIndex: 1, voter: 'anna' },
  { postIndex: 1, voter: 'paolo' },
  { postIndex: 1, voter: 'luca' },
  // Servizio notturno question
  { postIndex: 2, voter: 'marco' },
  { postIndex: 2, voter: 'giulia' },
  { postIndex: 2, voter: 'paolo' },
  // Analisi ATM
  { postIndex: 3, voter: 'giulia' },
  { postIndex: 3, voter: 'luca' },
  // Area C 7 giorni
  { postIndex: 4, voter: 'anna' },
  { postIndex: 4, voter: 'giulia' },
  { postIndex: 4, voter: 'luca' },
  // Esenzione redditi bassi proposal
  { postIndex: 5, voter: 'marco' },
  { postIndex: 5, voter: 'giulia' },
  { postIndex: 5, voter: 'luca' },
  { postIndex: 5, voter: 'paolo' },
  // Analisi traffico spostato
  { postIndex: 6, voter: 'paolo' },
  { postIndex: 6, voter: 'giulia' },
  // Dehors e accessibilità
  { postIndex: 7, voter: 'marco' },
  { postIndex: 7, voter: 'anna' },
  { postIndex: 7, voter: 'luca' },
  // Canoni differenziati proposal
  { postIndex: 8, voter: 'giulia' },
  { postIndex: 8, voter: 'anna' },
  // Espansioni COVID
  { postIndex: 9, voter: 'marco' },
  { postIndex: 9, voter: 'anna' },
]

// Proposal votes (only on proposal-type posts: indices 1, 5, 8)
export const discussionProposalVotes = [
  // "Abbonamento unico regionale" (post index 1)
  { postIndex: 1, voter: 'marco', position: 'agree' },
  { postIndex: 1, voter: 'anna', position: 'agree' },
  { postIndex: 1, voter: 'paolo', position: 'disagree' },
  { postIndex: 1, voter: 'luca', position: 'agree' },

  // "Esenzione redditi bassi" (post index 5)
  { postIndex: 5, voter: 'marco', position: 'agree' },
  { postIndex: 5, voter: 'giulia', position: 'agree' },
  { postIndex: 5, voter: 'luca', position: 'abstain' },
  { postIndex: 5, voter: 'paolo', position: 'agree' },

  // "Canoni differenziati" (post index 8)
  { postIndex: 8, voter: 'marco', position: 'agree' },
  { postIndex: 8, voter: 'giulia', position: 'agree' },
  { postIndex: 8, voter: 'anna', position: 'disagree' },
  { postIndex: 8, voter: 'paolo', position: 'abstain' },
]
