import type { Meta, StoryObj } from '@storybook/react'
import { EssentialStats } from './essential-stats'

const meta = {
  title: 'Entities/EssentialStats',
  component: EssentialStats,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof EssentialStats>

export default meta
type Story = StoryObj<typeof meta>

const sampleData = {
  population: 1_352_000,
  stats: {
    area: 182,
    density: 7428,
    gdpPerCapita: 45000,
    unemploymentRate: 5.2,
    povertyRate: 8.5,
  },
}

export const Default: Story = {
  args: {
    ...sampleData,
  },
}

export const PopulationOnly: Story = {
  args: {
    population: 500_000,
    stats: null,
  },
}

export const LargeCity: Story = {
  args: {
    population: 8_400_000,
    stats: {
      area: 783,
      density: 10715,
      gdpPerCapita: 72000,
      unemploymentRate: 4.1,
      povertyRate: 12.3,
    },
  },
}

export const SmallTown: Story = {
  args: {
    population: 15_000,
    stats: {
      area: 25,
      density: 600,
      gdpPerCapita: 28000,
      unemploymentRate: 6.8,
      povertyRate: 5.2,
    },
  },
}

export const PartialStats: Story = {
  args: {
    population: 250_000,
    stats: {
      area: 120,
      gdpPerCapita: 35000,
    },
  },
}

export const NoData: Story = {
  args: {
    population: null,
    stats: null,
  },
}
