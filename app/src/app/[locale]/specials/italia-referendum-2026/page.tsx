import type { Metadata } from 'next'
import { PageHeader, SectionL1 } from '@/components/custom-ui/section'
import { Muted } from '@/components/custom-ui/typography'
import { Box } from '@/components/custom-ui/box'
import { Explainer, type ExplainerItem } from '@/components/custom-ui/explainer'
import { PageNavLayout, type PageNavSection } from '@/components/custom-ui/page-nav'

export const metadata: Metadata = {
  title: 'Referendum Costituzionale: Separazione delle Carriere — 22-23 Marzo 2026',
  description:
    'Guida completa al referendum costituzionale confermativo sulla separazione delle carriere dei magistrati. Testo della legge, confronto articoli, analisi ragionata.',
}

// ============================================================================
// Data: Page navigation
// ============================================================================

const pageNavSections: PageNavSection[] = [
  { id: 'intro', label: 'Introduzione' },
  { id: 'cronologia', label: 'Cronologia' },
  { id: 'articoli', label: 'Articoli modificati' },
  { id: 'come-ragionare', label: '7 Domande' },
  { id: 'altri-paesi', label: 'Altri paesi' },
  { id: 'info-pratiche', label: 'Info pratiche' },
]

// ============================================================================
// Data: Cronologia
// ============================================================================

