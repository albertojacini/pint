'use client'

import { useState, type ReactNode } from 'react'
import { Box } from '@/components/custom-ui/box'
import { Muted } from '@/components/custom-ui/typography'

// ============================================================================
// Types
// ============================================================================

type StakeholderId =
  | 'cittadino'
  | 'avvocato'
  | 'imputato'
  | 'vittima'
  | 'magistrato'
  | 'maggioranza'
  | 'opposizione'

type DimensionId = 'imparzialita' | 'indipendenza' | 'efficienza' | 'autogoverno'

type Position = 'positive' | 'neutral' | 'negative' | null

interface DimensionPole {
  label: string
  consequences: Record<StakeholderId, string>
}

interface CausalChain {
  objectiveData: string[]
  possibleEffects: string[]
  possibleOutcomes: string[]
}

interface Dimension {
  id: DimensionId
  number: number
  title: string
  question: string
  description: string
  reformComponent: string
  causalChain: CausalChain
  positive: DimensionPole
  negative: DimensionPole
  positionLabels: [string, string, string] // [positive, neutral, negative]
  debate: ReactNode
  mechanisms: ReactNode
  precedents: ReactNode
}

// ============================================================================
// Data: Stakeholders
// ============================================================================

const stakeholders: Array<{ id: StakeholderId; label: string; short: string }> = [
  { id: 'cittadino', label: 'Cittadino comune', short: 'Cittadino' },
  { id: 'avvocato', label: 'Avvocato / professionista legale', short: 'Avvocato' },
  { id: 'imputato', label: 'Imputato in un processo penale', short: 'Imputato' },
  { id: 'vittima', label: 'Vittima di reato', short: 'Vittima' },
  { id: 'magistrato', label: 'Magistrato', short: 'Magistrato' },
  { id: 'maggioranza', label: 'Politico di maggioranza', short: 'Maggioranza' },
  { id: 'opposizione', label: 'Politico di opposizione', short: 'Opposizione' },
]

// ============================================================================
// Data: Dimensions
// ============================================================================

