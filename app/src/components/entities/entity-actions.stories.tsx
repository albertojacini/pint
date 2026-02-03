import type { Meta, StoryObj } from '@storybook/react'
import { EntityActions } from './entity-actions'

const meta = {
  title: 'Entities/EntityActions',
  component: EntityActions,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof EntityActions>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    entity: {
      id: 'ent_milan_123',
      slug: 'milan',
    },
  },
}