const cronologia: ExplainerItem[] = [
  {
    label: '2024',
    title: 'Il governo presenta un disegno di legge costituzionale',
    description:
      'La proposta modifica 7 articoli della Costituzione relativi alla magistratura, al CSM e al sistema disciplinare.',
    chips: [
      {
        label: 'Il governo?',
        content: (
          <p>
            Il governo di centrodestra guidato da Giorgia Meloni (coalizione Fratelli d&apos;Italia,
            Lega, Forza Italia). La separazione delle carriere dei magistrati è un tema storicamente
            caro al centrodestra italiano, in particolare a Forza Italia fin dai tempi di Berlusconi.
          </p>
        ),
      },
      {
        label: 'Disegno di legge?',
        content: (
          <>
            <p>
              Un <strong>disegno di legge</strong> (DDL) è una proposta di legge presentata dal
              governo al Parlamento. A differenza della &quot;proposta di legge&quot; (che può venire
              da singoli parlamentari), il DDL è un&apos;iniziativa del Consiglio dei Ministri.
            </p>
            <p className="mt-2">
              Il Parlamento può approvarlo, modificarlo o respingerlo. Non diventa legge finché
              entrambe le Camere non votano lo stesso testo identico.
            </p>
          </>
        ),
      },
      {
        label: 'Legge costituzionale?',
        content: (
          <>
            <p>
              Una legge che <strong>modifica la Costituzione</strong>. Richiede un procedimento
              speciale (Art. 138) con due votazioni in ciascuna Camera a distanza di almeno tre mesi.
            </p>
            <p className="mt-2">
              Se non si raggiungono i 2/3 dei voti, i cittadini possono chiedere un referendum per
              confermarla o respingerla.
            </p>
          </>
        ),
      },
      {
        label: '7 articoli?',
        content: (
          <>
            <p>La legge modifica:</p>
            <ul className="mt-1 list-disc pl-4 space-y-0.5">
              <li>
                <strong>Art. 87</strong> c.10 — Poteri del Presidente della Repubblica
              </li>
              <li>
                <strong>Art. 102</strong> c.1 — Introduce le &quot;distinte carriere&quot;
              </li>
              <li>
                <strong>Art. 104</strong> — Due CSM separati, membri sorteggiati
              </li>
              <li>
                <strong>Art. 105</strong> — Competenze dei CSM + nuova Alta Corte disciplinare
              </li>
              <li>
                <strong>Art. 106</strong> c.3 — Nomina consiglieri di cassazione
              </li>
              <li>
                <strong>Art. 107</strong> c.1 — Inamovibilità dei magistrati
              </li>
              <li>
                <strong>Art. 110</strong> c.1 — Servizi del Ministero della Giustizia
              </li>
            </ul>
          </>
        ),
      },
      {
        label: 'Magistratura?',
        content: (
          <>
            <p>
              Il corpo dei <strong>magistrati</strong>: le persone che esercitano il potere
              giudiziario. Comprende:
            </p>
            <ul className="mt-1 list-disc pl-4 space-y-0.5">
              <li>
                <strong>Giudici</strong> (giudicanti) — decidono le cause, emettono sentenze
              </li>
              <li>
                <strong>Pubblici Ministeri</strong> (requirenti) — conducono le indagini, sostengono
                l&apos;accusa
              </li>
            </ul>
            <p className="mt-2">
              Oggi appartengono allo stesso ordine e possono passare da una funzione all&apos;altra.
              La riforma vuole separarli definitivamente.
            </p>
          </>
        ),
      },
      {
        label: 'CSM?',
        content: (
          <>
            <p>
              Il <strong>Consiglio Superiore della Magistratura</strong> è l&apos;organo di
              autogoverno dei magistrati. Gestisce le loro carriere: assunzioni, assegnazioni,
              trasferimenti, promozioni e provvedimenti disciplinari.
            </p>
            <p className="mt-2">
              È presieduto dal Presidente della Repubblica. Oggi è uno solo. La riforma lo sdoppia
              in due: uno per i giudici, uno per i PM.
            </p>
          </>
        ),
      },
    ],
  },
  {
    label: 'Gen – Mar 2025',
    title: '1a votazione: Camera e Senato approvano in prima lettura',
    description:
      "L'Art. 138 della Costituzione richiede una doppia deliberazione per ogni revisione costituzionale.",
    chips: [
      {
        label: 'Camera e Senato?',
        content: (
          <>
            <p>Il Parlamento italiano è composto da due Camere:</p>
            <ul className="mt-1 list-disc pl-4 space-y-0.5">
              <li>
                <strong>Camera dei Deputati</strong> — 400 membri
              </li>
              <li>
                <strong>Senato della Repubblica</strong> — 200 membri eletti + senatori a vita
              </li>
            </ul>
            <p className="mt-2">
              Per approvare una legge, entrambe devono votare lo stesso testo identico (bicameralismo
              perfetto).
            </p>
          </>
        ),
      },
      {
        label: 'Prima lettura?',
        content: (
          <>
            <p>
              Per le leggi costituzionali, ogni Camera vota <strong>due volte</strong>. La
              &quot;prima lettura&quot; è la prima di queste votazioni. Tra la prima e la seconda
              devono passare almeno 3 mesi.
            </p>
            <p className="mt-2">
              Nella prima lettura basta la maggioranza semplice. È nella seconda votazione che si
              gioca la partita.
            </p>
          </>
        ),
      },
      {
        label: 'Art. 138?',
        content: (
          <p>
            L&apos;articolo 138 regola il procedimento di revisione costituzionale. Prevede: doppia
            votazione, intervallo minimo di 3 mesi, e — se non si raggiungono i 2/3 — la possibilità
            per i cittadini di avere l&apos;ultima parola tramite referendum.
          </p>
        ),
      },
      {
        label: 'Doppia deliberazione?',
        content: (
          <>
            <p>
              L&apos;Art. 138 richiede che ogni Camera voti <strong>due volte</strong> sullo stesso
              testo, a distanza di almeno tre mesi. Serve a garantire che la decisione di modificare
              la Costituzione sia ponderata.
            </p>
            <p className="mt-2">
              In pratica: Camera vota (1a), Senato vota (1a), passano almeno 3 mesi, Camera vota
              (2a), Senato vota (2a).
            </p>
          </>
        ),
      },
    ],
  },
  {
    label: 'Set – Ott 2025',
    title: '2a votazione: approvata con maggioranza assoluta, non con i 2/3',
    description:
      'Camera (18 set) e Senato (29 ott) approvano. Senza i 2/3 si attiva la possibilità del referendum confermativo.',
    chips: [
      {
        label: 'Maggioranza assoluta?',
        content: (
          <>
            <p>
              <strong>Maggioranza assoluta</strong> = metà + 1 dei <em>componenti</em> totali (non
              dei presenti). Alla Camera: 201 su 400, al Senato: 101 su 200.
            </p>
            <p className="mt-2">
              Diversa dalla maggioranza semplice (metà + 1 dei presenti) e dalla qualificata dei 2/3
              (267 alla Camera, 134 al Senato).
            </p>
          </>
        ),
      },
      {
        label: 'Perché contano i 2/3?',
        content: (
          <>
            <p>
              Con i <strong>2/3 dei voti</strong> in entrambe le Camere, la revisione entra in vigore
              automaticamente. Nessun referendum possibile.
            </p>
            <p className="mt-2">
              Con la sola maggioranza assoluta, si apre la finestra per il referendum confermativo. La
              logica: senza consenso larghissimo, la decisione finale spetta ai cittadini.
            </p>
          </>
        ),
      },
      {
        label: 'Referendum confermativo?',
        content: (
          <>
            <p>
              Un referendum in cui si chiede ai cittadini di <strong>confermare o respingere</strong>{' '}
              una legge costituzionale approvata dal Parlamento. Non è un referendum abrogativo.
            </p>
            <p className="mt-2">
              Differenza chiave: il referendum abrogativo richiede un quorum. Il confermativo{' '}
              <strong>no</strong> — vince la maggioranza semplice dei voti validi.
            </p>
          </>
        ),
      },
      {
        label: 'Chi ha votato a favore?',
        content: (
          <p>
            La coalizione di <strong>centrodestra</strong>: Fratelli d&apos;Italia, Lega, Forza
            Italia, Noi Moderati. Anche Italia Viva e Azione hanno sostenuto la riforma.
          </p>
        ),
      },
      {
        label: 'Chi ha votato contro?',
        content: (
          <p>
            L&apos;opposizione di <strong>centrosinistra</strong>: PD, Movimento 5 Stelle, Alleanza
            Verdi-Sinistra. Si oppone anche la maggior parte delle associazioni dei magistrati (ANM
            in testa).
          </p>
        ),
      },
    ],
  },
  {
    label: '30 Ottobre 2025',
    title: 'Pubblicazione nella Gazzetta Ufficiale',
    description:
      'La legge appare nella GU Serie Generale n. 253. Da questa data partono i 3 mesi per chiedere il referendum.',
    chips: [
      {
        label: 'Gazzetta Ufficiale?',
        content: (
          <p>
            Il giornale ufficiale dello Stato italiano. Tutte le leggi vengono pubblicate qui per
            diventare ufficialmente conoscibili. La pubblicazione fa partire i termini legali — in
            questo caso, i 3 mesi per la richiesta di referendum.
          </p>
        ),
      },
      {
        label: '3 mesi?',
        content: (
          <p>
            L&apos;Art. 138 concede <strong>tre mesi dalla pubblicazione</strong> per presentare la
            richiesta di referendum. È il tempo per raccogliere 500.000 firme o organizzare la
            richiesta parlamentare (1/5 dei membri di una Camera).
          </p>
        ),
      },
    ],
  },
  {
    label: 'Nov – Dic 2025',
    title: 'Richieste di referendum da maggioranza, opposizione e cittadini',
    description:
      'I parlamentari depositano le firme presso la Corte di Cassazione. 15 cittadini avviano la raccolta di 500.000 firme.',
    chips: [
      {
        label: 'Maggioranza e opposizione?',
        content: (
          <>
            <p>Strategia diversa, stesso strumento:</p>
            <ul className="mt-1 list-disc pl-4 space-y-0.5">
              <li>
                La <strong>maggioranza</strong> vuole la legittimazione popolare e il controllo sui
                tempi del voto.
              </li>
              <li>
                L&apos;<strong>opposizione</strong> vuole dare ai cittadini la possibilità di
                bocciarla.
              </li>
            </ul>
          </>
        ),
      },
      {
        label: 'Corte di Cassazione?',
        content: (
          <p>
            La Corte Suprema di Cassazione è il vertice della magistratura ordinaria italiana. Ospita
            l&apos;Ufficio Centrale per il Referendum, che verifica la regolarità delle richieste
            referendarie.
          </p>
        ),
      },
      {
        label: '500.000 firme?',
        content: (
          <p>
            L&apos;Art. 138 prevede che 500.000 elettori possano richiedere il referendum
            confermativo. In questo caso i parlamentari avevano già depositato le firme, quindi il
            referendum era comunque garantito.
          </p>
        ),
      },
    ],
  },
  {
    label: '18 Novembre 2025',
    title: "L'Ufficio Centrale dichiara ammissibili 4 richieste",
    description:
      "L'UCR presso la Corte di Cassazione verifica la regolarità formale delle richieste presentate.",
    chips: [
      {
        label: 'Ufficio Centrale?',
        content: (
          <p>
            L&apos;Ufficio Centrale per il Referendum (UCR) è un organo della Corte di Cassazione.
            Verifica che le richieste di referendum siano formalmente valide: firme autentiche,
            termini rispettati, requisiti soddisfatti.
          </p>
        ),
      },
      {
        label: '4 richieste?',
        content: (
          <p>
            Più soggetti hanno presentato richieste indipendenti: parlamentari di maggioranza, di
            opposizione e cittadini. Ne bastava una sola per attivare il referendum.
          </p>
        ),
      },
    ],
  },
  {
    label: '22-23 Marzo 2026',
    title: 'Si vota: SI o NO',
    description:
      "Nessun quorum. Vince la maggioranza semplice dei voti validi. L'astensione non ha valore strategico.",
    chips: [
      {
        label: 'Nessun quorum?',
        content: (
          <p>
            A differenza del referendum abrogativo (dove serve il 50%+1 degli aventi diritto), il
            confermativo <strong>non ha quorum</strong>. Anche se votasse solo il 10%, il risultato
            sarebbe valido.
          </p>
        ),
      },
      {
        label: 'Maggioranza semplice?',
        content: (
          <p>
            Metà + 1 dei <em>voti validi</em> espressi. Non dei componenti, non degli aventi
            diritto: dei voti effettivamente validi.
          </p>
        ),
      },
      {
        label: 'Voti validi?',
        content: (
          <>
            <p>I voti espressi correttamente: schede con un chiaro SI o NO. Esclusi dal conteggio:</p>
            <ul className="mt-1 list-disc pl-4 space-y-0.5">
              <li>
                <strong>Schede bianche</strong> — senza alcun segno
              </li>
              <li>
                <strong>Schede nulle</strong> — segni non interpretabili
              </li>
            </ul>
          </>
        ),
      },
      {
        label: "L'astensione?",
        content: (
          <p>
            Senza quorum, l&apos;astensione non è una strategia. Equivale a lasciare che il
            risultato venga deciso da chi si presenta alle urne.
          </p>
        ),
      },
    ],
  },
]

