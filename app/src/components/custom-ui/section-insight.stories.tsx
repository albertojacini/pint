import type { Meta, StoryObj } from '@storybook/react'
import { SectionInsight } from './section-insight'

const meta = {
  title: 'Custom-UI/SectionInsight',
  component: SectionInsight,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof SectionInsight>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    content: 'Milan has one of the most stable coalition governments in Italy, with the center-left holding power since 2011.',
  },
}

export const WithMarkdown: Story = {
  args: {
    content:
      'The **current administration** led by *Giuseppe Sala* has prioritized sustainable mobility and digital transformation. Key metrics: **+23%** cycling infrastructure, **-15%** car traffic in Area C since 2019.',
  },
}

export const Short: Story = {
  args: {
    content: 'Next municipal elections scheduled for **2026**.',
  },
}
