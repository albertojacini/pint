import type { Meta, StoryObj } from '@storybook/react'
import { Section } from './section'

const meta = {
  title: 'Foundations/Section',
  component: Section,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Section>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Provisions',
    children: (
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border bg-card p-6">Provision A</div>
        <div className="rounded-lg border bg-card p-6">Provision B</div>
      </div>
    ),
  },
}

export const WithAction: Story = {
  args: {
    title: 'Recent changes',
    action: <button className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm">View all</button>,
    children: (
      <div className="space-y-2">
        <div className="rounded-lg border bg-card p-6">Change proposal #1</div>
        <div className="rounded-lg border bg-card p-6">Change proposal #2</div>
      </div>
    ),
  },
}

export const NoTitle: Story = {
  args: {
    children: (
      <div className="rounded-lg border bg-card p-6">Content without a section title</div>
    ),
  },
}