// ============================================================================
// Data: Articoli modificati
// ============================================================================

const articoli: ExplainerItem[] = [
  {
    label: 'Art. 87, comma 10',
    title: 'Il Presidente della Repubblica presiederà due CSM separati invece di uno',
    description:
      'Oggi presiede un unico Consiglio Superiore della Magistratura. Con la riforma presiederà sia il CSM giudicante che il CSM requirente.',
    chips: [
      {
        label: 'Due CSM?',
        content: (
          <p>
            Se le carriere sono separate, anche l&apos;organo di autogoverno deve essere separato. I
            favorevoli dicono che evita conflitti di interesse. I critici temono CSM più piccoli e più
            esposti a influenze esterne.
          </p>
        ),
      },
      {
        label: 'Giudicante e requirente?',
        content: (
          <ul className="list-disc pl-4 space-y-0.5">
            <li>
              <strong>Giudicante</strong> = chi giudica. I giudici, che emettono sentenze.
            </li>
            <li>
              <strong>Requirente</strong> = chi richiede l&apos;applicazione della legge. I PM, che
              conducono le indagini.
            </li>
          </ul>
        ),
      },
    ],
  },
  {
    label: 'Art. 102, comma 1',
    title: 'Si introduce in Costituzione il principio delle carriere distinte',
    description:
      'La separazione tra magistrati giudicanti (giudici) e requirenti (PM) diventa un principio costituzionale. Oggi la Costituzione non distingue.',
    chips: [
      {
        label: 'Carriere distinte?',
        content: (
          <>
            <p>
              Oggi un magistrato può passare dalla funzione giudicante a quella requirente. Con le
              carriere distinte la scelta è <strong>definitiva al momento del concorso</strong>.
            </p>
            <p className="mt-2">Due concorsi separati, due percorsi di carriera separati.</p>
          </>
        ),
      },
      {
        label: 'Ordinamento giudiziario?',
        content: (
          <p>
            L&apos;insieme delle norme che regolano l&apos;organizzazione della magistratura: come si
            entra, come si fa carriera, come sono organizzati i tribunali. La riforma costituzionale
            modifica il quadro di principi; poi serviranno leggi ordinarie per attuarla.
          </p>
        ),
      },
    ],
  },
  {
    label: 'Art. 104 — sostituzione integrale',
    title: 'Due CSM separati. Membri sorteggiati, non più eletti. La quota togati/laici si inverte',
    description:
      'Oggi: un CSM, componenti eletti (2/3 magistrati, 1/3 Parlamento). Domani: due CSM, componenti sorteggiati (1/3 magistrati, 2/3 da lista parlamentare).',
    chips: [
      {
        label: 'Sorteggiati?',
        content: (
          <p>
            Oggi i membri togati del CSM sono <strong>eletti</strong> dai colleghi. La riforma
            introduce il <strong>sorteggio</strong>: i nomi vengono estratti a caso. Anche i membri
            laici vengono sorteggiati da un elenco pre-compilato dal Parlamento. Il sorteggio è un
            meccanismo inedito per un organo costituzionale italiano.
          </p>
        ),
      },
      {
        label: 'La quota si inverte?',
        content: (
          <>
            <p>
              <strong>Oggi:</strong> 2/3 magistrati (togati), 1/3 Parlamento (laici).
            </p>
            <p className="mt-1">
              <strong>Con la riforma:</strong> 1/3 magistrati sorteggiati, 2/3 da lista
              parlamentare.
            </p>
            <p className="mt-2">
              I favorevoli parlano di maggiore democraticità. I critici temono una riduzione
              dell&apos;autogoverno della magistratura.
            </p>
          </>
        ),
      },
      {
        label: 'Lista parlamentare?',
        content: (
          <p>
            Il Parlamento compila un elenco di candidati (professori e avvocati con 15+ anni). Da
            questo elenco vengono poi sorteggiati i 2/3 dei componenti. Il Parlamento decide chi può
            finire nell&apos;elenco; il sorteggio decide chi viene estratto.
          </p>
        ),
      },
      {
        label: 'Perché il sorteggio?',
        content: (
          <>
            <p>
              La motivazione dichiarata: eliminare il <strong>correntismo</strong>. Oggi i magistrati
              si organizzano in correnti che competono per eleggere i &quot;propri&quot; candidati al
              CSM.
            </p>
            <p className="mt-2">
              I critici rispondono che il sorteggio sostituisce un meccanismo di responsabilità
              (l&apos;elezione) con uno aleatorio.
            </p>
          </>
        ),
      },
    ],
  },
  {
    label: 'Art. 105 — sostituzione integrale',
    title: 'La disciplina viene sottratta ai CSM e affidata alla nuova Alta Corte disciplinare',
    description:
      "Ogni CSM gestisce la carriera dei propri magistrati. La giurisdizione disciplinare passa a un nuovo organo: l'Alta Corte disciplinare, composta da 15 membri.",
    chips: [
      {
        label: 'Alta Corte disciplinare?',
        content: (
          <p>
            Un organo completamente nuovo. Si occuperà esclusivamente della disciplina dei
            magistrati. Oggi questa funzione è del CSM (sezione disciplinare). La riforma la
            trasferisce a questo nuovo organo separato.
          </p>
        ),
      },
      {
        label: '15 membri?',
        content: (
          <ul className="list-disc pl-4 space-y-0.5">
            <li>
              <strong>3</strong> nominati dal Presidente della Repubblica
            </li>
            <li>
              <strong>3</strong> sorteggiati da elenco compilato dal Parlamento
            </li>
            <li>
              <strong>6</strong> magistrati giudicanti, sorteggiati (20+ anni di carriera)
            </li>
            <li>
              <strong>3</strong> magistrati requirenti, sorteggiati (20+ anni di carriera)
            </li>
          </ul>
        ),
      },
      {
        label: 'Sottratta ai CSM?',
        content: (
          <>
            <p>
              La motivazione: evitare che i magistrati &quot;si giudichino tra loro&quot;. I critici
              temono che un organo disciplinare esterno possa diventare strumento di pressione
              politica — come avvenuto in Polonia.
            </p>
          </>
        ),
      },
    ],
  },
  {
    label: 'Art. 106, comma 3',
    title: 'Nomina per meriti insigni estesa anche ai sostituti procuratori generali',
    description:
      'Oggi professori e avvocati illustri possono diventare consiglieri di cassazione. La riforma aggiunge la possibilità di diventare sostituti procuratori generali.',
    chips: [
      {
        label: 'Meriti insigni?',
        content: (
          <p>
            Un meccanismo che permette di nominare consiglieri di cassazione senza concorso,
            scegliendo tra professori e avvocati che si siano distinti in modo eccezionale. È un
            canale molto stretto, usato rarissimamente.
          </p>
        ),
      },
    ],
  },
  {
    label: 'Art. 107, comma 1',
    title: "L'inamovibilità resta, ma il provvedimento spetta al CSM competente per carriera",
    description:
      "I magistrati restano inamovibili. L'unica modifica: trasferimento e sospensione sono decisi dal rispettivo CSM, non più da un CSM unico.",
    chips: [
      {
        label: 'Inamovibilità?',
        content: (
          <p>
            Un magistrato <strong>non può essere trasferito, sospeso o rimosso</strong> se non per
            decisione del CSM con precise garanzie procedurali. Protegge l&apos;indipendenza: un
            giudice che indaga un caso scomodo non può essere &quot;spostato&quot;.
          </p>
        ),
      },
    ],
  },
  {
    label: 'Art. 110, comma 1',
    title: 'Adeguamento tecnico: il Ministro della Giustizia opera nel rispetto di ciascun CSM',
    description:
      'Il Ministro mantiene le competenze sui servizi della giustizia. Il riferimento passa da "il CSM" a "ciascun CSM".',
    chips: [
      {
        label: 'Ministro della Giustizia?',
        content: (
          <p>
            Il Ministro è un membro del governo, non della magistratura. Ha competenze
            sull&apos;organizzazione dei servizi (edilizia, personale, informatica) ma{' '}
            <strong>non</strong> sulle carriere dei magistrati. Questo articolo ribadisce quel
            confine.
          </p>
        ),
      },
    ],
  },
]

