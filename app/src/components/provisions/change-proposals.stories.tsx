import type { Meta, StoryObj } from '@storybook/react'
import type { EvaluationSummary } from '@/lib/db/schema/government'
import { ChangeProposals } from './change-proposals'

const meta = {
  title: 'Provisions/ChangeProposals',
  component: ChangeProposals,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600, fontFamily: 'system-ui, sans-serif' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChangeProposals>

export default meta
type Story = StoryObj<typeof meta>

const mixedProposals: NonNullable<EvaluationSummary['proposals']> = {
  type: 'proposals',
  confidence: 'medium',
  items: [
    {
      label: 'Estendere orari',
      description: 'Estendere la fascia oraria di applicazione dalle 7:00 alle 21:00',
      support: 142,
      oppose: 89,
    },
    {
      label: 'Rimuovere',
      description: 'Abolire completamente il provvedimento e tornare al libero accesso',
      support: 67,
      oppose: 203,
    },
    {
      label: 'Aumentare tariffa',
      description: 'Portare la tariffa giornaliera da €5 a €7.50 per disincentivare ulteriormente il traffico',
      support: 95,
      oppose: 88,
    },
    {
      label: 'Esenzione residenti',
      description: 'Introdurre un pass gratuito per i residenti della zona interessata',
      support: 178,
      oppose: 34,
    },
  ],
}

export const Default: Story = {
  args: { data: mixedProposals },
}

export const SingleProposal: Story = {
  args: {
    data: {
      type: 'proposals',
      confidence: 'high',
      items: [mixedProposals.items[0]],
    },
  },
}

export const Empty: Story = {
  args: { data: null },
}
