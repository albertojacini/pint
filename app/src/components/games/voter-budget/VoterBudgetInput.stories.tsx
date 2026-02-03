import type { Meta, StoryObj } from '@storybook/react'
import { VoterBudgetInput } from './VoterBudgetInput'

const meta = {
  title: 'Games/VoterBudget/2-Input',
  component: VoterBudgetInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-[390px] mx-auto min-h-screen bg-slate-50">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof VoterBudgetInput>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    cityName: 'Comune di Milano',
    onBack: () => console.log('Back'),
    onComplete: (items) => console.log('Complete', items),
  },
}

export const WithExistingItems: Story = {
  args: {
    cityName: 'Comune di Milano',
    existingItems: [
      { id: '1', text: 'More bike lanes in the center', popularity: 234 },
      { id: '2', text: 'Free public transport for students', popularity: 189 },
      { id: '3', text: 'Night metro on weekends', popularity: 156 },
      { id: '4', text: 'Car-free Sundays', popularity: 142 },
      { id: '5', text: 'Reduce traffic congestion', popularity: 312 },
      { id: '6', text: 'Improve air quality', popularity: 276 },
      { id: '7', text: 'More affordable housing', popularity: 198 },
      { id: '8', text: 'More public parks', popularity: 298 },
    ],
    onBack: () => console.log('Back'),
    onComplete: (items) => console.log('Complete', items),
  },
}

export const Barcelona: Story = {
  args: {
    cityName: 'City of Barcelona',
    existingItems: [
      { id: '1', text: 'Expand superblocks program', popularity: 89 },
      { id: '2', text: 'More beach showers', popularity: 67 },
      { id: '3', text: 'Better tourist management', popularity: 198 },
      { id: '4', text: 'Reduce pickpocketing', popularity: 167 },
      { id: '5', text: 'More affordable housing', popularity: 156 },
      { id: '6', text: 'Improve beach access', popularity: 134 },
    ],
    onBack: () => console.log('Back'),
    onComplete: (items) => console.log('Complete', items),
  },
}