// ============================================================================
// Data: Cosa fanno gli altri paesi
// ============================================================================

const altriPaesi: ExplainerItem[] = [
  {
    label: 'Il modello italiano attuale',
    title: 'Magistratura unificata',
    description:
      'Giudici e PM appartengono allo stesso ordine, governato da un unico CSM. Possono passare da una funzione all\u2019altra.',
    chips: [
      {
        label: 'Italia',
        content: (
          <p>
            L&apos;Italia è oggi uno dei pochi paesi europei con magistratura pienamente unificata.
            Il PM è un magistrato indipendente, non un funzionario del governo. Questo modello è
            unico nel panorama occidentale ed è esplicitamente tutelato dalla Costituzione del 1948.
          </p>
        ),
      },
    ],
  },
  {
    label: 'Il modello proposto dalla riforma',
    title: 'Separati ma giudiziari',
    description:
      'Carriere distinte, ma i PM restano all\u2019interno dell\u2019ordine giudiziario. Il controllo è in parte giudiziario, in parte esecutivo.',
    chips: [
      {
        label: 'Francia',
        content: (
          <>
            <p>
              Separazione storica tra <em>magistrats du siège</em> e{' '}
              <em>magistrats du parquet</em>. Ma i PM sono rimasti sotto l&apos;autorità del
              Ministro della Giustizia.
            </p>
            <p className="mt-2">
              Risultato: separazione formale, ma <strong>influenza politica sull&apos;azione
              penale</strong>. Solo nel 2013 una legge ha vietato al Ministro di dare istruzioni
              sui singoli casi.
            </p>
          </>
        ),
      },
    ],
  },
  {
    label: 'Un modello più netto',
    title: 'Separati ed esecutivi',
    description:
      'I PM sono funzionari pubblici, dipendono dal Ministero della Giustizia. Non fanno parte dell\u2019ordine giudiziario.',
    chips: [
      {
        label: 'Germania',
        content: (
          <>
            <p>
              I PM (<em>Staatsanwaltschaft</em>) sono completamente separati dai giudici — sono
              funzionari pubblici soggetti a istruzioni dei superiori e in ultima istanza del
              Ministro della Giustizia.
            </p>
            <p className="mt-2">
              Nel 2019 la CGUE ha stabilito che i PM tedeschi{' '}
              <strong>non possono essere considerati &quot;autorità giudiziaria&quot;</strong>{' '}
              proprio per la mancanza di indipendenza dall&apos;esecutivo.
            </p>
          </>
        ),
      },
      {
        label: 'Paesi Bassi',
        content: (
          <p>
            Modello simile alla Germania. I PM sono parte dell&apos;esecutivo, non della
            magistratura. Il Ministro della Giustizia può dare istruzioni generali e, in teoria,
            anche su singoli casi.
          </p>
        ),
      },
    ],
  },
  {
    label: 'Il modello anglosassone',
    title: 'Pienamente politici',
    description:
      'I PM sono eletti dal popolo o nominati direttamente dal governo. La separazione è totale e il controllo è politico.',
    chips: [
      {
        label: 'USA',
        content: (
          <p>
            I <em>District Attorneys</em> sono eletti dal popolo. L&apos;Attorney General è nominato
            dal Presidente. Il sistema è esplicitamente politico: i procuratori fanno campagna
            elettorale e rispondono agli elettori, non a un organo giudiziario.
          </p>
        ),
      },
      {
        label: 'Regno Unito',
        content: (
          <p>
            Il <em>Crown Prosecution Service</em> è un organo del governo. I procuratori sono
            funzionari pubblici nominati. Separazione totale dalla magistratura giudicante, con
            controllo esecutivo.
          </p>
        ),
      },
    ],
  },
  {
    label: 'Casi di studio recenti',
    title: 'Riforme in direzioni opposte',
    description:
      'Non esiste una tendenza unica. Alcuni paesi rafforzano i PM, altri li subordinano. Il contesto istituzionale conta più del modello.',
    chips: [
      {
        label: 'Spagna',
        content: (
          <p>
            Nel 2025 ha approvato una grande riforma che trasferisce le indagini penali dai giudici
            istruttori ai PM — <strong>rafforzando</strong> il ruolo dei PM, non separandolo per
            indebolirlo. Direzione opposta al dibattito italiano.
          </p>
        ),
      },
      {
        label: 'Polonia e Ungheria',
        content: (
          <>
            <p>
              La riforma giudiziaria polacca è diventata il veicolo per il controllo politico della
              magistratura: nomine allineate, camera disciplinare usata per rimuovere giudici
              dissidenti. L&apos;UE ha sanzionato la Polonia per violazione dell&apos;indipendenza
              giudiziaria.
            </p>
            <p className="mt-2">
              <strong>Non direttamente comparabile</strong> (scopi diversi), ma dimostra che chi
              controlla il processo disciplinare ha un potere enorme.
            </p>
          </>
        ),
      },
    ],
  },
]

