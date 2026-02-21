import type { Meta, StoryObj } from '@storybook/react'
import { Breadcrumbs } from './breadcrumbs'

const meta = {
  title: 'Custom-UI/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Breadcrumbs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    items: [
      { label: 'Entities', href: '/entities' },
      { label: 'Milan' },
    ],
  },
}

export const ThreeLevels: Story = {
  args: {
    items: [
      { label: 'Entities', href: '/entities' },
      { label: 'Milan', href: '/entities/milan' },
      { label: 'Provisions' },
    ],
  },
}

export const FourLevels: Story = {
  args: {
    items: [
      { label: 'Entities', href: '/entities' },
      { label: 'Italy', href: '/entities/italy' },
      { label: 'Lombardia', href: '/entities/lombardia' },
      { label: 'Milan' },
    ],
  },
}

export const SingleItem: Story = {
  args: {
    items: [
      { label: 'Dashboard' },
    ],
  },
}

export const LongLabels: Story = {
  args: {
    items: [
      { label: 'Political Entities', href: '/entities' },
      { label: 'San Giovanni in Persiceto', href: '/entities/san-giovanni-in-persiceto' },
      { label: 'Administrative Provisions' },
    ],
  },
}
