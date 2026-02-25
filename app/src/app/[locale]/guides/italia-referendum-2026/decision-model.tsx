import { type ReactNode } from 'react'
import { Box } from '@/components/custom-ui/box'
import { ExplainerLink } from '@/components/custom-ui/explainer'

// ============================================================================
// Types
// ============================================================================

type DimensionId = 'imparzialita' | 'indipendenza' | 'efficienza' | 'autogoverno'

export interface CausalChain {
  objectiveData: ReactNode[]
  possibleEffects: ReactNode[]
  possibleOutcomes: string[]
}

interface Dimension {
  id: DimensionId
  number: number
  title: string
  question: string
  reformComponent: string
  causalChain: CausalChain
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
    reformComponent: 'Separazione delle carriere (Art. 102)',
    causalChain: {
      objectiveData: [
        <>
          I passaggi di funzione tra giudice e PM saranno eliminati{' '}
          <ExplainerLink
            label="Situazione attuale"
            content={
              <p>
                Dopo la riforma Cartabia (2022), i passaggi di funzione sono gi&agrave; ridotti allo
                0,5% dei magistrati. Il tasso di assoluzione in Italia &egrave; ~45%, tra i
                pi&ugrave; alti in Europa. L&apos;Art. 111 (giusto processo) richiede gi&agrave; un
                giudice terzo e imparziale.
              </p>
            }
          >
            (oggi 0,5%)
          </ExplainerLink>
        </>,
        <>
          Due concorsi separati: uno per la carriera giudicante, uno per la requirente (Art. 102){' '}
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
        <>
          Il giudice non ha mai svolto funzioni requirenti e viceversa &mdash; si formano{' '}
          <ExplainerLink
            label="Culture professionali separate"
            content={
              <p>
                Due concorsi separati, due percorsi di carriera. Il giudice non ha mai condiviso
                l&apos;ambiente professionale del PM. I sostenitori (UCPI, Spangher, CNF) ritengono
                che questo produca un giudice pi&ugrave; &quot;terzo&quot;.
              </p>
            }
          >
            due culture professionali separate
          </ExplainerLink>{' '}
          fin dall&apos;inizio
        </>,
        <>
          I passaggi di funzione erano gi&agrave; quasi zero dopo la Cartabia{' '}
          <ExplainerLink
            label="Dati"
            content={
              <p>
                Margherita Cassano (Prima Presidente della Corte di Cassazione) cita i dati: solo lo
                0,83% dei PM e lo 0,21% dei giudici ha cambiato funzione in 5 anni dopo la Cartabia.
                La riforma formalizza qualcosa che nella pratica non esiste pi&ugrave;.
              </p>
            }
          >
            (dati: 0,83% PM, 0,21% giudici &mdash; Cassano)
          </ExplainerLink>
        </>,
        <>
          La percezione pubblica di imparzialit&agrave; potrebbe migliorare{' '}
          <ExplainerLink
            label="Chi lo sostiene"
            content={
              <p>
                L&apos;UCPI (Unione Camere Penali) la considera &quot;un obiettivo storico&quot;. Il
                CNF (Consiglio Nazionale Forense) ha aderito all&apos;unanimit&agrave; al comitato
                per il SI. Spangher (procedura penale, ex CSM) argomenta che la separazione rafforza
                la distinzione coerente con il modello accusatorio.
              </p>
            }
          >
            (UCPI: &quot;obiettivo storico&quot;; CNF unanime per il SI)
          </ExplainerLink>
        </>,
        <>Il PM perde la prospettiva giudicante (e il giudice quella requirente)</>,
        <>
          PM separati potrebbero diventare pi&ugrave; aggressivi{' '}
          <ExplainerLink
            label="Rischio &quot;ipertrofia dell'accusa&quot;"
            content={
              <p>
                Gaetano Silvestri (Presidente emerito, Corte Costituzionale) avverte di
                &quot;ipertrofia dell&apos;accusa e eterogenesi dei fini&quot;: un corpo separato e
                autoreferenziale di PM si orienterebbe verso la condanna anzich&eacute;
                l&apos;applicazione imparziale della legge. Clementi (La Sapienza) avverte che il PM
                potrebbe diventare &quot;una sorta di estensione della polizia giudiziaria&quot;.
              </p>
            }
          >
            (&quot;ipertrofia dell&apos;accusa&quot; &mdash; Silvestri, Clementi)
          </ExplainerLink>
        </>,
        <>
          Il tasso di assoluzione italiano (~45%) non suggerisce un bias sistematico pro-accusa{' '}
          <ExplainerLink
            label="Contesto"
            content={
              <p>
                L&apos;imparzialit&agrave; del giudice dipende da fattori culturali e organizzativi
                pi&ugrave; che dalla struttura della carriera. Il tasso di assoluzione italiano
                (~45%) &egrave; tra i pi&ugrave; alti in Europa, indicando che i giudici gi&agrave;
                oggi decidono in autonomia rispetto alle richieste dei PM.
              </p>
            }
          >
            (tra i pi&ugrave; alti in Europa)
          </ExplainerLink>
        </>,
        <>
          In Europa i modelli sono molto eterogenei{' '}
          <ExplainerLink
            label="Precedenti internazionali"
            content={
              <p>
                La maggior parte dei paesi UE ha carriere separate, ma i modelli sono molto
                eterogenei (Pagella Politica). Il Portogallo &egrave; l&apos;unico caso in cui
                separazione e genuina indipendenza del PM coesistono. La Francia ha separazione ma i
                PM storicamente erano sotto l&apos;autorit&agrave; del Ministro. La Spagna nel 2025
                ha trasferito i poteri investigativi ai PM &mdash; direzione opposta.
              </p>
            }
          >
            (Portogallo, Francia, Spagna 2025)
          </ExplainerLink>
        </>,
      ],
      possibleOutcomes: [
        'L\u2019imparzialit\u00e0 migliora sensibilmente \u2014 il giusto processo diventa pi\u00f9 concreto',
        'L\u2019imparzialit\u00e0 migliora nella percezione pubblica, ma non nella sostanza',
        'L\u2019imparzialit\u00e0 rimane sostanzialmente invariata \u2014 il problema era gi\u00e0 risolto',
        'L\u2019imparzialit\u00e0 peggiora \u2014 PM autoreferenziali diventano pi\u00f9 aggressivi (\u201cipertrofia dell\u2019accusa\u201d)',
      ],
    },
  },
  {
    id: 'indipendenza',
    number: 2,
    title: 'Indipendenza del PM dalla politica',
    question: 'Il nuovo assetto istituzionale protegge o espone i PM all\u2019influenza politica?',
    reformComponent: 'CSM requirente (Art. 104) + Alta Corte (Art. 105)',
    causalChain: {
      objectiveData: [
        <>
          Nasce un CSM requirente separato: 1/3 togati sorteggiati, 2/3 da lista parlamentare{' '}
          <ExplainerLink
            label="Situazione attuale"
            content={
              <p>
                Oggi esiste un CSM unico con 2/3 componenti togati (eletti dai magistrati) e 1/3
                laici (eletti dal Parlamento in seduta comune).
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
                Oggi la disciplina &egrave; gestita dalla sezione disciplinare interna al CSM. Le
                sue decisioni sono impugnabili davanti alle Sezioni Unite della Cassazione.
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
        <>
          La maggioranza parlamentare controlla la lista dei laici{' '}
          <ExplainerLink
            label="Composizione del CSM requirente"
            content={
              <p>
                1/3 togati sorteggiati, 2/3 da lista compilata dal Parlamento. La maggioranza
                politica controlla chi finisce nella lista. Se le leggi attuative non richiedono una
                maggioranza qualificata per la compilazione, l&apos;intera componente laica dipende
                dal governo.
              </p>
            }
          >
            (2/3 del CSM requirente)
          </ExplainerLink>
        </>,
        <>
          L&apos;Alta Corte pu&ograve; sanzionare PM senza appello in Cassazione{' '}
          <ExplainerLink
            label="Rischio effetto intimidatorio"
            content={
              <p>
                Le decisioni dell&apos;Alta Corte non sono impugnabili in Cassazione (rimuovendo una
                garanzia oggi esistente). La Commissione Europea avverte del rischio di
                &quot;strumentalizzazione dei procedimenti disciplinari&quot;. La giurisdizione su
                condotte che &quot;compromettono indipendenza e imparzialit&agrave;&quot; &egrave;
                vaga e potrebbe creare un effetto intimidatorio.
              </p>
            }
          >
            (rischio &quot;effetto intimidatorio&quot; &mdash; Commissione Europea)
          </ExplainerLink>
        </>,
        <>
          L&apos;indipendenza del PM &egrave; per la prima volta scritta in Costituzione{' '}
          <ExplainerLink
            label="Garanzie nel testo"
            content={
              <p>
                Barbera (Presidente emerito, Corte Costituzionale) sostiene che nel testo &quot;non
                c&apos;&egrave; alcun elemento che possa giustificare la subordinazione dei PM alla
                politica&quot;. Cazzola argomenta che la riforma eleva le garanzie di indipendenza
                del PM da legge ordinaria a rango costituzionale. L&apos;Art. 112 resta invariato.
                Il Presidente della Repubblica presiede entrambi i CSM. Per subordinare i PM
                servirebbero modifiche costituzionali esplicite che questa riforma non contiene.
              </p>
            }
          >
            (Barbera, Cazzola: garanzia pi&ugrave; solida di oggi)
          </ExplainerLink>
        </>,
        <>
          Le leggi attuative (a maggioranza semplice) definiranno i dettagli chiave{' '}
          <ExplainerLink
            label="Delega alla legge ordinaria"
            content={
              <p>
                Il testo costituzionale &egrave; scarno sui dettagli attuativi. Le leggi ordinarie
                (maggioranza semplice) definiranno: priorit&agrave; dell&apos;azione penale, regole
                disciplinari, procedure del sorteggio, rapporto PM-esecutivo. Come avverte il
                giudice Morosini: questo d&agrave; &quot;a maggioranze mutevoli il potere di
                modellare l&apos;azione penale&quot;.
              </p>
            }
          >
            (&quot;maggioranze mutevoli&quot; &mdash; Morosini)
          </ExplainerLink>
        </>,
        <>
          L&apos;ANM (96% dei magistrati) e MEDEL (18.000 magistrati, 16 paesi) si oppongono{' '}
          <ExplainerLink
            label="Opposizione istituzionale"
            content={
              <p>
                L&apos;ANM (96% dei magistrati, inclusa Magistratura Indipendente, tradizionalmente
                vicina al centrodestra) avverte che la separazione &quot;espone il PM a logiche
                gerarchiche o influenze esterne&quot;. MEDEL dichiara che la riforma &quot;elimina il
                principio dell&apos;unit&agrave; della magistratura, aprendo la porta al controllo
                esterno&quot;. La Commissione Europea (Rule of Law Report 2025) segnala che
                &quot;isolare il servizio del PM &egrave; spesso vulnerabile alla
                politicizzazione&quot;. Il CSM stesso ha votato un parere negativo (24 voti).
              </p>
            }
          >
            (rischio &quot;controllo esterno&quot;)
          </ExplainerLink>
        </>,
        <>
          In Europa, separazione e subordinazione politica spesso coesistono{' '}
          <ExplainerLink
            label="Precedenti internazionali"
            content={
              <>
                <p>
                  <strong>Polonia</strong> (2016): eliminata l&apos;indipendenza dei PM &mdash;
                  riassegnazione discrezionale dei casi, procedimenti disciplinari contro PM
                  dissidenti. L&apos;UE ha sanzionato la Polonia.
                </p>
                <p className="mt-2">
                  <strong>Francia:</strong> separazione storica, PM sotto il Ministro fino al 2013.{' '}
                  <strong>Germania:</strong> PM completamente subordinati al Ministro &mdash; nel
                  2019 la CGUE ha stabilito che non sono &quot;autorit&agrave; giudiziaria&quot;.
                </p>
                <p className="mt-2">
                  Barbera e Cazzola contestano la comparabilit&agrave;: Francia e Germania hanno
                  norme esplicite di subordinazione che la riforma italiana non contiene.
                </p>
              </>
            }
          >
            (Polonia, Francia, Germania)
          </ExplainerLink>
        </>,
      ],
      possibleOutcomes: [
        'L\u2019indipendenza si rafforza \u2014 garanzie costituzionali pi\u00f9 solide di oggi',
        'L\u2019indipendenza rimane sostanzialmente invariata \u2014 le garanzie formali compensano i rischi strutturali',
        'L\u2019indipendenza si indebolisce gradualmente \u2014 effetto intimidatorio e autocensura dei PM',
        'L\u2019indipendenza viene compromessa \u2014 il PM diventa sensibile alla politica (modello Francia pre-2013)',
      ],
    },
  },
  {
    id: 'efficienza',
    number: 3,
    title: 'Efficienza del sistema',
    question:
      'Lo sdoppiamento degli organi di governo migliora o peggiora il funzionamento della giustizia?',
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
                assegnazioni, trasferimenti e promozioni sia dei giudici che dei PM. L&apos;Italia
                ha tra i tempi processuali pi&ugrave; lunghi d&apos;Europa.
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
        <>
          Duplicazione di strutture amministrative, sedi, organici, sistemi IT{' '}
          <ExplainerLink
            label="Costi aggiuntivi"
            content={
              <p>
                Sedi separate, organici separati, sistemi amministrativi e IT separati per ciascun
                CSM. Pi&ugrave; la nuova Alta Corte con propria struttura. Secondo le stime
                dell&apos;ANM (Maruotti), l&apos;Alta Corte gestirebbe ~75 casi/anno con un costo
                stimato di ~20M&euro;/anno.
              </p>
            }
          >
            (pi&ugrave; l&apos;Alta Corte: ~20M&euro;/anno &mdash; Maruotti)
          </ExplainerLink>
        </>,
        <>
          Ciascun CSM si specializza sulla propria funzione{' '}
          <ExplainerLink
            label="Argomento a favore"
            content={
              <p>
                Il governo argomenta che due CSM specializzati sono pi&ugrave; efficaci di uno
                generalista. Ogni organo pu&ograve; concentrarsi sulle specificit&agrave; della
                propria funzione. La suddivisione per funzione &egrave; un principio organizzativo
                standard. Due organi pi&ugrave; piccoli ma focalizzati possono essere pi&ugrave;
                efficaci di uno grande e generalista.
              </p>
            }
          >
            (principio organizzativo &mdash; governo)
          </ExplainerLink>
        </>,
        <>
          Nessun organo ha pi&ugrave; una visione d&apos;insieme del sistema giustizia{' '}
          <ExplainerLink
            label="Frammentazione"
            content={
              <p>
                Bruti Liberati (ex Procuratore Capo di Milano): &quot;eliminazione sostanziale del
                CSM: frammentato in due organi non comunicanti&quot;. Un CSM unico valutava il
                sistema giustizia nel suo complesso. Due organi separati ne vedono ciascuno solo
                met&agrave;.
              </p>
            }
          >
            (Bruti Liberati: &quot;eliminazione sostanziale del CSM&quot;)
          </ExplainerLink>
        </>,
        <>
          Nessun meccanismo di coordinamento tra i due CSM &egrave; previsto nel testo{' '}
          <ExplainerLink
            label="Rischio conflitti"
            content={
              <p>
                Il testo costituzionale non prevede alcun meccanismo per risolvere conflitti tra i
                due CSM su materie sovrapposte (assegnazioni temporanee, uffici giudiziari che
                condividono edifici e risorse). Il CSM stesso identifica &quot;problemi nel rapporto
                tra competenze dei due organi, risoluzione di conflitti, mancanza di visione
                unitaria&quot;.
              </p>
            }
          >
            (rischio conflitti di competenza)
          </ExplainerLink>
        </>,
        <>
          Zanon propone un&apos;alternativa: un solo CSM diviso in sezioni{' '}
          <ExplainerLink
            label="Alternativa proposta"
            content={
              <p>
                Nicol&ograve; Zanon (Associazione Italiana dei Costituzionalisti) nota un paradosso:
                creare un CSM separato per i PM &quot;consacra la funzione requirente al pi&ugrave;
                alto livello istituzionale&quot; anzich&eacute; separarla. Si chiede se sar&agrave;
                &quot;facile per il Ministro confrontarsi con due CSM&quot;. Propone come alternativa
                un singolo CSM diviso in sezioni, ottenibile con legge ordinaria.
              </p>
            }
          >
            (legge ordinaria, senza modifica costituzionale)
          </ExplainerLink>
        </>,
        <>
          Il precedente del Titolo V (2001) suggerisce rischi di frammentazione{' '}
          <ExplainerLink
            label="Precedente italiano"
            content={
              <p>
                La suddivisione delle competenze Stato-Regioni senza meccanismi di coordinamento
                adeguati port&ograve; a un&apos;esplosione di contenziosi alla Corte Costituzionale.
                Zanon nota che le argomentazioni sono prevalentemente strutturali, ma la storia
                istituzionale italiana offre numerosi casi di frammentazione che produce
                inefficienza. Non esistono molti precedenti internazionali diretti per la transizione
                da un organo unificato di autogoverno a due separati.
              </p>
            }
          >
            (esplosione di contenziosi alla Consulta)
          </ExplainerLink>
        </>,
      ],
      possibleOutcomes: [
        'L\u2019efficienza migliora \u2014 due organi specializzati governano meglio di uno generalista',
        'L\u2019efficienza rimane sostanzialmente invariata \u2014 costi e benefici si compensano',
        'L\u2019efficienza peggiora \u2014 doppia burocrazia, costi maggiori, tempi pi\u00f9 lunghi',
        'L\u2019efficienza peggiora molto \u2014 conflitti tra organi e frammentazione paralizzante (modello Titolo V)',
      ],
    },
  },
  {
    id: 'autogoverno',
    number: 4,
    title: 'Qualit\u00e0 dell\u2019autogoverno',
    question: 'Il sorteggio migliora la governance del CSM eliminando le correnti, o la peggiora?',
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
                Oggi i togati sono 2/3 dei componenti e i laici (eletti dal Parlamento) sono 1/3.
                Con la riforma i togati scendono a 1/3 e i laici (sorteggiati da lista parlamentare)
                salgono a 2/3.
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
        <>
          Eliminazione della competizione elettorale tra correnti{' '}
          <ExplainerLink
            label="Argomento a favore"
            content={
              <p>
                Il governo cita lo scandalo Palamara come prova che il sistema elettorale del CSM
                era corrotto. Nordio lo definisce un &quot;verminaio correntizio&quot; e un
                meccanismo &quot;para-mafioso&quot;. Il sorteggio elimina la competizione elettorale
                e quindi le correnti che la organizzano.
              </p>
            }
          >
            (Nordio: &quot;verminaio correntizio&quot;)
          </ExplainerLink>
        </>,
        <>
          Le correnti potrebbero non sparire ma diventare reti informali opache{' '}
          <ExplainerLink
            label="Rischio redistribuzione"
            content={
              <p>
                Santalucia (Giustizia Insieme): rimuovere la responsabilit&agrave; elettorale non
                previene il correntismo &mdash; lo redistribuisce. Senza strutture di gruppo
                trasparenti, i magistrati costruiscono &quot;reti clientelari personali&quot; senza
                &quot;obbligo di rendere conto ad alcun corpo collettivo&quot;. Bruti Liberati
                prevede che le correnti &quot;non spariranno&quot;. Pertici avverte che il sorteggio
                potrebbe produrre &quot;organi deboli&quot;.
              </p>
            }
          >
            (Santalucia, Bruti Liberati)
          </ExplainerLink>
        </>,
        <>
          Perdita della memoria istituzionale{' '}
          <ExplainerLink
            label="Mandati brevi"
            content={
              <p>
                Membri sorteggiati in carica 4 anni, non immediatamente riselezionabili. La
                competenza e la continuit&agrave; si perdono. Il personale burocratico permanente
                guadagna influenza sproporzionata rispetto ai membri temporanei.
              </p>
            }
          >
            (mandati 4 anni, non ripetibili)
          </ExplainerLink>
        </>,
        <>
          La lista parlamentare filtra chi pu&ograve; essere sorteggiato tra i laici{' '}
          <ExplainerLink
            label="Controllo della lista"
            content={
              <p>
                Il Parlamento controlla la lista da cui sono sorteggiati i 2/3 laici. Se la lista
                &egrave; curata (legge attuativa a maggioranza semplice), la casualit&agrave;
                &egrave; limitata dal pool. La composizione della lista diventa il vero terreno di
                influenza politica.
              </p>
            }
          >
            (2/3 del CSM)
          </ExplainerLink>
        </>,
        <>
          Il precedente delle universit&agrave; (2008): il sorteggio non miglior&ograve; la
          qualit&agrave;{' '}
          <ExplainerLink
            label="Precedente italiano"
            content={
              <p>
                La riforma universitaria del 2008 introdusse il sorteggio per le commissioni di
                concorso. Uno studio del 2017 dell&apos;ufficio valutazione del Senato trov&ograve;
                che il meccanismo non riusc&igrave; a: migliorare la qualit&agrave; della selezione,
                ridurre il localismo, o prevenire commissari inadeguati. I risultati mostrarono solo
                un &quot;livellamento verso la qualit&agrave; media&quot;.
              </p>
            }
          >
            (studio del Senato 2017)
          </ExplainerLink>
        </>,
        <>
          Le leggi attuative rimandate potrebbero restare inattuate{' '}
          <ExplainerLink
            label="Pattern storico"
            content={
              <p>
                La letteratura costituzionalistica italiana documenta un pattern persistente di
                promesse costituzionali rimaste inattuate. Il periodo 1948-1970: molte norme
                programmatiche rimandavano l&apos;attuazione al futuro. Alcune hanno richiesto
                decenni. I dettagli chiave del sorteggio e della composizione dei CSM sono demandati
                a leggi ordinarie.
              </p>
            }
          >
            (pattern della &quot;Costituzione dimenticata&quot;)
          </ExplainerLink>
        </>,
      ],
      possibleOutcomes: [
        'L\u2019autogoverno migliora \u2014 correnti eliminate, nomine basate sul merito',
        'L\u2019autogoverno rimane sostanzialmente invariato \u2014 le correnti si riorganizzano in altre forme',
        'L\u2019autogoverno peggiora \u2014 organi pi\u00f9 deboli, meno autorevoli, meno competenti',
        'L\u2019autogoverno viene svuotato \u2014 togati ridotti a 1/3, il Parlamento controlla di fatto la governance',
      ],
    },
  },
]

