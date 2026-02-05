import type { Meta, StoryObj } from '@storybook/react'
import {
  ClassificationBadge,
  ProvisionClassificationBadge,
  EntityClassificationBadge,
} from './classification-badge'

const meta = {
  title: 'Custom-UI/Classification Badge',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta
type Story = StoryObj

const provisionTypes = [
  'ownership',
  'contract',
  'regulation',
  'taxation',
  'allocation',
  'designation',
  'infrastructure',
] as const

const entityTypes = [
  'neighborhood',
  'district',
  'borough',
  'city',
  'region',
  'country',
  'supranational',
] as const

export const AllProvisionTypes: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Provision types</h3>
      <div className="flex flex-wrap gap-4">
        {provisionTypes.map((type) => (
          <ProvisionClassificationBadge key={type} type={type} />
        ))}
      </div>
    </div>
  ),
}

export const AllEntityTypes: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Entity types</h3>
      <div className="flex flex-wrap gap-4">
        {entityTypes.map((type) => (
          <EntityClassificationBadge key={type} type={type} />
        ))}
      </div>
    </div>
  ),
}

export const CustomBadge: Story = {
  render: () => (
    <ClassificationBadge type="custom" color="hsl(var(--tag-orange))" />
  ),
}
