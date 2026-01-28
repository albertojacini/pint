import type { Meta, StoryObj } from '@storybook/react'
import { RelevanceDots } from './relevance-dots'

const meta = {
  title: 'Foundations/Relevance Dots',
  component: RelevanceDots,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof RelevanceDots>

export default meta
type Story = StoryObj<typeof meta>

export const AllScores: Story = {
  args: { score: 5 },
  render: () => (
    <div className="space-y-3">
      {[null, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
        <div key={String(score)} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-12 text-right font-mono">
            {score === null ? 'null' : score}
          </span>
          <RelevanceDots score={score} />
        </div>
      ))}
    </div>
  ),
}

export const High: Story = {
  args: { score: 9 },
}

export const Medium: Story = {
  args: { score: 5 },
}

export const Low: Story = {
  args: { score: 2 },
}

export const Null: Story = {
  args: { score: null },
}

export const MediumSize: Story = {
  args: { score: 8, size: 'md' },
}
