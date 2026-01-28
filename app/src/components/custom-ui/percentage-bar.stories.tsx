import type { Meta, StoryObj } from '@storybook/react'
import { PercentageBar } from './percentage-bar'

const meta = {
  title: 'Foundations/Percentage Bar',
  component: PercentageBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof PercentageBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    items: [
      { label: 'Support', value: 62, color: 'hsl(var(--positive))' },
      { label: 'Oppose', value: 28, color: 'hsl(var(--negative))' },
      { label: 'Neutral', value: 10, color: 'hsl(var(--neutral))' },
    ],
  },
}

export const TwoSegments: Story = {
  args: {
    items: [
      { label: 'Yes', value: 73, color: 'hsl(var(--positive))' },
      { label: 'No', value: 27, color: 'hsl(var(--negative))' },
    ],
  },
}

export const WithCounts: Story = {
  args: {
    items: [
      { label: 'Ownership', value: 12, color: 'hsl(var(--tag-purple))' },
      { label: 'Regulation', value: 8, color: 'hsl(var(--tag-orange))' },
      { label: 'Contract', value: 5, color: 'hsl(var(--tag-blue))' },
      { label: 'Taxation', value: 3, color: 'hsl(var(--tag-green))' },
    ],
    valueType: 'count',
  },
}

export const TallWithLabels: Story = {
  args: {
    items: [
      { label: 'Support', value: 55, color: 'hsl(var(--positive))' },
      { label: 'Oppose', value: 30, color: 'hsl(var(--negative))' },
      { label: 'Neutral', value: 15, color: 'hsl(var(--neutral))' },
    ],
    barHeight: 'h-8',
    showInBarLabels: true,
    valueType: 'count',
  },
}

export const NoLegend: Story = {
  args: {
    items: [
      { label: 'A', value: 40, color: 'hsl(var(--tag-blue))' },
      { label: 'B', value: 60, color: 'hsl(var(--tag-orange))' },
    ],
    showLegend: false,
  },
}

export const NotRounded: Story = {
  args: {
    items: [
      { label: 'Yes', value: 80, color: 'hsl(var(--positive))' },
      { label: 'No', value: 20, color: 'hsl(var(--negative))' },
    ],
    rounded: false,
  },
}