// ============================================================================
// Component
// ============================================================================

export function CausalChainView({ chain }: { chain: CausalChain }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_1fr] gap-2 text-xs">
      {/* Column 1: Objective data */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1.5">
          Cosa cambia{' '}
          <ExplainerLink
            label="Cosa cambia"
            content={
              <p>
                Le modifiche oggettive e fattuali alla Costituzione. Solo fatti, non
                interpretazioni.
              </p>
            }
          >
            ?
          </ExplainerLink>
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
          Possibili effetti{' '}
          <ExplainerLink
            label="Possibili effetti"
            content={
              <p>
                Tutte le possibili conseguenze dei cambiamenti: effetti voluti e non voluti, diretti
                e indiretti, a breve e lungo termine.
              </p>
            }
          >
            ?
          </ExplainerLink>
        </p>
        <ul className="space-y-1.5">
          {chain.possibleEffects.map((item, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-muted-foreground/40 shrink-0 mt-px">&middot;</span>
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
          Possibili esiti{' '}
          <ExplainerLink
            label="Possibili esiti"
            content={
              <p>
                Gli scenari finali generali. Teoricamente, a ciascuno si potrebbe assegnare una
                probabilit&agrave; e valutare il successo/insuccesso per i diversi attori coinvolti.
              </p>
            }
          >
            ?
          </ExplainerLink>
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

export function DecisionModel() {
  return (
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
          </div>
        </Box>
      ))}
    </div>
  )
}
