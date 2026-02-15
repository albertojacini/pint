import type { Meta, StoryObj } from '@storybook/react'
import { SectionL1, SectionL2, SectionL3 } from './section'

const meta = {
  title: 'Custom-UI/Section',
  component: SectionL1,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof SectionL1>

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

export const AllLevels: Story = {
  render: () => (
    <div className="max-w-2xl">
      <SectionL1 title="Politics">
        <SectionL2 title="Consiglio comunale">
          <SectionL3 title="Composizione">
            <div className="rounded-lg border bg-card p-4 text-sm">Council composition chart</div>
          </SectionL3>
          <SectionL3 title="Affluenza">
            <div className="rounded-lg border bg-card p-4 text-sm">Turnout data</div>
          </SectionL3>
        </SectionL2>
        <SectionL2 title="Giunta comunale">
          <div className="rounded-lg border bg-card p-4 text-sm">Executive members grid</div>
        </SectionL2>
      </SectionL1>
    </div>
  ),
}

export const SectionL2Story: Story = {
  name: 'SectionL2',
  render: () => (
    <SectionL2 title="Rental price limits">
      <div className="rounded-lg border bg-card p-6">Subsection content</div>
    </SectionL2>
  ),
}

export const SectionL3Story: Story = {
  name: 'SectionL3',
  render: () => (
    <SectionL3 title="Maximum monthly rent">
      <div className="rounded-lg border bg-card p-4 text-sm">Detail content</div>
    </SectionL3>
  ),
}
