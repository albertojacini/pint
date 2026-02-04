import type { Meta, StoryObj } from '@storybook/react'
import { CouncilDots } from './council-dots'

const meta = {
  title: 'Entities/CouncilDots',
  component: CouncilDots,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof CouncilDots>

export default meta
type Story = StoryObj<typeof meta>

// Sample data - colors are assigned by the component from the palette
const milanCouncil = [
  { party: 'PD', seats: 18 },
  { party: 'Lega', seats: 8 },
  { party: 'FdI', seats: 6 },
  { party: 'FI', seats: 4 },
  { party: 'M5S', seats: 4 },
]

const largeCouncil = [
  { party: 'Partito A', seats: 25 },
  { party: 'Partito B', seats: 18 },
  { party: 'Partito C', seats: 12 },
  { party: 'Partito D', seats: 8 },
  { party: 'Partito E', seats: 5 },
  { party: 'Partito F', seats: 3 },
  { party: 'Altri', seats: 2 },
]

export const Default: Story = {
  args: {
    composition: milanCouncil,
  },
}

export const LargeCouncil: Story = {
  args: {
    composition: largeCouncil,
  },
}

export const Empty: Story = {
  args: {
    composition: [],
  },
}
