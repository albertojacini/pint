'use client'

import { useState, type ReactNode } from 'react'
import { Box } from '@/components/custom-ui/box'
import { Muted } from '@/components/custom-ui/typography'
import { ExplainerLink } from '@/components/custom-ui/explainer'

// ============================================================================
// Types
// ============================================================================

type DimensionId = 'imparzialita' | 'indipendenza' | 'efficienza' | 'autogoverno'

type Position = 'positive' | 'neutral' | 'negative' | null

interface CausalChain {
  objectiveData: ReactNode[]
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
  positionLabels: [string, string, string] // [positive, neutral, negative]
  debate: ReactNode
  mechanisms: ReactNode
  precedents: ReactNode
}

// ============================================================================
// Data: Dimensions
// ============================================================================

const dimensions: Dimension[] = [
  {
    id: 'imparzialita',
    number: 1,
    title: 'Imparzialit\u00e0 del processo',
    question: 'La separazione delle carriere rende i processi pi\u00f9 imparziali?',
    description:
      'La riforma separa definitivamente le carriere di giudici e PM. Il giudice non avr\u00e0 mai fatto il PM e viceversa. L\u2019Art. 111 (giusto processo) richiede un giudice terzo e imparziale.',
    reformComponent: 'Separazione delle carriere (Art. 102)',
    causalChain: {
      objectiveData: [
        <>
          I passaggi di funzione tra giudice e PM saranno eliminati{' '}
          <ExplainerLink
            label="Situazione attuale"
            content={
              <p>
                Dopo la riforma Cartabia (2022), i passaggi di funzione sono gi&agrave; ridotti
                allo 0,5% dei magistrati. Il tasso di assoluzione in Italia &egrave; ~45%, tra i
                pi&ugrave; alti in Europa. L&apos;Art. 111 (giusto processo) richiede gi&agrave;
                un giudice terzo e imparziale.
              </p>
            }
          >
            (oggi 0,5%)
          </ExplainerLink>
        </>,
        <>
          Due concorsi separati: uno per la carriera giudicante, uno per la requirente (Art.
          102){' '}
          <ExplainerLink
            label="Situazione attuale"
            content={
              <p>
                Oggi c&apos;&egrave; un unico concorso per entrare in magistratura. Dopo
                l&apos;ingresso si pu&ograve; scegliere e, nei limiti della Cartabia, cambiare
                funzione.
              </p>
            }
          >
            (oggi concorso unico)
          </ExplainerLink>
        </>,
      ],
      possibleEffects: [
        'Il giudice non ha mai svolto funzioni requirenti e viceversa',
        'Si formano due culture professionali separate fin dall\u2019inizio della carriera',
        'Il PM perde la prospettiva giudicante (e il giudice quella requirente)',
        'La percezione pubblica di imparzialit\u00e0 potrebbe migliorare anche senza cambiamenti sostanziali',
      ],
      possibleOutcomes: [
        'L\u2019imparzialit\u00e0 migliora sensibilmente \u2014 il giusto processo diventa pi\u00f9 concreto',
        'L\u2019imparzialit\u00e0 migliora nella percezione pubblica, ma non nella sostanza',
        'L\u2019imparzialit\u00e0 rimane sostanzialmente invariata \u2014 il problema era gi\u00e0 risolto',
        'L\u2019imparzialit\u00e0 peggiora \u2014 PM autoreferenziali diventano pi\u00f9 aggressivi (\u201cipertrofia dell\u2019accusa\u201d)',
      ],
    },
    positionLabels: ['Migliora', 'Non cambia', 'Peggiora'],
    debate: (
      <>
        <p>
          <strong>Per il polo positivo.</strong> L&apos;UCPI (Unione Camere Penali) la considera
          &quot;un obiettivo storico&quot;. Spangher (procedura penale, ex CSM) argomenta che la
          separazione rafforza la distinzione tra funzione requirente e giudicante, coerente con il
          modello accusatorio. Il CNF (Consiglio Nazionale Forense) ha aderito all&apos;unanimit&agrave;
          al comitato per il SI.
        </p>
        <p className="mt-2">
          <strong>Per il polo negativo.</strong> Margherita Cassano (Prima Presidente della Corte
          di Cassazione) cita i dati: solo lo 0,83% dei PM e lo 0,21% dei giudici ha cambiato
          funzione in 5 anni dopo la Cartabia &mdash; la riforma formalizza qualcosa che non esiste pi&ugrave;.
          Gaetano Silvestri (Presidente emerito, Corte Costituzionale) avverte di
          &quot;ipertrofia dell&apos;accusa e eterogenesi dei fini&quot;: un corpo separato e
          autoreferenziale di PM si orienterebbe verso la condanna anzich&eacute; l&apos;applicazione
          imparziale della legge.
        </p>
      </>
    ),
    mechanisms: (
      <ul className="list-disc pl-4 space-y-1.5">
        <li>
          <strong>Distanza strutturale.</strong> Due concorsi separati, due percorsi di carriera
          separati. Il giudice non ha mai condiviso l&apos;ambiente professionale del PM. I
          sostenitori ritengono che questo produca un giudice pi&ugrave; &quot;terzo&quot;.
        </li>
        <li>
          <strong>Contro-argomento: il dato reale.</strong> I passaggi di funzione erano gi&agrave;
          quasi zero. Il tasso di assoluzione italiano (~45%) non suggerisce un bias sistematico
          pro-accusa. L&apos;imparzialit&agrave; del giudice dipende da fattori culturali e
          organizzativi pi&ugrave; che dalla struttura della carriera.
        </li>
        <li>
          <strong>Il rischio Silvestri.</strong> PM separati, senza la cultura condivisa con i
          giudici, potrebbero diventare pi&ugrave; &quot;polizia giudiziaria&quot; che
          &quot;magistrati&quot;. Clementi (La Sapienza) avverte che il PM potrebbe diventare
          &quot;una sorta di estensione della polizia giudiziaria&quot;.
        </li>
      </ul>
    ),
    precedents: (
      <>
        <p>
          La maggior parte dei paesi UE ha carriere separate, ma i modelli sono molto eterogenei
          (Pagella Politica). Il Portogallo &egrave; l&apos;unico caso in cui separazione e genuina
          indipendenza del PM coesistono. La Francia ha separazione ma i PM storicamente erano
          sotto l&apos;autorit&agrave; del Ministro. La Spagna nel 2025 ha trasferito i poteri
          investigativi ai PM &mdash; direzione opposta.
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
      'La riforma crea un CSM requirente separato (1/3 togati sorteggiati, 2/3 da lista parlamentare) e una nuova Alta Corte disciplinare. L\u2019Art. 112 (obbligatoriet\u00e0 dell\u2019azione penale) resta invariato.',
    reformComponent: 'CSM requirente (Art. 104) + Alta Corte (Art. 105)',
    causalChain: {
      objectiveData: [
        <>
          Nasce un CSM requirente separato: 1/3 togati sorteggiati, 2/3 da lista parlamentare{' '}
          <ExplainerLink
            label="Situazione attuale"
            content={
              <p>
                Oggi esiste un CSM unico con 2/3 componenti togati (eletti dai magistrati) e
                1/3 laici (eletti dal Parlamento in seduta comune).
              </p>
            }
          >
            (oggi CSM unico, 2/3 togati eletti)
          </ExplainerLink>
        </>,
        <>
          La giurisdizione disciplinare passa all&apos;Alta Corte; le decisioni non saranno
          impugnabili in Cassazione{' '}
          <ExplainerLink
            label="Situazione attuale"
            content={
              <p>
                Oggi la disciplina &egrave; gestita dalla sezione disciplinare interna al CSM.
                Le sue decisioni sono impugnabili davanti alle Sezioni Unite della Cassazione.
              </p>
            }
          >
            (oggi sezione interna al CSM, impugnabile)
          </ExplainerLink>
        </>,
        <>L&apos;Art. 112 (obbligatoriet&agrave; dell&apos;azione penale) resta invariato</>,
        <>Il Presidente della Repubblica presiede entrambi i CSM</>,
      ],
      possibleEffects: [
        'La maggioranza parlamentare controlla la composizione della lista dei laici (2/3 del CSM requirente)',
        'L\u2019Alta Corte pu\u00f2 sanzionare PM senza possibilit\u00e0 di appello in Cassazione',
        'L\u2019indipendenza del PM \u00e8 per la prima volta scritta in Costituzione (oggi \u00e8 solo in legge ordinaria)',
        'Le leggi attuative (a maggioranza semplice) definiranno i dettagli chiave: priorit\u00e0 azione penale, regole disciplinari, procedure sorteggio',
      ],
      possibleOutcomes: [
        'L\u2019indipendenza si rafforza \u2014 garanzie costituzionali pi\u00f9 solide di oggi',
        'L\u2019indipendenza rimane sostanzialmente invariata \u2014 le garanzie formali compensano i rischi strutturali',
        'L\u2019indipendenza si indebolisce gradualmente \u2014 effetto intimidatorio e autocensura dei PM',
        'L\u2019indipendenza viene compromessa \u2014 il PM diventa sensibile alla politica (modello Francia pre-2013)',
      ],
    },
    positionLabels: ['Si rafforza', 'Non cambia', 'Si indebolisce'],
    debate: (
      <>
        <p>
          <strong>Per il polo positivo.</strong> Augusto Barbera (Presidente emerito, Corte
          Costituzionale) sostiene che nel testo &quot;non c&apos;&egrave; alcun elemento che possa
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
          dell&apos;unit&agrave; della magistratura, aprendo la porta al controllo esterno&quot;. La
          Commissione Europea (Rule of Law Report 2025) segnala che &quot;isolare il servizio del
          PM &egrave; spesso vulnerabile alla politicizzazione&quot;. Il CSM stesso ha votato un parere
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
          giurisdizione su condotte che &quot;compromettono indipendenza e imparzialit&agrave;&quot; &egrave;
          vaga e potrebbe creare un effetto intimidatorio.
        </li>
        <li>
          <strong>Delega in bianco alla legge ordinaria.</strong> Il testo costituzionale &egrave; scarno
          sui dettagli attuativi. Le leggi ordinarie (maggioranza semplice) definiranno: priorit&agrave;
          dell&apos;azione penale, regole disciplinari, procedure del sorteggio, rapporto PM-esecutivo.
          Come avverte il giudice Morosini: questo d&agrave; &quot;a maggioranze mutevoli il potere di
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
          <strong>Polonia</strong> (il precedente pi&ugrave; citato). La riforma del 2016 ha eliminato
          l&apos;indipendenza dei PM: riassegnazione discrezionale dei casi, procedimenti
          disciplinari contro PM dissidenti. L&apos;UE ha sanzionato la Polonia. Non direttamente
          comparabile, ma dimostra che chi controlla il disciplinare ha un potere enorme.
        </p>
        <p className="mt-2">
          <strong>Francia.</strong> Separazione storica, ma i PM sono rimasti sotto il Ministro
          della Giustizia. Solo nel 2013 una legge ha vietato istruzioni sui singoli casi.
          <strong> Germania.</strong> PM completamente subordinati al Ministro. Nel 2019 la CGUE
          ha stabilito che non possono essere considerati &quot;autorit&agrave; giudiziaria&quot;.
        </p>
        <p className="mt-2">
          Barbera e Cazzola contestano la comparabilit&agrave;: Francia e Germania hanno norme esplicite
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
      'La riforma crea due CSM separati (uno per giudici, uno per PM) e una nuova Alta Corte disciplinare. Oggi c\u2019\u00e8 un solo CSM che gestisce l\u2019intero sistema e un\u2019unica sezione disciplinare.',
    reformComponent: 'Due CSM (Art. 104) + Alta Corte disciplinare (Art. 105)',
    causalChain: {
      objectiveData: [
        <>
          Il CSM si sdoppia in due organi separati (giudicante e requirente){' '}
          <ExplainerLink
            label="Situazione attuale"
            content={
              <p>
                Oggi un unico CSM gestisce l&apos;intero sistema giudiziario: assunzioni,
                assegnazioni, trasferimenti e promozioni sia dei giudici che dei PM.
                L&apos;Italia ha tra i tempi processuali pi&ugrave; lunghi d&apos;Europa.
              </p>
            }
          >
            (oggi CSM unico)
          </ExplainerLink>
        </>,
        <>
          Nasce l&apos;Alta Corte disciplinare con propria struttura autonoma{' '}
          <ExplainerLink
            label="Stima dei costi"
            content={
              <p>
                Secondo le stime dell&apos;ANM (Maruotti), l&apos;Alta Corte gestirebbe ~75
                casi/anno con un costo stimato di ~20M&euro;/anno. Oggi la disciplina &egrave;
                gestita dalla sezione disciplinare interna al CSM senza costi aggiuntivi di
                struttura.
              </p>
            }
          >
            (~75 casi/anno, ~20M&euro;/anno stimati)
          </ExplainerLink>
        </>,
        <>Nessun meccanismo di coordinamento tra i due CSM &egrave; previsto nel testo</>,
      ],
      possibleEffects: [
        'Duplicazione di strutture amministrative, sedi, organici, sistemi IT',
        'Ciascun CSM si specializza sulla propria funzione (giudicante o requirente)',
        'Nessun organo ha pi\u00f9 una visione d\u2019insieme del sistema giustizia',
        'Possibili conflitti di competenza tra i due CSM su materie sovrapposte',
      ],
      possibleOutcomes: [
        'L\u2019efficienza migliora \u2014 due organi specializzati governano meglio di uno generalista',
        'L\u2019efficienza rimane sostanzialmente invariata \u2014 costi e benefici si compensano',
        'L\u2019efficienza peggiora \u2014 doppia burocrazia, costi maggiori, tempi pi\u00f9 lunghi',
        'L\u2019efficienza peggiora molto \u2014 conflitti tra organi e frammentazione paralizzante (modello Titolo V)',
      ],
    },
    positionLabels: ['Migliora', 'Non cambia', 'Peggiora'],
    debate: (
      <>
        <p>
          <strong>Per il polo positivo.</strong> Il governo argomenta che due CSM specializzati
          sono pi&ugrave; efficaci di uno generalista. Ogni organo pu&ograve; concentrarsi sulle specificit&agrave;
          della propria funzione. La separazione porta chiarezza organizzativa.
        </p>
        <p className="mt-2">
          <strong>Per il polo negativo.</strong> Nicol&ograve; Zanon (Associazione Italiana dei
          Costituzionalisti) nota un paradosso: creare un CSM separato per i PM
          &quot;consacra la funzione requirente al pi&ugrave; alto livello istituzionale&quot; anzich&eacute;
          separarla. Si chiede se sar&agrave; &quot;facile per il Ministro confrontarsi con due CSM&quot;.
          Propone come alternativa un singolo CSM diviso in sezioni (legge ordinaria). Il CSM
          stesso (parere negativo) identifica &quot;problemi nel rapporto tra competenze dei due
          organi, risoluzione di conflitti, mancanza di visione unitaria&quot;. Bruti Liberati
          (ex Procuratore Capo di Milano): &quot;eliminazione sostanziale del CSM: frammentato in
          due organi non comunicanti&quot;. Maruotti (ANM): l&apos;Alta Corte costerebbe
          ~20M&euro;/anno per ~75 casi.
        </p>
      </>
    ),
    mechanisms: (
      <ul className="list-disc pl-4 space-y-1.5">
        <li>
          <strong>Duplicazione delle risorse.</strong> Sedi separate, organici separati, sistemi
          amministrativi e IT separati per ciascun CSM. Pi&ugrave; la nuova Alta Corte con propria
          struttura.
        </li>
        <li>
          <strong>Vuoto nel coordinamento.</strong> Il testo costituzionale non prevede alcun
          meccanismo per risolvere conflitti tra i due CSM su materie sovrapposte (assegnazioni
          temporanee, uffici giudiziari che condividono edifici e risorse).
        </li>
        <li>
          <strong>Perdita della visione sistemica.</strong> Un CSM unico valutava il sistema
          giustizia nel suo complesso. Due organi separati ne vedono ciascuno solo met&agrave;.
        </li>
        <li>
          <strong>Contro-argomento: specializzazione.</strong> Due organi pi&ugrave; piccoli ma
          focalizzati possono essere pi&ugrave; efficaci di uno grande e generalista. La suddivisione
          per funzione &egrave; un principio organizzativo standard.
        </li>
      </ul>
    ),
    precedents: (
      <>
        <p>
          <strong>Riforma del Titolo V (2001).</strong> Il precedente italiano pi&ugrave; citato. La
          suddivisione delle competenze Stato-Regioni senza meccanismi di coordinamento adeguati
          port&ograve; a un&apos;esplosione di contenziosi alla Corte Costituzionale. Zanon nota che le
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
    title: 'Qualit\u00e0 dell\u2019autogoverno',
    question:
      'Il sorteggio migliora la governance del CSM eliminando le correnti, o la peggiora?',
    description:
      'La riforma sostituisce l\u2019elezione dei membri del CSM con il sorteggio. I togati passano da 2/3 eletti a 1/3 sorteggiati. I laici passano da 1/3 eletti dal Parlamento a 2/3 sorteggiati da una lista parlamentare.',
    reformComponent: 'Sorteggio + inversione quota togati/laici (Art. 104)',
    causalChain: {
      objectiveData: [
        <>
          I membri togati del CSM saranno sorteggiati, non pi&ugrave; eletti{' '}
          <ExplainerLink
            label="Situazione attuale"
            content={
              <p>
                Oggi i componenti togati sono eletti da tutti i magistrati ordinari. Le elezioni
                sono organizzate da correnti (gruppi associativi) con programmi pubblici. Lo
                scandalo Palamara (2019) document&ograve; logiche di scambio tra correnti per le
                nomine.
              </p>
            }
          >
            (oggi eletti, organizzati in correnti)
          </ExplainerLink>
        </>,
        <>
          La quota togati/laici si inverte: da 2/3 a 1/3 togati{' '}
          <ExplainerLink
            label="Situazione attuale"
            content={
              <p>
                Oggi i togati sono 2/3 dei componenti e i laici (eletti dal Parlamento) sono
                1/3. Con la riforma i togati scendono a 1/3 e i laici (sorteggiati da lista
                parlamentare) salgono a 2/3.
              </p>
            }
          >
            (oggi 2/3 togati, 1/3 laici)
          </ExplainerLink>
        </>,
        <>I 2/3 laici saranno sorteggiati da una lista compilata dal Parlamento in seduta comune</>,
        <>Mandato di 4 anni, non immediatamente ripetibile</>,
      ],
      possibleEffects: [
        'Eliminazione della competizione elettorale tra correnti nel CSM',
        'Perdita della memoria istituzionale (mandati brevi, non ripetibili)',
        'Il personale burocratico permanente acquisisce pi\u00f9 peso relativo',
        'La lista parlamentare filtra chi pu\u00f2 essere sorteggiato tra i laici (2/3)',
      ],
      possibleOutcomes: [
        'L\u2019autogoverno migliora \u2014 correnti eliminate, nomine basate sul merito',
        'L\u2019autogoverno rimane sostanzialmente invariato \u2014 le correnti si riorganizzano in altre forme',
        'L\u2019autogoverno peggiora \u2014 organi pi\u00f9 deboli, meno autorevoli, meno competenti',
        'L\u2019autogoverno viene svuotato \u2014 togati ridotti a 1/3, il Parlamento controlla di fatto la governance',
      ],
    },
    positionLabels: ['Migliora', 'Non cambia', 'Peggiora'],
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
          l&apos;analisi pi&ugrave; dettagliata: rimuovere la responsabilit&agrave; elettorale non previene il
          correntismo &mdash; lo redistribuisce. Senza strutture di gruppo trasparenti, i magistrati
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
          anni, non immediatamente riselezionabili. La competenza e la continuit&agrave; si perdono. Il
          personale burocratico permanente guadagna influenza sproporzionata.
        </li>
        <li>
          <strong>Compilazione della lista.</strong> Il Parlamento controlla la lista da cui sono
          sorteggiati i 2/3. Se la lista &egrave; curata (legge attuativa a maggioranza semplice),
          la casualit&agrave; &egrave; limitata dal pool.
        </li>
        <li>
          <strong>Contro-argomento: il sistema attuale &egrave; peggio.</strong> Le elezioni del CSM
          producevano correnti che funzionavano come partiti, con logiche di scambio documentate
          (Palamara). Il sorteggio, anche imperfetto, spezza queste catene.
        </li>
      </ul>
    ),
    precedents: (
      <>
        <p>
          <strong>Sorteggio nelle universit&agrave; italiane (2008).</strong> Precedente diretto. La
          riforma introdusse il sorteggio per le commissioni di concorso. Uno studio del 2017
          dell&apos;ufficio valutazione del Senato trov&ograve; che il meccanismo non riusc&igrave; a: migliorare
          la qualit&agrave; della selezione, ridurre il localismo, o prevenire commissari inadeguati. I
          risultati mostrarono solo un &quot;livellamento verso la qualit&agrave; media&quot;.
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
              <span className="text-muted-foreground/40 shrink-0 mt-px">&middot;</span>
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Column 2: Possible effects */}
      <div className="relative">
        <span className="hidden sm:block absolute -left-2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/40 text-lg">
          &rarr;
        </span>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1.5">
          Possibili effetti
        </p>
        <ul className="space-y-1.5">
          {chain.possibleEffects.map((item, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-muted-foreground/40 shrink-0 mt-px">&rarr;</span>
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Column 3: Possible outcomes (ordered best -> worst) */}
      <div className="relative">
        <span className="hidden sm:block absolute -left-2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/40 text-lg">
          &rarr;
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