// ============================================================================
// Data: Come ragionare — 7 domande
// ============================================================================

const setteDomande: ExplainerItem[] = [
  {
    label: '1. Comprensione',
    title: 'Cosa mi viene chiesto davvero?',
    description:
      'Qual è la domanda in parole semplici? Qual è la situazione attuale? Cosa cambierebbe concretamente se vince il SI? Cosa resta uguale in ogni caso?',
    chips: [
      {
        label: 'Applicato a questo referendum',
        content: (
          <p>
            I magistrati continuano ad entrare per concorso. L&apos;indipendenza della magistratura
            resta un principio costituzionale. Ciò che cambia è l&apos;organizzazione interna:
            carriere separate, due organi di autogoverno, un nuovo tribunale disciplinare.
          </p>
        ),
      },
    ],
  },
  {
    label: '2. Diagnosi del Problema',
    title: "C'è davvero un problema da risolvere?",
    description:
      'Quale problema vuole risolvere questa riforma? Il problema è reale e documentato, oppure percepito/politico? Quanto è grave? Come funziona effettivamente il sistema attuale?',
    chips: [
      {
        label: 'Applicato a questo referendum',
        content: (
          <p>
            Il problema dichiarato è che condividere la carriera creerebbe uno squilibrio a favore
            dell&apos;accusa — il giudice sarebbe troppo vicino al PM. Tuttavia, il tasso di
            assoluzione in Italia è circa il 45% (tra i più alti d&apos;Europa), il che complica la
            narrativa del &quot;giudice che sta dalla parte del PM&quot;.
          </p>
        ),
      },
    ],
  },
  {
    label: '3. Adeguatezza della Soluzione',
    title: 'Questa riforma risolve quel problema?',
    description:
      'Il cambiamento proposto affronta logicamente il problema identificato? Esistono alternative più semplici? Cosa mostrano le esperienze di altri paesi? La riforma fa più di quanto necessario?',
    chips: [
      {
        label: 'Applicato a questo referendum',
        content: (
          <p>
            La Francia ha separato le carriere ma ha ottenuto controllo politico sui PM. La Germania
            ha separazione completa ma i PM non sono considerati &quot;autorità giudiziaria&quot;
            dalla CGUE. La Spagna nel 2025 ha trasferito i poteri investigativi ai PM (direzione
            diversa). Le evidenze comparative sono miste — la separazione da sola non garantisce i
            benefici dichiarati.
          </p>
        ),
      },
    ],
  },
  {
    label: '4. Valutazione dei Rischi',
    title: 'Cosa potrebbe andare storto?',
    description:
      'Quali sono le conseguenze indesiderate plausibili? Questo cambiamento è reversibile? Apre la porta a ulteriori cambiamenti in una direzione preoccupante? Chi controlla le nuove strutture?',
    chips: [
      {
        label: 'Applicato a questo referendum',
        content: (
          <p>
            Rischio che i PM separati perdano le garanzie di autogoverno giudiziario. La nuova Alta
            Corte disciplinare è composta in parte per sorteggio — meccanismo nuovo e non testato.
            Polonia e Ungheria dimostrano che i meccanismi disciplinari possono diventare strumenti
            di controllo politico. Una modifica costituzionale è praticamente irreversibile.
          </p>
        ),
      },
    ],
  },
  {
    label: '5. Interessi e Legittimità',
    title: 'Chi vuole questa riforma e perché?',
    description:
      'Chi promuove questa riforma e con quali motivazioni dichiarate? Chi si oppone? Ci sono interessi non dichiarati da entrambe le parti? Come è stata elaborata la riforma?',
    chips: [
      {
        label: 'Applicato a questo referendum',
        content: (
          <p>
            Promossa dalla coalizione di centrodestra (storicamente in tensione con la
            magistratura). Avversata dalla maggior parte delle associazioni dei magistrati e da parte
            dell&apos;opposizione. La riforma è passata senza la maggioranza dei 2/3 — ed è proprio
            per questo che i cittadini hanno diritto a un voto confermativo.
          </p>
        ),
      },
    ],
  },
  {
    label: '6. La Meccanica del Voto',
    title: 'Come funziona il mio voto?',
    description:
      "Che tipo di referendum è? C'è un quorum? Cosa succede se non voto?",
    chips: [
      {
        label: 'Applicato a questo referendum',
        content: (
          <p>
            Referendum costituzionale confermativo. <strong>Non c&apos;è quorum.</strong> Vince la
            maggioranza semplice dei voti validi. Ogni voto conta allo stesso modo —
            l&apos;astensione non ha alcun valore strategico, significa solo lasciare che decidano
            gli altri.
          </p>
        ),
      },
    ],
  },
  {
    label: '7. Pesatura Personale',
    title: 'Cosa conta di più per me?',
    description:
      'Quale dei livelli precedenti pesa di più per me? Sono a mio agio con l\u2019incertezza? Qual è il mio default: cambiare o mantenere lo status quo?',
    chips: [
      {
        label: 'Nessuno può rispondere al posto tuo',
        content: (
          <p>
            Questa è la domanda più personale. Non esiste una risposta oggettivamente
            &quot;giusta&quot;. Se hai attraversato i sei livelli precedenti con onestà, la tua
            posizione — qualunque essa sia — è una posizione solida.
          </p>
        ),
      },
    ],
  },
]

