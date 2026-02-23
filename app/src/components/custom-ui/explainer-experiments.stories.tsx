import type { Meta, StoryObj } from '@storybook/react'
import { CircleHelp } from 'lucide-react'

const meta = {
  title: 'Custom-UI/Explainer Experiments',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta
type Story = StoryObj

// ============================================================================
// Sample data
// ============================================================================

const timelineItems = [
  {
    label: '2024',
    title: 'Il governo presenta un disegno di legge costituzionale',
    description:
      'La proposta modifica 7 articoli della Costituzione relativi alla magistratura, al CSM e al sistema disciplinare.',
    chips: ['Il governo?', 'Disegno di legge?', 'Legge costituzionale?', '7 articoli?', 'Magistratura?', 'CSM?'],
  },
  {
    label: 'Gen – Mar 2025',
    title: '1a votazione: Camera e Senato approvano in prima lettura',
    description:
      "L'Art. 138 della Costituzione richiede una doppia deliberazione per ogni revisione costituzionale.",
    chips: ['Camera e Senato?', 'Prima lettura?', 'Art. 138?', 'Doppia deliberazione?'],
  },
  {
    label: 'Set – Ott 2025',
    title: '2a votazione: approvata con maggioranza assoluta, non con i 2/3',
    description:
      'Camera (18 set) e Senato (29 ott) approvano. Senza i 2/3 si attiva la possibilità del referendum confermativo.',
    chips: ['Maggioranza assoluta?', 'Perché contano i 2/3?', 'Referendum confermativo?'],
  },
  {
    label: '22-23 Marzo 2026',
    title: 'Si vota: SI o NO',
    description:
      "Nessun quorum. Vince la maggioranza semplice dei voti validi. L'astensione non ha valore strategico.",
    chips: ['Nessun quorum?', 'Maggioranza semplice?', 'Voti validi?'],
  },
]

const articleItems = [
  {
    label: 'Art. 87, comma 10',
    title: 'Il Presidente della Repubblica presiederà due CSM separati invece di uno',
    description:
      'Oggi presiede un unico Consiglio Superiore della Magistratura. Con la riforma presiederà sia il CSM giudicante che il CSM requirente.',
    chips: ['Dettagli', 'Due CSM?', 'Giudicante e requirente?'],
  },
  {
    label: 'Art. 104 — sostituzione integrale',
    title: 'Due CSM separati. Membri sorteggiati, non più eletti. La quota togati/laici si inverte',
    description:
      'Oggi: un CSM, componenti eletti (2/3 magistrati, 1/3 Parlamento). Domani: due CSM, componenti sorteggiati (1/3 magistrati, 2/3 da lista parlamentare).',
    chips: ['Dettagli', 'Sorteggiati?', 'La quota si inverte?', 'Lista parlamentare?', 'Togati e laici?'],
  },
  {
    label: 'Art. 105 — sostituzione integrale',
    title: 'La disciplina viene sottratta ai CSM e affidata alla nuova Alta Corte disciplinare',
    description:
      "Ogni CSM gestisce la carriera dei propri magistrati. La giurisdizione disciplinare passa a un nuovo organo: l'Alta Corte disciplinare, composta da 15 membri.",
    chips: ['Dettagli', 'Alta Corte disciplinare?', '15 membri?', 'Sottratta ai CSM?'],
  },
  {
    label: 'Art. 107, comma 1',
    title: "L'inamovibilità resta, ma il provvedimento spetta al CSM competente per carriera",
    description:
      "I magistrati restano inamovibili. L'unica modifica: il trasferimento o la sospensione sono decisi dal rispettivo CSM (giudicante o requirente), non più da un CSM unico.",
    chips: ['Dettagli', 'Inamovibilità?', 'Rispettivo CSM?'],
  },
]

// ============================================================================
// Shared pieces
// ============================================================================

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
      <CircleHelp className="h-3 w-3 opacity-50" />
      {children}
    </button>
  )
}

function ItemContent({
  label,
  title,
  description,
  chips,
}: {
  label: string
  title: string
  description: string
  chips: string[]
}) {
  return (
    <>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">{label}</span>
      <p className="text-sm font-medium leading-snug mt-0.5">{title}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        {chips.map((chip) => (
          <Chip key={chip}>{chip}</Chip>
        ))}
      </div>
    </>
  )
}

// ============================================================================
// type="timeline" — vertical line + dots
// ============================================================================

export const Timeline: Story = {
  name: 'type=timeline',
  render: () => (
    <div className="max-w-xl">
      <div className="relative pl-6">
        <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-5">
          {timelineItems.map((item, i) => (
            <div key={i} className="relative">
              <div
                className={`absolute -left-6 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background ${
                  i === timelineItems.length - 1 ? 'bg-primary' : 'bg-muted-foreground/40'
                }`}
              />
              <ItemContent {...item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
}

// ============================================================================
// type="items" (default) — plain list, divider-separated
// ============================================================================

export const Items: Story = {
  name: 'type=items (default)',
  render: () => (
    <div className="max-w-xl">
      <div className="divide-y divide-border">
        {articleItems.map((item, i) => (
          <div key={i} className="py-4 first:pt-0 last:pb-0">
            <ItemContent {...item} />
          </div>
        ))}
      </div>
    </div>
  ),
}
