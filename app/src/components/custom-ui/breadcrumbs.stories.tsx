import type { Meta, StoryObj } from '@storybook/react'
import { Breadcrumbs } from './breadcrumbs'

const meta = {
  title: 'Foundations/Breadcrumbs',
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
      { label: 'Entities', href: '/pe' },
      { label: 'Milan' },
    ],
  },
}

export const ThreeLevels: Story = {
  args: {
    items: [
      { label: 'Entities', href: '/pe' },
      { label: 'Milan', href: '/pe/milan' },
      { label: 'Provisions' },
    ],
  },
}

export const FourLevels: Story = {
  args: {
    items: [
      { label: 'Entities', href: '/pe' },
      { label: 'Italy', href: '/pe/italy' },
      { label: 'Lombardia', href: '/pe/lombardia' },
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
      { label: 'Political Entities', href: '/pe' },
      { label: 'San Giovanni in Persiceto', href: '/pe/san-giovanni-in-persiceto' },
      { label: 'Administrative Provisions' },
    ],
  },
}
