import type { Meta, StoryObj } from '@storybook/react'
import { Tag, Tags } from './tags'

const meta = {
  title: 'Foundations/Tags',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta
type Story = StoryObj

const sampleTags = [
  { id: '1', name: 'Housing' },
  { id: '2', name: 'Transport' },
  { id: '3', name: 'Education' },
  { id: '4', name: 'Healthcare' },
  { id: '5', name: 'Environment' },
]

export const SingleTag: Story = {
  render: () => <Tag name="Housing" />,
}

export const MultipleTags: Story = {
  render: () => <Tags tags={sampleTags.slice(0, 3)} />,
}

export const WithOverflow: Story = {
  render: () => <Tags tags={sampleTags} maxTags={3} />,
}

export const CustomMaxTags: Story = {
  render: () => <Tags tags={sampleTags} maxTags={2} />,
}

export const SingleItem: Story = {
  render: () => <Tags tags={sampleTags.slice(0, 1)} />,
}

export const Empty: Story = {
  render: () => <Tags tags={[]} />,
}
