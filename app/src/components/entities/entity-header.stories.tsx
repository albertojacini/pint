import type { Meta, StoryObj } from '@storybook/react'
import { EntityHeader } from './entity-header'

const meta = {
  title: 'Entities/EntityHeader',
  component: EntityHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof EntityHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    entity: {
      name: 'Milan',
      type: 'city',
      avatarUrl: null,
    },
  },
}

export const WithAvatar: Story = {
  args: {
    entity: {
      name: 'Rome',
      type: 'city',
      avatarUrl: 'https://placehold.co/48x48/3b82f6/ffffff?text=R',
    },
  },
}

export const LongName: Story = {
  args: {
    entity: {
      name: 'San Giovanni in Persiceto',
      type: 'municipality',
      avatarUrl: null,
    },
  },
}

export const Country: Story = {
  args: {
    entity: {
      name: 'Italy',
      type: 'country',
      avatarUrl: null,
    },
  },
}
