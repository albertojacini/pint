import type { Meta, StoryObj } from '@storybook/react'
import { CircleHelp, Info } from 'lucide-react'

const meta = {
  title: 'Custom-UI/Explainer Help Links Experiments',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta
type Story = StoryObj

// ============================================================================
// Shared link class (settled: text-link + dashed underline)
// ============================================================================

const link = 'text-link underline decoration-dashed underline-offset-2 hover:decoration-solid transition-colors'

// ============================================================================
// Helper
// ============================================================================

function IntroBlock({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider mb-1">
        {label}
      </p>
      <dl className="text-sm space-y-1 mb-6">
        <div className="flex gap-2">
          <dt className="text-muted-foreground shrink-0 w-28">Se vince il SI</dt>
          <dd>{children}</dd>
        </div>
      </dl>
    </div>
  )
}

// ============================================================================
// A. Base — plain link, same text size, no icon (B3b settled)
// ============================================================================

export const A_Base: Story = {
  name: 'A — Base (plain link, no icon)',
  render: () => (
    <div className="max-w-xl">
      <IntroBlock label="Settled style: text-link + dashed underline">
        <ul className="space-y-1">
          <li>Carriere separate fin dall&apos;ingresso <button className={link}>dettagli</button></li>
          <li>Due CSM distinti (uno per giudici, uno per PM) <button className={link}>dettagli</button></li>
          <li>Nuova Alta Corte disciplinare costituzionale <button className={link}>dettagli</button></li>
          <li>Scelta definitiva al momento del concorso <button className={link}>dettagli</button></li>
          <li>Membri CSM sorteggiati (1/3 togati) <button className={link}>dettagli</button></li>
        </ul>
      </IntroBlock>
    </div>
  ),
}

// ============================================================================
// B. Multiple links inline (with spacing)
// ============================================================================

export const B_MultipleLinksInline: Story = {
  name: 'B — Multiple links inline',
  render: () => (
    <div className="max-w-xl space-y-8">
      <IntroBlock label="B1 — Two links, separated by middot">
        <ul className="space-y-1">
          <li>Carriere separate fin dall&apos;ingresso <button className={link}>dettagli</button> &middot; <button className={link}>confronto</button></li>
          <li>Due CSM distinti (uno per giudici, uno per PM) <button className={link}>dettagli</button> &middot; <button className={link}>composizione</button></li>
          <li>Nuova Alta Corte disciplinare costituzionale <button className={link}>dettagli</button> &middot; <button className={link}>15 membri</button></li>
        </ul>
      </IntroBlock>

      <IntroBlock label="B2 — Two links, separated by pipe">
        <ul className="space-y-1">
          <li>Carriere separate fin dall&apos;ingresso <span className="text-muted-foreground/30 mx-0.5">|</span> <button className={link}>dettagli</button> <span className="text-muted-foreground/30 mx-0.5">|</span> <button className={link}>confronto</button></li>
          <li>Due CSM distinti (uno per giudici, uno per PM) <span className="text-muted-foreground/30 mx-0.5">|</span> <button className={link}>dettagli</button> <span className="text-muted-foreground/30 mx-0.5">|</span> <button className={link}>composizione</button></li>
          <li>Nuova Alta Corte disciplinare costituzionale <span className="text-muted-foreground/30 mx-0.5">|</span> <button className={link}>dettagli</button> <span className="text-muted-foreground/30 mx-0.5">|</span> <button className={link}>15 membri</button></li>
        </ul>
      </IntroBlock>

      <IntroBlock label="B3 — Two links, just spacing (gap-2)">
        <ul className="space-y-1">
          <li>Carriere separate fin dall&apos;ingresso <span className="inline-flex gap-2 ml-1"><button className={link}>dettagli</button> <button className={link}>confronto</button></span></li>
          <li>Due CSM distinti (uno per giudici, uno per PM) <span className="inline-flex gap-2 ml-1"><button className={link}>dettagli</button> <button className={link}>composizione</button></span></li>
          <li>Nuova Alta Corte disciplinare costituzionale <span className="inline-flex gap-2 ml-1"><button className={link}>dettagli</button> <button className={link}>15 membri</button></span></li>
        </ul>
      </IntroBlock>

      <IntroBlock label="B4 — Three links, separated by middot">
        <ul className="space-y-1">
          <li>Carriere separate fin dall&apos;ingresso <button className={link}>dettagli</button> &middot; <button className={link}>confronto</button> &middot; <button className={link}>oggi vs domani</button></li>
          <li>Due CSM distinti (uno per giudici, uno per PM) <button className={link}>dettagli</button> &middot; <button className={link}>composizione</button> &middot; <button className={link}>sorteggio</button></li>
        </ul>
      </IntroBlock>

      <IntroBlock label="B5 — Two links, separated by slash">
        <ul className="space-y-1">
          <li>Carriere separate fin dall&apos;ingresso <span className="text-muted-foreground/30 mx-0.5">/</span> <button className={link}>dettagli</button> <span className="text-muted-foreground/30 mx-0.5">/</span> <button className={link}>confronto</button></li>
          <li>Due CSM distinti (uno per giudici, uno per PM) <span className="text-muted-foreground/30 mx-0.5">/</span> <button className={link}>dettagli</button> <span className="text-muted-foreground/30 mx-0.5">/</span> <button className={link}>composizione</button></li>
        </ul>
      </IntroBlock>
    </div>
  ),
}

// ============================================================================
// C. Capital first letter
// ============================================================================

export const C_CapitalFirstLetter: Story = {
  name: 'C — Capital first letter',
  render: () => (
    <div className="max-w-xl space-y-8">
      <IntroBlock label="C1 — 'Dettagli' (capitalized)">
        <ul className="space-y-1">
          <li>Carriere separate fin dall&apos;ingresso <button className={link}>Dettagli</button></li>
          <li>Due CSM distinti (uno per giudici, uno per PM) <button className={link}>Dettagli</button></li>
          <li>Nuova Alta Corte disciplinare costituzionale <button className={link}>Dettagli</button></li>
          <li>Scelta definitiva al momento del concorso <button className={link}>Dettagli</button></li>
          <li>Membri CSM sorteggiati (1/3 togati) <button className={link}>Dettagli</button></li>
        </ul>
      </IntroBlock>

      <IntroBlock label="C2 — 'Dettagli' capitalized + multiple links with middot">
        <ul className="space-y-1">
          <li>Carriere separate fin dall&apos;ingresso <button className={link}>Dettagli</button> &middot; <button className={link}>Confronto</button></li>
          <li>Due CSM distinti (uno per giudici, uno per PM) <button className={link}>Dettagli</button> &middot; <button className={link}>Composizione</button></li>
          <li>Nuova Alta Corte disciplinare costituzionale <button className={link}>Dettagli</button> &middot; <button className={link}>15 membri</button></li>
        </ul>
      </IntroBlock>

      <IntroBlock label="C3 — lowercase 'dettagli' (baseline for comparison)">
        <ul className="space-y-1">
          <li>Carriere separate fin dall&apos;ingresso <button className={link}>dettagli</button></li>
          <li>Due CSM distinti (uno per giudici, uno per PM) <button className={link}>dettagli</button></li>
          <li>Nuova Alta Corte disciplinare costituzionale <button className={link}>dettagli</button></li>
          <li>Scelta definitiva al momento del concorso <button className={link}>dettagli</button></li>
          <li>Membri CSM sorteggiati (1/3 togati) <button className={link}>dettagli</button></li>
        </ul>
      </IntroBlock>
    </div>
  ),
}

// ============================================================================
// D. Longer questions as link text
// ============================================================================

export const D_LongerQuestions: Story = {
  name: 'D — Longer question text',
  render: () => (
    <div className="max-w-xl space-y-8">
      <IntroBlock label="D1 — Descriptive link text">
        <ul className="space-y-1">
          <li>Carriere separate fin dall&apos;ingresso <button className={link}>cosa cambia concretamente</button></li>
          <li>Due CSM distinti (uno per giudici, uno per PM) <button className={link}>perché due e non uno</button></li>
          <li>Nuova Alta Corte disciplinare costituzionale <button className={link}>chi sono i 15 membri</button></li>
          <li>Scelta definitiva al momento del concorso <button className={link}>come funziona oggi</button></li>
          <li>Membri CSM sorteggiati (1/3 togati) <button className={link}>perché il sorteggio</button></li>
        </ul>
      </IntroBlock>

      <IntroBlock label="D2 — Question mark at the end">
        <ul className="space-y-1">
          <li>Carriere separate fin dall&apos;ingresso <button className={link}>cosa cambia?</button></li>
          <li>Due CSM distinti (uno per giudici, uno per PM) <button className={link}>perché due?</button></li>
          <li>Nuova Alta Corte disciplinare costituzionale <button className={link}>chi sono i 15 membri?</button></li>
          <li>Scelta definitiva al momento del concorso <button className={link}>come funziona oggi?</button></li>
          <li>Membri CSM sorteggiati (1/3 togati) <button className={link}>perché il sorteggio?</button></li>
        </ul>
      </IntroBlock>

      <IntroBlock label="D3 — Mixed: 'dettagli' + longer question">
        <ul className="space-y-1">
          <li>Carriere separate fin dall&apos;ingresso <button className={link}>dettagli</button> &middot; <button className={link}>cosa cambia concretamente?</button></li>
          <li>Due CSM distinti (uno per giudici, uno per PM) <button className={link}>dettagli</button> &middot; <button className={link}>perché due e non uno?</button></li>
          <li>Nuova Alta Corte disciplinare costituzionale <button className={link}>dettagli</button> &middot; <button className={link}>chi sono i 15 membri?</button></li>
        </ul>
      </IntroBlock>

      <IntroBlock label="D4 — Capitalized longer questions">
        <ul className="space-y-1">
          <li>Carriere separate fin dall&apos;ingresso <button className={link}>Cosa cambia concretamente</button></li>
          <li>Due CSM distinti (uno per giudici, uno per PM) <button className={link}>Perché due e non uno</button></li>
          <li>Nuova Alta Corte disciplinare costituzionale <button className={link}>Chi sono i 15 membri</button></li>
          <li>Scelta definitiva al momento del concorso <button className={link}>Come funziona oggi</button></li>
          <li>Membri CSM sorteggiati (1/3 togati) <button className={link}>Perché il sorteggio</button></li>
        </ul>
      </IntroBlock>
    </div>
  ),
}

// ============================================================================
// E. Icon trailing and preceding
// ============================================================================

const linkInline = `inline-flex items-center gap-0.5 ${link} align-middle`

export const E_WithIcons: Story = {
  name: 'E — With icons (trailing & preceding)',
  render: () => (
    <div className="max-w-xl space-y-8">
      <IntroBlock label="E1 — CircleHelp trailing">
        <ul className="space-y-1">
          <li>Carriere separate fin dall&apos;ingresso <button className={linkInline}>dettagli <CircleHelp className="h-3 w-3 opacity-60" /></button></li>
          <li>Due CSM distinti (uno per giudici, uno per PM) <button className={linkInline}>dettagli <CircleHelp className="h-3 w-3 opacity-60" /></button></li>
          <li>Nuova Alta Corte disciplinare costituzionale <button className={linkInline}>dettagli <CircleHelp className="h-3 w-3 opacity-60" /></button></li>
          <li>Scelta definitiva al momento del concorso <button className={linkInline}>dettagli <CircleHelp className="h-3 w-3 opacity-60" /></button></li>
          <li>Membri CSM sorteggiati (1/3 togati) <button className={linkInline}>dettagli <CircleHelp className="h-3 w-3 opacity-60" /></button></li>
        </ul>
      </IntroBlock>

      <IntroBlock label="E2 — CircleHelp preceding">
        <ul className="space-y-1">
          <li>Carriere separate fin dall&apos;ingresso <button className={linkInline}><CircleHelp className="h-3 w-3 opacity-60" /> dettagli</button></li>
          <li>Due CSM distinti (uno per giudici, uno per PM) <button className={linkInline}><CircleHelp className="h-3 w-3 opacity-60" /> dettagli</button></li>
          <li>Nuova Alta Corte disciplinare costituzionale <button className={linkInline}><CircleHelp className="h-3 w-3 opacity-60" /> dettagli</button></li>
          <li>Scelta definitiva al momento del concorso <button className={linkInline}><CircleHelp className="h-3 w-3 opacity-60" /> dettagli</button></li>
          <li>Membri CSM sorteggiati (1/3 togati) <button className={linkInline}><CircleHelp className="h-3 w-3 opacity-60" /> dettagli</button></li>
        </ul>
      </IntroBlock>

      <IntroBlock label="E3 — Info trailing">
        <ul className="space-y-1">
          <li>Carriere separate fin dall&apos;ingresso <button className={linkInline}>dettagli <Info className="h-3 w-3 opacity-60" /></button></li>
          <li>Due CSM distinti (uno per giudici, uno per PM) <button className={linkInline}>dettagli <Info className="h-3 w-3 opacity-60" /></button></li>
          <li>Nuova Alta Corte disciplinare costituzionale <button className={linkInline}>dettagli <Info className="h-3 w-3 opacity-60" /></button></li>
          <li>Scelta definitiva al momento del concorso <button className={linkInline}>dettagli <Info className="h-3 w-3 opacity-60" /></button></li>
          <li>Membri CSM sorteggiati (1/3 togati) <button className={linkInline}>dettagli <Info className="h-3 w-3 opacity-60" /></button></li>
        </ul>
      </IntroBlock>

      <IntroBlock label="E4 — Info preceding">
        <ul className="space-y-1">
          <li>Carriere separate fin dall&apos;ingresso <button className={linkInline}><Info className="h-3 w-3 opacity-60" /> dettagli</button></li>
          <li>Due CSM distinti (uno per giudici, uno per PM) <button className={linkInline}><Info className="h-3 w-3 opacity-60" /> dettagli</button></li>
          <li>Nuova Alta Corte disciplinare costituzionale <button className={linkInline}><Info className="h-3 w-3 opacity-60" /> dettagli</button></li>
          <li>Scelta definitiva al momento del concorso <button className={linkInline}><Info className="h-3 w-3 opacity-60" /> dettagli</button></li>
          <li>Membri CSM sorteggiati (1/3 togati) <button className={linkInline}><Info className="h-3 w-3 opacity-60" /> dettagli</button></li>
        </ul>
      </IntroBlock>

      <IntroBlock label="E5 — CircleHelp trailing, longer text">
        <ul className="space-y-1">
          <li>Carriere separate fin dall&apos;ingresso <button className={linkInline}>cosa cambia? <CircleHelp className="h-3 w-3 opacity-60" /></button></li>
          <li>Due CSM distinti (uno per giudici, uno per PM) <button className={linkInline}>perché due? <CircleHelp className="h-3 w-3 opacity-60" /></button></li>
          <li>Nuova Alta Corte disciplinare costituzionale <button className={linkInline}>chi sono i 15 membri? <CircleHelp className="h-3 w-3 opacity-60" /></button></li>
          <li>Scelta definitiva al momento del concorso <button className={linkInline}>come funziona oggi? <CircleHelp className="h-3 w-3 opacity-60" /></button></li>
          <li>Membri CSM sorteggiati (1/3 togati) <button className={linkInline}>perché il sorteggio? <CircleHelp className="h-3 w-3 opacity-60" /></button></li>
        </ul>
      </IntroBlock>

      <IntroBlock label="E6 — CircleHelp preceding, capitalized">
        <ul className="space-y-1">
          <li>Carriere separate fin dall&apos;ingresso <button className={linkInline}><CircleHelp className="h-3 w-3 opacity-60" /> Dettagli</button></li>
          <li>Due CSM distinti (uno per giudici, uno per PM) <button className={linkInline}><CircleHelp className="h-3 w-3 opacity-60" /> Dettagli</button></li>
          <li>Nuova Alta Corte disciplinare costituzionale <button className={linkInline}><CircleHelp className="h-3 w-3 opacity-60" /> Dettagli</button></li>
          <li>Scelta definitiva al momento del concorso <button className={linkInline}><CircleHelp className="h-3 w-3 opacity-60" /> Dettagli</button></li>
          <li>Membri CSM sorteggiati (1/3 togati) <button className={linkInline}><CircleHelp className="h-3 w-3 opacity-60" /> Dettagli</button></li>
        </ul>
      </IntroBlock>

      <IntroBlock label="E7 — Multiple links with trailing CircleHelp, middot separator">
        <ul className="space-y-1">
          <li>Carriere separate fin dall&apos;ingresso <button className={linkInline}>dettagli <CircleHelp className="h-3 w-3 opacity-60" /></button> &middot; <button className={linkInline}>confronto <CircleHelp className="h-3 w-3 opacity-60" /></button></li>
          <li>Due CSM distinti (uno per giudici, uno per PM) <button className={linkInline}>dettagli <CircleHelp className="h-3 w-3 opacity-60" /></button> &middot; <button className={linkInline}>composizione <CircleHelp className="h-3 w-3 opacity-60" /></button></li>
          <li>Nuova Alta Corte disciplinare costituzionale <button className={linkInline}>dettagli <CircleHelp className="h-3 w-3 opacity-60" /></button> &middot; <button className={linkInline}>15 membri <CircleHelp className="h-3 w-3 opacity-60" /></button></li>
        </ul>
      </IntroBlock>
    </div>
  ),
}
