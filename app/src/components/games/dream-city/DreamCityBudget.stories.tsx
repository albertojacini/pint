import type { Meta, StoryObj } from '@storybook/react'
import { DreamCityBudget } from './DreamCityBudget'

const meta = {
  title: 'Games/DreamCity/Budget',
  component: DreamCityBudget,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
    backgrounds: {
      default: 'light',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-[390px] mx-auto min-h-screen bg-slate-50">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DreamCityBudget>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    cityName: 'Comune di Milano',
    initialDimension: 'ideas',
  },
}

export const StartWithLikes: Story = {
  args: {
    cityName: 'Comune di Milano',
    initialDimension: 'likes',
  },
}

export const StartWithDislikes: Story = {
  args: {
    cityName: 'Comune di Milano',
    initialDimension: 'dislikes',
  },
}

export const WithCompleteHandler: Story = {
  args: {
    cityName: 'Comune di Milano',
    onComplete: (items) => {
      console.log('Completed with items:', items)
      alert(`Submitted ${items.length} items totaling €${items.reduce((s, i) => s + i.amount, 0)}`)
    },
  },
}
