import type { Meta, StoryObj } from '@storybook/react'
import { ProvisionsSummary } from './provisions-summary'

const meta = {
  title: 'Provisions/ProvisionsSummary',
  component: ProvisionsSummary,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ProvisionsSummary>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    entitySlug: 'milan',
  },
}
