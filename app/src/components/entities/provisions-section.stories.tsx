import type { Meta, StoryObj } from '@storybook/react'
import { ProvisionsSection } from './provisions-section'

const meta = {
  title: 'Entities/ProvisionsSection',
  component: ProvisionsSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ProvisionsSection>

export default meta
type Story = StoryObj<typeof meta>

const mockEntity = { id: 'ent_milan_123', slug: 'milan' }

export const Default: Story = {
  args: {
    entity: mockEntity,
  },
}

export const Empty: Story = {
  args: {
    entity: mockEntity,
  },
}
