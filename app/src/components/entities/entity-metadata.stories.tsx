import type { Meta, StoryObj } from '@storybook/react'
import { EntityMetadata } from './entity-metadata'

const meta = {
  title: 'Entities/EntityMetadata',
  component: EntityMetadata,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof EntityMetadata>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    id: 'ent_milan_ab12cd34',
    createdAt: new Date('2023-06-15T10:30:00Z'),
    updatedAt: new Date('2024-01-20T14:45:00Z'),
  },
}

export const RecentlyCreated: Story = {
  args: {
    id: 'ent_rome_ef56gh78',
    createdAt: new Date('2024-01-18T09:00:00Z'),
    updatedAt: new Date('2024-01-18T09:00:00Z'),
  },
}

export const LongId: Story = {
  args: {
    id: 'ent_san_giovanni_in_persiceto_123456789abcdef',
    createdAt: new Date('2022-03-10T08:00:00Z'),
    updatedAt: new Date('2024-01-15T16:30:00Z'),
  },
}
