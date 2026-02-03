import type { Meta, StoryObj } from '@storybook/react'
import { VoterBudgetIntro } from './VoterBudgetIntro'

const meta = {
  title: 'Games/VoterBudget/1-Intro',
  component: VoterBudgetIntro,
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
} satisfies Meta<typeof VoterBudgetIntro>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    cityName: 'Comune di Milano',
    onBack: () => console.log('Back'),
    onStart: () => console.log('Start'),
  },
}

export const HighEngagement: Story = {
  args: {
    cityName: 'Comune di Milano',
    stats: {
      participants: 12847,
      totalInvested: 1284700,
      topItems: [
        { text: 'Car-free Sundays in the center', dimension: 'ideas', totalAmount: 45200 },
        { text: 'Public libraries', dimension: 'likes', totalAmount: 38100 },
        { text: 'Air pollution levels', dimension: 'dislikes', totalAmount: 35800 },
        { text: 'More green spaces', dimension: 'ideas', totalAmount: 29400 },
      ],
    },
    onBack: () => console.log('Back'),
    onStart: () => console.log('Start'),
  },
}

export const NewCity: Story = {
  args: {
    cityName: 'City of Barcelona',
    stats: {
      participants: 23,
      totalInvested: 2300,
      topItems: [
        { text: 'Expand superblocks', dimension: 'ideas', totalAmount: 520 },
        { text: 'Beach access', dimension: 'likes', totalAmount: 380 },
      ],
    },
    onBack: () => console.log('Back'),
    onStart: () => console.log('Start'),
  },
}
