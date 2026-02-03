import type { Meta, StoryObj } from '@storybook/react'
import { PerformanceIndicators } from './performance-indicators'

const meta = {
  title: 'Entities/PerformanceIndicators',
  component: PerformanceIndicators,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof PerformanceIndicators>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: {
      innovation: {
        overall: 7.5,
        subcategories: [
          { name: 'Digital Services', score: 8.2 },
          { name: 'Smart Mobility', score: 7.1 },
          { name: 'Research & Development', score: 6.8 },
        ],
      },
      sustainability: {
        overall: 6.8,
        subcategories: [
          { name: 'Green Spaces', score: 7.5 },
          { name: 'Renewable Energy', score: 6.2 },
          { name: 'Waste Management', score: 6.5 },
        ],
      },
      impact: {
        overall: 8.2,
        subcategories: [
          { name: 'Economic Growth', score: 8.5 },
          { name: 'Quality of Life', score: 7.8 },
          { name: 'Social Inclusion', score: 8.0 },
        ],
      },
    },
  },
}

export const HighScores: Story = {
  args: {
    data: {
      innovation: {
        overall: 9.2,
        subcategories: [
          { name: 'Digital Services', score: 9.5 },
          { name: 'Smart Mobility', score: 9.0 },
          { name: 'Research & Development', score: 9.1 },
        ],
      },
      sustainability: {
        overall: 8.8,
        subcategories: [
          { name: 'Green Spaces', score: 9.2 },
          { name: 'Renewable Energy', score: 8.5 },
          { name: 'Waste Management', score: 8.7 },
        ],
      },
      impact: {
        overall: 9.5,
        subcategories: [
          { name: 'Economic Growth', score: 9.8 },
          { name: 'Quality of Life', score: 9.3 },
          { name: 'Social Inclusion', score: 9.4 },
        ],
      },
    },
  },
}

export const LowScores: Story = {
  args: {
    data: {
      innovation: {
        overall: 3.5,
        subcategories: [
          { name: 'Digital Services', score: 4.0 },
          { name: 'Smart Mobility', score: 3.2 },
          { name: 'Research & Development', score: 3.0 },
        ],
      },
      sustainability: {
        overall: 4.2,
        subcategories: [
          { name: 'Green Spaces', score: 4.5 },
          { name: 'Renewable Energy', score: 3.8 },
          { name: 'Waste Management', score: 4.0 },
        ],
      },
      impact: {
        overall: 5.0,
        subcategories: [
          { name: 'Economic Growth', score: 5.5 },
          { name: 'Quality of Life', score: 4.8 },
          { name: 'Social Inclusion', score: 4.5 },
        ],
      },
    },
  },
}

export const WithoutSubcategories: Story = {
  args: {
    data: {
      innovation: { overall: 7.0 },
      sustainability: { overall: 6.5 },
      impact: { overall: 7.8 },
    },
  },
}

export const PartialData: Story = {
  args: {
    data: {
      innovation: {
        overall: 6.5,
        subcategories: [
          { name: 'Digital Services', score: 7.0 },
          { name: 'Smart Mobility', score: 6.0 },
        ],
      },
      sustainability: {
        overall: 5.8,
      },
    },
  },
}

export const NoData: Story = {
  args: {
    data: null,
  },
}
