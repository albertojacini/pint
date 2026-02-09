import type { Meta, StoryObj } from '@storybook/react'
import { ProvisionsSection } from './provisions-section'

const meta: Meta = {
  title: 'Entities/ProvisionsSection/Experiments',
  parameters: {
    layout: 'padded',
  },
}

export default meta

const mockEntity = { id: 'ent_milan_123', slug: 'milan' }

export const Playground: StoryObj = {
  render: () => <ProvisionsSection entity={mockEntity} />,
}
