import type { Meta, StoryObj } from '@storybook/react'
import { Section } from './section'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

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
        <Card><CardContent className="pt-6">Provision A</CardContent></Card>
        <Card><CardContent className="pt-6">Provision B</CardContent></Card>
      </div>
    ),
  },
}

export const WithAction: Story = {
  args: {
    title: 'Recent changes',
    action: <Button variant="outline" size="sm">View all</Button>,
    children: (
      <div className="space-y-2">
        <Card><CardContent className="pt-6">Change proposal #1</CardContent></Card>
        <Card><CardContent className="pt-6">Change proposal #2</CardContent></Card>
      </div>
    ),
  },
}

export const NoTitle: Story = {
  args: {
    children: (
      <Card><CardContent className="pt-6">Content without a section title</CardContent></Card>
    ),
  },
}