// ============================================================================
// Page
// ============================================================================

export default function ItaliaReferendum2026Page() {
  return (
    <PageNavLayout sections={pageNavSections}>
      <PageHeader
        title="Referendum Costituzionale: Separazione delle Carriere"
        description="22-23 Marzo 2026"
      />

      <section id="intro" className="scroll-mt-32 lg:scroll-mt-20">
        <Muted className="mb-6">
          Ti viene chiesto se approvare una modifica alla Costituzione che separa le carriere di
          giudici e pubblici ministeri.
        </Muted>

        <Box variant="muted" padding="md" className="mb-6">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1">
            Quesito sulla scheda elettorale
          </p>
          <p className="text-sm italic text-muted-foreground leading-relaxed">
            Approvate il testo della legge costituzionale concernente &laquo;Norme in materia di
            ordinamento giurisdizionale e di istituzione della Corte disciplinare&raquo; approvato
            dal Parlamento e pubblicato nella Gazzetta Ufficiale n.&nbsp;253 del
            30&nbsp;ottobre&nbsp;2025?
          </p>
        </Box>

        <div className="grid grid-cols-2 gap-3 mb-10">
          <Box variant="default" padding="md" className="text-center">
            <p className="text-lg font-bold text-positive">SI</p>
            <p className="text-xs text-muted-foreground">La riforma entra in vigore</p>
          </Box>
          <Box variant="default" padding="md" className="text-center">
            <p className="text-lg font-bold text-negative">NO</p>
            <p className="text-xs text-muted-foreground">Si torna alla situazione attuale</p>
          </Box>
        </div>
      </section>

      <SectionL1 id="cronologia" title="Cronologia">
        <Explainer type="timeline" items={cronologia} />
      </SectionL1>

      <SectionL1 id="articoli" title="Cosa cambia nella Costituzione">
        <Explainer items={articoli} />
      </SectionL1>

      <SectionL1 id="come-ragionare" title="Come Ragionare: 7 Domande">
        <Muted className="mb-4">
          Ogni referendum è una decisione a strati. Ogni strato costruisce sul precedente. Un
          elettore che riesce a rispondere a tutti e sette ha una posizione solida —
          indipendentemente da cosa vota.
        </Muted>
        <Explainer items={setteDomande} />
      </SectionL1>

      <SectionL1 id="altri-paesi" title="Cosa Fanno gli Altri Paesi">
        <Explainer items={altriPaesi} />
      </SectionL1>

      <SectionL1 id="info-pratiche" title="Informazioni Pratiche">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Box variant="muted" padding="md">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">
              Quando
            </p>
            <p className="text-sm font-medium">22-23 Marzo 2026</p>
          </Box>
          <Box variant="muted" padding="md">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">
              Tipo
            </p>
            <p className="text-sm font-medium">Referendum costituzionale confermativo</p>
          </Box>
          <Box variant="muted" padding="md">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">
              Quorum
            </p>
            <p className="text-sm font-medium">Nessuno</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Vince la maggioranza semplice dei votanti
            </p>
          </Box>
          <Box variant="muted" padding="md">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">
              Perché si vota
            </p>
            <p className="text-sm text-muted-foreground">
              Il Parlamento ha approvato la riforma senza i 2/3. La Costituzione prevede che i
              cittadini possano confermare o respingere la modifica.
            </p>
          </Box>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Box variant="default" padding="md" className="text-center">
            <p className="text-lg font-bold text-positive">SI</p>
            <p className="text-xs text-muted-foreground">La riforma entra in vigore</p>
          </Box>
          <Box variant="default" padding="md" className="text-center">
            <p className="text-lg font-bold text-negative">NO</p>
            <p className="text-xs text-muted-foreground">Si torna alla situazione attuale</p>
          </Box>
        </div>

        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-2">
          Oggi vs Se vince il SI
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Oggi</th>
                <th className="text-left py-2 font-medium text-muted-foreground">Se vince il SI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-2 pr-4 text-muted-foreground">
                  Un&apos;unica magistratura (giudici e PM insieme)
                </td>
                <td className="py-2">Carriere separate fin dall&apos;ingresso</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-muted-foreground">
                  Un solo CSM governa tutti i magistrati
                </td>
                <td className="py-2">Due CSM distinti (uno per giudici, uno per PM)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-muted-foreground">
                  La disciplina è gestita dal CSM
                </td>
                <td className="py-2">Nuova Alta Corte disciplinare costituzionale</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-muted-foreground">
                  Passaggio libero tra funzioni (giudicare / accusare)
                </td>
                <td className="py-2">Scelta definitiva al momento del concorso</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-muted-foreground">
                  Membri CSM eletti dai colleghi (2/3 togati)
                </td>
                <td className="py-2">Membri CSM sorteggiati (1/3 togati)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionL1>
    </PageNavLayout>
  )
}
