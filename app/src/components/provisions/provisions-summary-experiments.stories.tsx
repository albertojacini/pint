import type { Meta, StoryObj } from '@storybook/react'
import { ProvisionsSummary } from './provisions-summary'

const meta: Meta = {
  title: 'Provisions/ProvisionsSummary/Experiments',
  parameters: {
    layout: 'padded',
  },
}

export default meta

export const Playground: StoryObj = {
  render: () => <ProvisionsSummary entitySlug="milan" />,
}