const dimensions: Dimension[] = [
  {
    id: 'imparzialita',
    number: 1,
    title: 'Imparzialità del processo',
    question: 'La separazione delle carriere rende i processi più imparziali?',
    description:
      'La riforma separa definitivamente le carriere di giudici e PM. Il giudice non avrà mai fatto il PM e viceversa. L\u2019Art. 111 (giusto processo) richiede un giudice terzo e imparziale.',
    reformComponent: 'Separazione delle carriere (Art. 102)',
    causalChain: {
      objectiveData: [
        'La riforma introduce due concorsi separati per giudici e PM (Art. 102)',
        'Oggi i passaggi di funzione sono lo 0,5% dopo la riforma Cartabia (2022)',
        'Il tasso di assoluzione in Italia è ~45%, tra i più alti in Europa',
        'L\u2019Art. 111 (giusto processo) richiede già un giudice terzo e imparziale',
      ],
      possibleEffects: [
        'Il giudice non ha mai svolto funzioni requirenti e viceversa',
        'Si formano due culture professionali separate fin dall\u2019inizio della carriera',
        'Il PM perde la prospettiva giudicante (e il giudice quella requirente)',
        'La percezione pubblica di imparzialità potrebbe migliorare anche senza cambiamenti sostanziali',
      ],
      possibleOutcomes: [
        'L\u2019imparzialità migliora sensibilmente — il giusto processo diventa più concreto',
        'L\u2019imparzialità migliora nella percezione pubblica, ma non nella sostanza',
        'L\u2019imparzialità rimane sostanzialmente invariata — il problema era già risolto',
        'L\u2019imparzialità peggiora — PM autoreferenziali diventano più aggressivi (\u201cipertrofia dell\u2019accusa\u201d)',
      ],
    },
    positionLabels: ['Migliora', 'Non cambia', 'Peggiora'],
    positive: {
      label: 'Processi più imparziali',
      consequences: {
        cittadino:
          'Il giudice che decide il tuo caso è strutturalmente distante dall\u2019accusa. Maggiore fiducia che il processo sia equilibrato.',
        avvocato:
          'Parità delle armi rafforzata: il PM non condivide più cultura e carriera con il giudice. La difesa parte da una posizione più equilibrata, come previsto dall\u2019Art. 111.',
        imputato:
          'Il giudice non ha mai fatto il PM e non tornerà a farlo. Minore rischio di bias pro-accusa nel tuo processo.',
        vittima:
          'Processi più imparziali significano condanne più credibili. Se il giudice è strutturalmente indipendente dall\u2019accusa, la sentenza è più solida.',
        magistrato:
          'Due identità professionali distinte e chiare. Chi giudica e chi accusa hanno formazione, cultura e percorso diversi fin dall\u2019inizio.',
        maggioranza:
          'La promessa centrale della riforma è mantenuta: il giusto processo diventa più concreto. L\u2019Art. 111 trova piena attuazione.',
        opposizione:
          'Se i processi diventano effettivamente più imparziali, la riforma ha prodotto un risultato positivo difficile da contestare.',
      },
    },
    negative: {
      label: 'Cambia poco, o peggiora',
      consequences: {
        cittadino:
          'I passaggi di funzione erano già lo 0,5% dopo la Cartabia. La separazione formalizza qualcosa che nella pratica non esisteva più. Nessun cambiamento percepibile.',
        avvocato:
          'La vicinanza giudice-PM non dipendeva dai passaggi di carriera (quasi inesistenti) ma dalla cultura giudiziaria condivisa. La separazione formale non cambia le dinamiche in aula.',
        imputato:
          'Se il bias pro-accusa non derivava dalla carriera comune (il tasso di assoluzione italiano è ~45%, tra i più alti d\u2019Europa), la separazione non risolve il problema.',
        vittima:
          'Silvestri avverte di un rischio opposto: PM separati e autoreferenziali potrebbero orientarsi verso la condanna a tutti i costi (\u201cipertrofia dell\u2019accusa\u201d), degradando la qualità dell\u2019azione penale.',
        magistrato:
          'La separazione impedisce un\u2019esperienza formativa che arricchiva entrambe le funzioni. Un giudice che ha fatto il PM capisce meglio le indagini. Un PM che ha giudicato capisce meglio il peso delle prove.',
        maggioranza:
          'Se la separazione non produce cambiamenti percepibili, la riforma costituzionale appare sproporzionata rispetto al problema (già risolto dalla Cartabia).',
        opposizione:
          'La riforma risolve un problema inesistente (0,5% di passaggi) e rischia di produrre l\u2019effetto opposto: PM più aggressivi e meno equilibrati (Silvestri).',
      },
    },
    debate: (
      <>
        <p>
          <strong>Per il polo positivo.</strong> L&apos;UCPI (Unione Camere Penali) la considera
          &quot;un obiettivo storico&quot;. Spangher (procedura penale, ex CSM) argomenta che la
          separazione rafforza la distinzione tra funzione requirente e giudicante, coerente con il
          modello accusatorio. Il CNF (Consiglio Nazionale Forense) ha aderito all&apos;unanimità
          al comitato per il SI.
        </p>
        <p className="mt-2">
          <strong>Per il polo negativo.</strong> Margherita Cassano (Prima Presidente della Corte
          di Cassazione) cita i dati: solo lo 0,83% dei PM e lo 0,21% dei giudici ha cambiato
          funzione in 5 anni dopo la Cartabia — la riforma formalizza qualcosa che non esiste più.
          Gaetano Silvestri (Presidente emerito, Corte Costituzionale) avverte di
          &quot;ipertrofia dell&apos;accusa e eterogenesi dei fini&quot;: un corpo separato e
          autoreferenziale di PM si orienterebbe verso la condanna anziché l&apos;applicazione
          imparziale della legge.
        </p>
      </>
    ),
    mechanisms: (
      <ul className="list-disc pl-4 space-y-1.5">
        <li>
          <strong>Distanza strutturale.</strong> Due concorsi separati, due percorsi di carriera
          separati. Il giudice non ha mai condiviso l&apos;ambiente professionale del PM. I
          sostenitori ritengono che questo produca un giudice più &quot;terzo&quot;.
        </li>
        <li>
          <strong>Contro-argomento: il dato reale.</strong> I passaggi di funzione erano già
          quasi zero. Il tasso di assoluzione italiano (~45%) non suggerisce un bias sistematico
          pro-accusa. L&apos;imparzialità del giudice dipende da fattori culturali e
          organizzativi più che dalla struttura della carriera.
        </li>
        <li>
          <strong>Il rischio Silvestri.</strong> PM separati, senza la cultura condivisa con i
          giudici, potrebbero diventare più &quot;polizia giudiziaria&quot; che
          &quot;magistrati&quot;. Clementi (La Sapienza) avverte che il PM potrebbe diventare
          &quot;una sorta di estensione della polizia giudiziaria&quot;.
        </li>
      </ul>
    ),
    precedents: (
      <>
        <p>
          La maggior parte dei paesi UE ha carriere separate, ma i modelli sono molto eterogenei
          (Pagella Politica). Il Portogallo è l&apos;unico caso in cui separazione e genuina
          indipendenza del PM coesistono. La Francia ha separazione ma i PM storicamente erano
          sotto l&apos;autorità del Ministro. La Spagna nel 2025 ha trasferito i poteri
          investigativi ai PM — direzione opposta.
        </p>
      </>
    ),
  },
  {
    id: 'indipendenza',
    number: 2,
    title: 'Indipendenza del PM dalla politica',
    question:
      'Il nuovo assetto istituzionale protegge o espone i PM all\u2019influenza politica?',
    description:
      'La riforma crea un CSM requirente separato (1/3 togati sorteggiati, 2/3 da lista parlamentare) e una nuova Alta Corte disciplinare. L\u2019Art. 112 (obbligatorietà dell\u2019azione penale) resta invariato.',
    reformComponent: 'CSM requirente (Art. 104) + Alta Corte (Art. 105)',
    causalChain: {
      objectiveData: [
        'Nuovo CSM requirente: 1/3 togati sorteggiati, 2/3 da lista compilata dal Parlamento',
        'Nuova Alta Corte disciplinare, le cui decisioni non sono impugnabili in Cassazione',
        'L\u2019Art. 112 (obbligatorietà dell\u2019azione penale) resta invariato',
        'Il Presidente della Repubblica presiede entrambi i CSM',
        'Oggi: CSM unico con 2/3 togati eletti, 1/3 laici eletti dal Parlamento',
      ],
      possibleEffects: [
        'La maggioranza parlamentare controlla la composizione della lista dei laici (2/3 del CSM requirente)',
        'L\u2019Alta Corte può sanzionare PM senza possibilità di appello in Cassazione',
        'L\u2019indipendenza del PM è per la prima volta scritta in Costituzione (oggi è solo in legge ordinaria)',
        'Le leggi attuative (a maggioranza semplice) definiranno i dettagli chiave: priorità azione penale, regole disciplinari, procedure sorteggio',
      ],
      possibleOutcomes: [
        'L\u2019indipendenza si rafforza — garanzie costituzionali più solide di oggi',
        'L\u2019indipendenza rimane sostanzialmente invariata — le garanzie formali compensano i rischi strutturali',
        'L\u2019indipendenza si indebolisce gradualmente — effetto intimidatorio e autocensura dei PM',
        'L\u2019indipendenza viene compromessa — il PM diventa sensibile alla politica (modello Francia pre-2013)',
      ],
    },
    positionLabels: ['Si rafforza', 'Non cambia', 'Si indebolisce'],
    positive: {
      label: 'PM più protetti',
      consequences: {
        cittadino:
          'L\u2019indipendenza del PM viene costituzionalizzata (nuovo Art. 104) — oggi è protetta solo da legge ordinaria. L\u2019Art. 112 resta invariato. Le garanzie sono più forti di prima.',
        avvocato:
          'Il PM mantiene piena autonomia investigativa con garanzie di rango costituzionale. L\u2019obbligatorietà dell\u2019azione penale resta. Il Presidente della Repubblica presiede entrambi i CSM.',
        imputato:
          'Il PM che indaga il tuo caso ha garanzie costituzionali esplicite di indipendenza. Non può essere influenzato dal governo. L\u2019azione penale resta obbligatoria.',
        vittima:
          'Il PM è costituzionalmente indipendente e deve perseguire i reati. Nessuna pressione politica può rallentare o bloccare l\u2019indagine sul tuo caso.',
        magistrato:
          'L\u2019indipendenza del PM passa da protezione legislativa a protezione costituzionale. Per subordinare i PM alla politica servirebbero ulteriori modifiche costituzionali esplicite.',
        maggioranza:
          'La riforma dimostra che l\u2019obiettivo non era controllare i PM ma riformare la governance. Le garanzie costituzionali sono più forti di prima. Barbera conferma: nessun meccanismo di subordinazione nel testo.',
        opposizione:
          'Se le garanzie costituzionali reggono, i timori erano infondati. Il PM resta indipendente con protezioni persino più forti.',
      },
    },
    negative: {
      label: 'PM più esposti',
      consequences: {
        cittadino:
          'I PM potrebbero diventare più sensibili alle pressioni politiche — non per ordini espliciti, ma per incentivi strutturali. Le indagini sui potenti rischiano di essere meno incisive.',
        avvocato:
          'Rischio di azione penale politicamente orientata. Il CSM requirente con 2/3 da lista parlamentare riduce l\u2019autogoverno. L\u2019equilibrio del giusto processo si sposta, ma non necessariamente a favore della difesa.',
        imputato:
          'Se il tuo caso ha rilevanza politica, il PM potrebbe subire pressioni — in entrambe le direzioni. L\u2019Alta Corte disciplinare senza appello in Cassazione è un\u2019arma potenziale.',
        vittima:
          'Se il reato coinvolge figure politiche, l\u2019azione penale potrebbe essere rallentata. L\u2019Alta Corte disciplinare può intimidire PM che indagano casi scomodi.',
        magistrato:
          'Il CSM requirente ha solo 1/3 di togati (invertendo la proporzione attuale). L\u2019Alta Corte disciplinare può diventare strumento di pressione. L\u2019effetto intimidatorio riduce l\u2019autonomia senza bisogno di ordini espliciti.',
        maggioranza:
          'Influenza crescente sull\u2019azione penale attraverso la composizione della lista parlamentare. Ma come avverte Silvestri: \u201cla maggioranza di oggi diventa l\u2019opposizione di domani\u201d.',
        opposizione:
          'La separazione era un cavallo di Troia. MEDEL, la Commissione Europea e numerosi costituzionalisti avevano avvertito. Il danno è difficile da invertire — una modifica costituzionale è praticamente irreversibile.',
      },
    },
    debate: (
      <>
        <p>
          <strong>Per il polo positivo.</strong> Augusto Barbera (Presidente emerito, Corte
          Costituzionale) sostiene che nel testo &quot;non c&apos;è alcun elemento che possa
          giustificare la subordinazione dei PM alla politica&quot;. Cazzola (il Mulino) argomenta
          che la riforma eleva le garanzie di indipendenza del PM da legge ordinaria a rango
          costituzionale. L&apos;Art. 112 resta invariato. Il Presidente della Repubblica
          presiede entrambi i CSM.
        </p>
        <p className="mt-2">
          <strong>Per il polo negativo.</strong> L&apos;ANM (96% dei magistrati, inclusa
          Magistratura Indipendente, tradizionalmente vicina al centrodestra) avverte che la
          separazione &quot;espone il PM a logiche gerarchiche o influenze esterne&quot;. MEDEL
          (18.000 magistrati da 16 paesi) dichiara che la riforma &quot;elimina il principio
          dell&apos;unità della magistratura, aprendo la porta al controllo esterno&quot;. La
          Commissione Europea (Rule of Law Report 2025) segnala che &quot;isolare il servizio del
          PM è spesso vulnerabile alla politicizzazione&quot;. Il CSM stesso ha votato un parere
          negativo (24 voti). Silvestri avverte di &quot;eterogenesi dei fini&quot;. Schlein (PD):
          &quot;tentativo di sfuggire ai controlli&quot;. Conte (M5S): &quot;disegno pericoloso
          per demolire l&apos;equilibrio dei poteri&quot;.
        </p>
      </>
    ),
    mechanisms: (
      <ul className="list-disc pl-4 space-y-1.5">
        <li>
          <strong>Composizione del CSM requirente.</strong> 1/3 togati sorteggiati, 2/3 da lista
          compilata dal Parlamento. La maggioranza politica controlla chi finisce nella lista. Se
          le leggi attuative non richiedono una maggioranza qualificata per la compilazione,
          l&apos;intera componente laica dipende dal governo.
        </li>
        <li>
          <strong>Alta Corte disciplinare.</strong> Le sue decisioni non sono impugnabili in
          Cassazione (rimuovendo una garanzia oggi esistente). La Commissione Europea avverte del
          rischio di &quot;strumentalizzazione dei procedimenti disciplinari&quot;. La
          giurisdizione su condotte che &quot;compromettono indipendenza e imparzialità&quot; è
          vaga e potrebbe creare un effetto intimidatorio.
        </li>
        <li>
          <strong>Delega in bianco alla legge ordinaria.</strong> Il testo costituzionale è scarno
          sui dettagli attuativi. Le leggi ordinarie (maggioranza semplice) definiranno: priorità
          dell&apos;azione penale, regole disciplinari, procedure del sorteggio, rapporto PM-esecutivo.
          Come avverte il giudice Morosini: questo dà &quot;a maggioranze mutevoli il potere di
          modellare l&apos;azione penale&quot;.
        </li>
        <li>
          <strong>Contro-argomento: garanzie nel testo.</strong> L&apos;Art. 112 resta invariato.
          Il Presidente della Repubblica presiede entrambi i CSM. Per subordinare i PM
          servirebbero modifiche costituzionali esplicite che questa riforma non contiene
          (Barbera).
        </li>
      </ul>
    ),
    precedents: (
      <>
        <p>
          <strong>Polonia</strong> (il precedente più citato). La riforma del 2016 ha eliminato
          l&apos;indipendenza dei PM: riassegnazione discrezionale dei casi, procedimenti
          disciplinari contro PM dissidenti. L&apos;UE ha sanzionato la Polonia. Non direttamente
          comparabile, ma dimostra che chi controlla il disciplinare ha un potere enorme.
        </p>
        <p className="mt-2">
          <strong>Francia.</strong> Separazione storica, ma i PM sono rimasti sotto il Ministro
          della Giustizia. Solo nel 2013 una legge ha vietato istruzioni sui singoli casi.
          <strong> Germania.</strong> PM completamente subordinati al Ministro. Nel 2019 la CGUE
          ha stabilito che non possono essere considerati &quot;autorità giudiziaria&quot;.
        </p>
        <p className="mt-2">
          Barbera e Cazzola contestano la comparabilità: Francia e Germania hanno norme esplicite
          di subordinazione che la riforma italiana non contiene.
        </p>
      </>
    ),
  },
  {
    id: 'efficienza',
    number: 3,
    title: 'Efficienza del sistema',
    question:
      'Lo sdoppiamento degli organi di governo migliora o peggiora il funzionamento della giustizia?',
    description:
      'La riforma crea due CSM separati (uno per giudici, uno per PM) e una nuova Alta Corte disciplinare. Oggi c\u2019è un solo CSM che gestisce l\u2019intero sistema e un\u2019unica sezione disciplinare.',
    reformComponent: 'Due CSM (Art. 104) + Alta Corte disciplinare (Art. 105)',
    causalChain: {
      objectiveData: [
        'Oggi: un CSM unico gestisce l\u2019intero sistema giudiziario',
        'Proposta: due CSM separati (giudicante e requirente) + Alta Corte disciplinare',
        'L\u2019Alta Corte gestirà ~75 casi/anno con un costo stimato di ~20M\u20AC/anno (Maruotti, ANM)',
        'L\u2019Italia ha tra i tempi processuali più lunghi d\u2019Europa',
        'Il testo non prevede meccanismi di coordinamento tra i due CSM',
      ],
      possibleEffects: [
        'Duplicazione di strutture amministrative, sedi, organici, sistemi IT',
        'Ciascun CSM si specializza sulla propria funzione (giudicante o requirente)',
        'Nessun organo ha più una visione d\u2019insieme del sistema giustizia',
        'Possibili conflitti di competenza tra i due CSM su materie sovrapposte',
      ],
      possibleOutcomes: [
        'L\u2019efficienza migliora — due organi specializzati governano meglio di uno generalista',
        'L\u2019efficienza rimane sostanzialmente invariata — costi e benefici si compensano',
        'L\u2019efficienza peggiora — doppia burocrazia, costi maggiori, tempi più lunghi',
        'L\u2019efficienza peggiora molto — conflitti tra organi e frammentazione paralizzante (modello Titolo V)',
      ],
    },
    positionLabels: ['Migliora', 'Non cambia', 'Peggiora'],
    positive: {
      label: 'Sistema più efficiente',
      consequences: {
        cittadino:
          'Due organi specializzati funzionano meglio di uno generalista. Ogni CSM può concentrarsi sulle specificità della propria funzione. La giustizia è meglio governata.',
        avvocato:
          'CSM specializzati significano governance più mirata. Le nomine e promozioni sono decise da chi conosce le specificità della funzione (giudicante o requirente).',
        imputato:
          'Un sistema meglio governato produce processi più ordinati. I magistrati sono gestiti da organi che comprendono le specificità del loro lavoro.',
        vittima:
          'Un sistema più efficiente accelera i tempi della giustizia. Le indagini e i processi sono gestiti con maggiore competenza settoriale.',
        magistrato:
          'Un CSM dedicato alla tua funzione capisce meglio le tue esigenze professionali. Le decisioni su carriera, assegnazioni e trasferimenti sono più informate.',
        maggioranza:
          'La specializzazione degli organi di governance migliora la qualità delle decisioni. Il sistema è più moderno e razionale.',
        opposizione:
          'Se lo sdoppiamento produce effettivamente governance migliore, il merito va riconosciuto.',
      },
    },
    negative: {
      label: 'Doppia burocrazia',
      consequences: {
        cittadino:
          'Due burocrazie dove prima ce n\u2019era una, più una nuova Alta Corte per ~75 casi/anno (~20M\u20AC/anno). I tempi della giustizia, già tra i più lunghi d\u2019Europa, rischiano di allungarsi.',
        avvocato:
          'Più interlocutori istituzionali, più complicazioni procedurali. Nessun meccanismo previsto per risolvere conflitti tra i due CSM. Il sistema diventa più opaco.',
        imputato:
          'Processi più lunghi significano più tempo in attesa di giudizio. Se sei in custodia cautelare, il peso è ancora maggiore.',
        vittima:
          'Tempi più lunghi per arrivare a una sentenza. La giustizia ritardata è giustizia negata. Bruti Liberati descrive il CSM come \u201cframmentato in due organi non comunicanti\u201d.',
        magistrato:
          'Due CSM più piccoli con meno risorse e meno autorevolezza. Zanon avverte che si creano \u201cnuove occasioni per distribuire incarichi e posizioni di potere\u201d. Più burocrazia, meno supporto.',
        maggioranza:
          'La riforma diventa un boomerang: il sistema funziona peggio di prima. L\u2019opinione pubblica associa il peggioramento al governo che l\u2019ha voluta.',
        opposizione:
          'I cittadini sperimentano direttamente il peggioramento dei tempi della giustizia. La riforma del Titolo V (2001) è il precedente: sdoppiamento che produce più conflitti che benefici.',
      },
    },
    debate: (
      <>
        <p>
          <strong>Per il polo positivo.</strong> Il governo argomenta che due CSM specializzati
          sono più efficaci di uno generalista. Ogni organo può concentrarsi sulle specificità
          della propria funzione. La separazione porta chiarezza organizzativa.
        </p>
        <p className="mt-2">
          <strong>Per il polo negativo.</strong> Nicolò Zanon (Associazione Italiana dei
          Costituzionalisti) nota un paradosso: creare un CSM separato per i PM
          &quot;consacra la funzione requirente al più alto livello istituzionale&quot; anziché
          separarla. Si chiede se sarà &quot;facile per il Ministro confrontarsi con due CSM&quot;.
          Propone come alternativa un singolo CSM diviso in sezioni (legge ordinaria). Il CSM
          stesso (parere negativo) identifica &quot;problemi nel rapporto tra competenze dei due
          organi, risoluzione di conflitti, mancanza di visione unitaria&quot;. Bruti Liberati
          (ex Procuratore Capo di Milano): &quot;eliminazione sostanziale del CSM: frammentato in
          due organi non comunicanti&quot;. Maruotti (ANM): l&apos;Alta Corte costerebbe
          ~20M\u20AC/anno per ~75 casi.
        </p>
      </>
    ),
    mechanisms: (
      <ul className="list-disc pl-4 space-y-1.5">
        <li>
          <strong>Duplicazione delle risorse.</strong> Sedi separate, organici separati, sistemi
          amministrativi e IT separati per ciascun CSM. Più la nuova Alta Corte con propria
          struttura.
        </li>
        <li>
          <strong>Vuoto nel coordinamento.</strong> Il testo costituzionale non prevede alcun
          meccanismo per risolvere conflitti tra i due CSM su materie sovrapposte (assegnazioni
          temporanee, uffici giudiziari che condividono edifici e risorse).
        </li>
        <li>
          <strong>Perdita della visione sistemica.</strong> Un CSM unico valutava il sistema
          giustizia nel suo complesso. Due organi separati ne vedono ciascuno solo metà.
        </li>
        <li>
          <strong>Contro-argomento: specializzazione.</strong> Due organi più piccoli ma
          focalizzati possono essere più efficaci di uno grande e generalista. La suddivisione
          per funzione è un principio organizzativo standard.
        </li>
      </ul>
    ),
    precedents: (
      <>
        <p>
          <strong>Riforma del Titolo V (2001).</strong> Il precedente italiano più citato. La
          suddivisione delle competenze Stato-Regioni senza meccanismi di coordinamento adeguati
          portò a un&apos;esplosione di contenziosi alla Corte Costituzionale. Zanon nota che le
          argomentazioni sono prevalentemente strutturali, ma la storia istituzionale italiana
          offre numerosi casi di frammentazione che produce inefficienza.
        </p>
        <p className="mt-2">
          Non esistono molti precedenti internazionali diretti per la transizione da un organo
          unificato di autogoverno a due separati.
        </p>
      </>
    ),
  },
  {
    id: 'autogoverno',
    number: 4,
    title: 'Qualità dell\u2019autogoverno',
    question:
      'Il sorteggio migliora la governance del CSM eliminando le correnti, o la peggiora?',
    description:
      'La riforma sostituisce l\u2019elezione dei membri del CSM con il sorteggio. I togati passano da 2/3 eletti a 1/3 sorteggiati. I laici passano da 1/3 eletti dal Parlamento a 2/3 sorteggiati da una lista parlamentare.',
    reformComponent: 'Sorteggio + inversione quota togati/laici (Art. 104)',
    causalChain: {
      objectiveData: [
        'Oggi: CSM con 2/3 togati eletti, organizzati in correnti con programmi pubblici',
        'Proposta: 1/3 togati sorteggiati, 2/3 laici da lista parlamentare',
        'Scandalo Palamara (2019): documentò logiche di scambio tra correnti per nomine',
        'Mandato di 4 anni, non immediatamente ripetibile',
        'Il sorteggio per concorsi universitari (2008) non ha prodotto miglioramenti misurabili (studio Senato 2017)',
      ],
      possibleEffects: [
        'Eliminazione della competizione elettorale tra correnti nel CSM',
        'Perdita della memoria istituzionale (mandati brevi, non ripetibili)',
        'Il personale burocratico permanente acquisisce più peso relativo',
        'La lista parlamentare filtra chi può essere sorteggiato tra i laici (2/3)',
      ],
      possibleOutcomes: [
        'L\u2019autogoverno migliora — correnti eliminate, nomine basate sul merito',
        'L\u2019autogoverno rimane sostanzialmente invariato — le correnti si riorganizzano in altre forme',
        'L\u2019autogoverno peggiora — organi più deboli, meno autorevoli, meno competenti',
        'L\u2019autogoverno viene svuotato — togati ridotti a 1/3, il Parlamento controlla di fatto la governance',
      ],
    },
    positionLabels: ['Migliora', 'Non cambia', 'Peggiora'],
    positive: {
      label: 'Correnti eliminate',
      consequences: {
        cittadino:
          'Il CSM non è più ostaggio delle correnti. Nomine e promozioni dei magistrati non dipendono più da logiche di appartenenza ma dal merito. Lo scandalo Palamara non si ripete.',
        avvocato:
          'La fine del correntismo significa che le assegnazioni dei magistrati sono più meritocratiche. Il sistema diventa più prevedibile e meno influenzato da logiche di potere interno.',
        imputato:
          'Il magistrato che gestisce il tuo caso è stato assegnato per competenza, non per logiche correntiste. Il rischio che la tua sorte dipenda da equilibri interni alla magistratura si riduce.',
        vittima:
          'Un CSM meritocratico assegna magistrati competenti ai casi giusti. L\u2019azione penale è gestita da PM scelti per capacità, non per appartenenza.',
        magistrato:
          'La tua carriera non dipende più dall\u2019appartenenza a una corrente. Nomine, trasferimenti e promozioni sono basati sul merito. Il sorteggio elimina le dinamiche di potere interne.',
        maggioranza:
          'Il correntismo — documentato dallo scandalo Palamara — è eliminato. La riforma mantiene la promessa di un CSM libero da logiche di fazione.',
        opposizione:
          'Se il sorteggio funziona e produce un CSM più meritocratico, il merito va riconosciuto.',
      },
    },
    negative: {
      label: 'Correnti mutano, governance peggiora',
      consequences: {
        cittadino:
          'Le correnti non spariscono — si riorganizzano in reti informali più opache e meno controllabili. Lo scandalo Palamara non si ripete nella stessa forma, ma le dinamiche di potere trovano nuovi canali.',
        avvocato:
          'Senza le correnti (gruppi trasparenti con programmi pubblici), l\u2019influenza si sposta su reti personali opache. Il sistema diventa meno leggibile, non più pulito.',
        imputato:
          'I problemi di governance del CSM non spariscono, cambiano solo forma. Il magistrato che gestisce il tuo caso è comunque soggetto a dinamiche di potere — solo meno visibili.',
        vittima:
          'Se il sorteggio non migliora realmente la qualità della governance, le disfunzioni del sistema restano. La riforma universitaria del 2008 (sorteggio per i concorsi) non ha prodotto miglioramenti misurabili.',
        magistrato:
          'Il sorteggio erode la memoria istituzionale (mandati di 4 anni, non ripetibili). Il personale burocratico permanente guadagna influenza sproporzionata. L\u2019autogoverno perde sostanza.',
        maggioranza:
          'Il sorteggio non elimina il correntismo — lo rende opaco. Vittoria formale ma nessun cambiamento sostanziale. Il precedente del sorteggio universitario (2008) è un monito.',
        opposizione:
          'Il sorteggio era una promessa vuota. Le correnti si riorganizzano. In più, la quota di togati scende da 2/3 a 1/3 — l\u2019autogoverno della magistratura si riduce.',
      },
    },
    debate: (
      <>
        <p>
          <strong>Per il polo positivo.</strong> Il governo cita lo scandalo Palamara come prova
          che il sistema elettorale del CSM era corrotto. Nordio lo definisce un
          &quot;verminaio correntizio&quot; e un meccanismo &quot;para-mafioso&quot;. Il sorteggio
          elimina la competizione elettorale e quindi le correnti che la organizzano.
        </p>
        <p className="mt-2">
          <strong>Per il polo negativo.</strong> Giuseppe Santalucia (Giustizia Insieme) offre
          l&apos;analisi più dettagliata: rimuovere la responsabilità elettorale non previene il
          correntismo — lo redistribuisce. Senza strutture di gruppo trasparenti, i magistrati
          costruiscono &quot;reti clientelari personali&quot; senza &quot;obbligo di rendere conto
          ad alcun corpo collettivo&quot;. Edmondo Bruti Liberati (ex Procuratore Capo di Milano)
          prevede direttamente che le correnti &quot;non spariranno&quot;. Andrea Pertici
          (costituzionalista, Pisa) avverte che il sorteggio potrebbe produrre &quot;organi
          deboli&quot; e che &quot;non elimina le correnti&quot;.
        </p>
      </>
    ),
    mechanisms: (
      <ul className="list-disc pl-4 space-y-1.5">
        <li>
          <strong>Reti informali al posto di quelle formali.</strong> Santalucia: senza le
          correnti (gruppi trasparenti, organizzati, con programmi pubblici), l&apos;influenza si
          sposta su reti personali opache. L&apos;effetto del correntismo persiste, ma diventa
          meno visibile e meno controllabile.
        </li>
        <li>
          <strong>Erosione della memoria istituzionale.</strong> Membri sorteggiati in carica 4
          anni, non immediatamente riselezionabili. La competenza e la continuità si perdono. Il
          personale burocratico permanente guadagna influenza sproporzionata.
        </li>
        <li>
          <strong>Compilazione della lista.</strong> Il Parlamento controlla la lista da cui sono
          sorteggiati i 2/3. Se la lista è curata (legge attuativa a maggioranza semplice),
          la casualità è limitata dal pool.
        </li>
        <li>
          <strong>Contro-argomento: il sistema attuale è peggio.</strong> Le elezioni del CSM
          producevano correnti che funzionavano come partiti, con logiche di scambio documentate
          (Palamara). Il sorteggio, anche imperfetto, spezza queste catene.
        </li>
      </ul>
    ),
    precedents: (
      <>
        <p>
          <strong>Sorteggio nelle università italiane (2008).</strong> Precedente diretto. La
          riforma introdusse il sorteggio per le commissioni di concorso. Uno studio del 2017
          dell&apos;ufficio valutazione del Senato trovò che il meccanismo non riuscì a: migliorare
          la qualità della selezione, ridurre il localismo, o prevenire commissari inadeguati. I
          risultati mostrarono solo un &quot;livellamento verso la qualità media&quot;.
        </p>
        <p className="mt-2">
          <strong>Il pattern della &quot;Costituzione dimenticata&quot;.</strong> La letteratura
          costituzionalistica italiana documenta un pattern persistente di promesse costituzionali
          rimaste inattuate. Il periodo 1948-1970: molte norme programmatiche rimandavano
          l&apos;attuazione al futuro. Alcune hanno richiesto decenni.
        </p>
      </>
    ),
  },
]

