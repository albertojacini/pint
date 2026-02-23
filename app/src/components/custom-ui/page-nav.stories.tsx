import type { Meta, StoryObj } from '@storybook/react'
import { PageNav, PageNavLayout } from './page-nav'

const sections = [
  { id: 'intro', label: 'Introduzione' },
  { id: 'cronologia', label: 'Cronologia' },
  { id: 'articoli', label: 'Articoli modificati' },
  { id: 'trasparenza', label: 'Trasparenza' },
  { id: 'domande', label: '7 Domande' },
  { id: 'paralleli', label: 'Paralleli' },
  { id: 'pratico', label: 'Info pratiche' },
]

// ============================================================================
// PageNav — sidebar only
// ============================================================================

const navMeta = {
  title: 'Custom-UI/PageNav',
  component: PageNav,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof PageNav>

export default navMeta
type Story = StoryObj<typeof navMeta>

export const Sidebar: Story = {
  args: {
    sections,
  },
  decorators: [
    (Story) => (
      <div className="w-[180px]">
        <Story />
      </div>
    ),
  ],
}

// ============================================================================
// PageNavLayout — full layout with scrollable content
// ============================================================================

function SectionBlock({ id, label }: { id: string; label: string }) {
  return (
    <section id={id} className="py-12">
      <h2 className="text-lg font-semibold mb-3">{label}</h2>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <p key={i} className="text-sm text-muted-foreground">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
            ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
            ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        ))}
      </div>
    </section>
  )
}

export const FullLayout: Story = {
  args: { sections },
  render: (args) => (
    <PageNavLayout sections={args.sections}>
      {sections.map((s) => (
        <SectionBlock key={s.id} {...s} />
      ))}
    </PageNavLayout>
  ),
}
