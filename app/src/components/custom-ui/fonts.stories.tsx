import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Custom-UI/Fonts',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta
type Story = StoryObj

const fonts = [
  {
    name: 'Noto Sans',
    family: '"Noto Sans", sans-serif',
    note: 'Primary — universal language support, neutral and reliable',
  },
  {
    name: 'ui-monospace',
    family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    note: 'Secondary — data-forward elements (dates, counts, IDs)',
  },
]

function FontSample({ name, family, note }: { name: string; family: string; note: string }) {
  return (
    <div className="border border-border rounded-lg p-6 space-y-4" style={{ fontFamily: family }}>
      <div className="flex items-baseline justify-between border-b border-border pb-3 mb-2">
        <h3 className="text-lg font-semibold">{name}</h3>
        <span className="text-xs text-muted-foreground">{note}</span>
      </div>

      {/* Page-level heading */}
      <h1 className="text-3xl font-bold">Public housing policy in Barcelona</h1>

      {/* Section heading */}
      <h2 className="text-2xl font-semibold">Ownership regulations</h2>

      {/* Subsection */}
      <h3 className="text-xl font-semibold">Rental price limits</h3>

      {/* Lead paragraph */}
      <p className="text-lg text-muted-foreground">
        A comprehensive overview of housing provisions across the metropolitan area, covering
        ownership, rental, and social housing policies.
      </p>

      {/* Body text */}
      <p className="text-sm leading-relaxed">
        The regulation establishes a maximum annual rent increase of 2% for residential properties
        within the metropolitan area. New construction is exempt for the first 10 years. Landlords
        must register all rental properties and submit annual pricing reports to ensure compliance
        with tenant notification requirements.
      </p>

      {/* Muted / metadata */}
      <p className="text-sm text-muted-foreground">
        Last updated 3 days ago · 12 provisions · 4 entities
      </p>

      {/* Mixed weights row */}
      <div className="flex gap-6 text-sm pt-2 border-t border-border">
        <span className="font-normal">Regular 400</span>
        <span className="font-medium">Medium 500</span>
        <span className="font-semibold">Semibold 600</span>
        <span className="font-bold">Bold 700</span>
      </div>
    </div>
  )
}

export const SideBySide: Story = {
  render: () => (
    <div className="max-w-3xl space-y-8">
      {fonts.map((font) => (
        <FontSample key={font.name} {...font} />
      ))}
    </div>
  ),
}