// ============================================================================
// Component
// ============================================================================

function CausalChainView({ chain }: { chain: CausalChain }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
      {/* Column 1: Objective data */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1.5">
          Dati oggettivi
        </p>
        <ul className="space-y-1.5">
          {chain.objectiveData.map((item, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-muted-foreground/40 shrink-0 mt-px">·</span>
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Column 2: Possible effects */}
      <div className="relative">
        <span className="hidden sm:block absolute -left-2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/40 text-lg">
          →
        </span>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1.5">
          Possibili effetti
        </p>
        <ul className="space-y-1.5">
          {chain.possibleEffects.map((item, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-muted-foreground/40 shrink-0 mt-px">→</span>
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Column 3: Possible outcomes (ordered best → worst) */}
      <div className="relative">
        <span className="hidden sm:block absolute -left-2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/40 text-lg">
          →
        </span>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1.5">
          Possibili esiti
          <span className="normal-case tracking-normal ml-1">(dal migliore al peggiore)</span>
        </p>
        <ol className="space-y-1.5">
          {chain.possibleOutcomes.map((item, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-muted-foreground/40 shrink-0 mt-px font-mono text-[10px]">
                {i + 1}.
              </span>
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group">
      <summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none">
        {title}
      </summary>
      <div className="mt-2 text-sm space-y-1">{children}</div>
    </details>
  )
}

export function DecisionModel() {
  const [selectedStakeholder, setSelectedStakeholder] = useState<StakeholderId>('cittadino')
  const [positions, setPositions] = useState<Record<DimensionId, Position>>({
    imparzialita: null,
    indipendenza: null,
    efficienza: null,
    autogoverno: null,
  })

  const handlePositionChange = (dimensionId: DimensionId, position: Position) => {
    setPositions((prev) => ({
      ...prev,
      [dimensionId]: prev[dimensionId] === position ? null : position,
    }))
  }

  return (
    <div className="space-y-6">
      {/* Stakeholder selector */}
      <div>
        <p className="text-sm font-medium mb-2">Chi sei?</p>
        <div className="flex flex-wrap gap-1.5">
          {stakeholders.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedStakeholder(s.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedStakeholder === s.id
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {s.short}
            </button>
          ))}
        </div>
        <Muted className="mt-1.5">
          {stakeholders.find((s) => s.id === selectedStakeholder)?.label}
        </Muted>
      </div>

      {/* Dimension cards */}
      <div>
        <p className="text-sm font-medium mb-1">Se vince il SI, cosa succede?</p>
        <Muted className="mb-3">
          La riforma tocca 4 aspetti indipendenti. Per ciascuno, le conseguenze possono andare in
          direzioni diverse. Valutali separatamente.
        </Muted>
        <div className="space-y-3">
          {dimensions.map((dim) => (
            <Box key={dim.id} variant="default" padding="md">
              <div className="space-y-3">
                {/* Header */}
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    {dim.number}. {dim.reformComponent}
                  </span>
                  <p className="text-sm font-medium">{dim.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{dim.question}</p>
                </div>

                {/* Causal chain */}
                <CausalChainView chain={dim.causalChain} />

                {/* Two poles with consequences */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="rounded-md bg-muted/50 p-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1">
                      {dim.positive.label}
                    </p>
                    <p className="text-sm">
                      {dim.positive.consequences[selectedStakeholder]}
                    </p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1">
                      {dim.negative.label}
                    </p>
                    <p className="text-sm">
                      {dim.negative.consequences[selectedStakeholder]}
                    </p>
                  </div>
                </div>

                {/* Position selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 shrink-0">
                    Cosa pensi?
                  </span>
                  <div className="flex gap-1">
                    {(['positive', 'neutral', 'negative'] as const).map((pos, i) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => handlePositionChange(dim.id, pos)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          positions[dim.id] === pos
                            ? 'bg-foreground text-background'
                            : 'text-muted-foreground hover:text-foreground border border-border'
                        }`}
                      >
                        {dim.positionLabels[i]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expandable details */}
                <div className="border-t pt-2.5 space-y-2">
                  <DetailSection title="Il dibattito">{dim.debate}</DetailSection>
                  <DetailSection title="Meccanismi chiave">{dim.mechanisms}</DetailSection>
                  <DetailSection title="Precedenti">{dim.precedents}</DetailSection>
                </div>
              </div>
            </Box>
          ))}
        </div>
      </div>
    </div>
  )
}
