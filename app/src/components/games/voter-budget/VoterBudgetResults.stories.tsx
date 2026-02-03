import type { Meta, StoryObj } from '@storybook/react'
import { VoterBudgetResults } from './VoterBudgetResults'

const meta = {
  title: 'Games/VoterBudget/3-Results',
  component: VoterBudgetResults,
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
} satisfies Meta<typeof VoterBudgetResults>

export default meta
type Story = StoryObj<typeof meta>

const sampleUserItems = [
  { text: 'More bike lanes', notes: 'Would make commuting safer', amount: 25 },
  { text: 'Night metro service', notes: '', amount: 15 },
  { text: 'More public parks', notes: 'Great for families', amount: 20 },
  { text: 'Better cultural events', notes: '', amount: 10 },
  { text: 'Reduce traffic congestion', notes: 'Waste of time every day', amount: 20 },
  { text: 'Improve air quality', notes: '', amount: 10 },
]

const sampleCommunityItems = [
  { id: '1', text: 'More bike lanes', totalAmount: 42500, voterCount: 523 },
  { id: '2', text: 'Free public transport for students', totalAmount: 38900, voterCount: 412 },
  { id: '3', text: 'Reduce traffic congestion', totalAmount: 35200, voterCount: 489 },
  { id: '4', text: 'More public parks', totalAmount: 32100, voterCount: 398 },
  { id: '5', text: 'Night metro service', totalAmount: 28700, voterCount: 321 },
  { id: '6', text: 'Improve air quality', totalAmount: 27600, voterCount: 367 },
  { id: '7', text: 'Better cultural events', totalAmount: 24300, voterCount: 287 },
  { id: '8', text: 'More affordable housing', totalAmount: 22100, voterCount: 298 },
  { id: '9', text: 'Expand public libraries', totalAmount: 18900, voterCount: 234 },
  { id: '10', text: 'Car-free Sundays', totalAmount: 17200, voterCount: 189 },
  { id: '11', text: 'More street food markets', totalAmount: 15600, voterCount: 178 },
  { id: '12', text: 'Better tourist management', totalAmount: 14200, voterCount: 156 },
]

export const Default: Story = {
  args: {
    cityName: 'Comune di Milano',
    userItems: sampleUserItems,
    communityItems: sampleCommunityItems,
    totalParticipants: 847,
    onBack: () => console.log('Back'),
    onShare: () => console.log('Share'),
    onPlayAgain: () => console.log('Play again'),
  },
}

export const HighEngagement: Story = {
  args: {
    cityName: 'Comune di Milano',
    userItems: sampleUserItems,
    communityItems: sampleCommunityItems.map(item => ({
      ...item,
      totalAmount: item.totalAmount * 10,
      voterCount: item.voterCount * 10,
    })),
    totalParticipants: 12847,
    onBack: () => console.log('Back'),
    onShare: () => console.log('Share'),
    onPlayAgain: () => console.log('Play again'),
  },
}

export const FewItems: Story = {
  args: {
    cityName: 'City of Barcelona',
    userItems: [
      { text: 'Expand superblocks', notes: 'Great for pedestrians', amount: 40 },
      { text: 'Better beach access', notes: '', amount: 30 },
      { text: 'Reduce tourist prices', notes: 'Everything is overpriced', amount: 30 },
    ],
    communityItems: [
      { id: '1', text: 'Expand superblocks', totalAmount: 5200, voterCount: 52 },
      { id: '2', text: 'Better beach access', totalAmount: 3800, voterCount: 41 },
      { id: '3', text: 'Reduce tourist prices', totalAmount: 3500, voterCount: 38 },
    ],
    totalParticipants: 67,
    onBack: () => console.log('Back'),
    onShare: () => console.log('Share'),
    onPlayAgain: () => console.log('Play again'),
  },
}
