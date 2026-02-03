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
  { text: 'More bike lanes', dimension: 'ideas' as const, notes: 'Would make commuting safer', amount: 25 },
  { text: 'Night metro service', dimension: 'ideas' as const, notes: '', amount: 15 },
  { text: 'Public parks', dimension: 'likes' as const, notes: 'Great for families', amount: 20 },
  { text: 'Cultural events', dimension: 'likes' as const, notes: '', amount: 10 },
  { text: 'Traffic congestion', dimension: 'dislikes' as const, notes: 'Waste of time every day', amount: 20 },
  { text: 'Air pollution', dimension: 'dislikes' as const, notes: '', amount: 10 },
]

const sampleCommunityItems = [
  { id: '1', text: 'More bike lanes', dimension: 'ideas' as const, totalAmount: 42500, voterCount: 523 },
  { id: '2', text: 'Free public transport for students', dimension: 'ideas' as const, totalAmount: 38900, voterCount: 412 },
  { id: '3', text: 'Traffic congestion', dimension: 'dislikes' as const, totalAmount: 35200, voterCount: 489 },
  { id: '4', text: 'Public parks', dimension: 'likes' as const, totalAmount: 32100, voterCount: 398 },
  { id: '5', text: 'Night metro service', dimension: 'ideas' as const, totalAmount: 28700, voterCount: 321 },
  { id: '6', text: 'Air pollution', dimension: 'dislikes' as const, totalAmount: 27600, voterCount: 367 },
  { id: '7', text: 'Cultural events', dimension: 'likes' as const, totalAmount: 24300, voterCount: 287 },
  { id: '8', text: 'Lack of affordable housing', dimension: 'dislikes' as const, totalAmount: 22100, voterCount: 298 },
  { id: '9', text: 'Public libraries', dimension: 'likes' as const, totalAmount: 18900, voterCount: 234 },
  { id: '10', text: 'Car-free Sundays', dimension: 'ideas' as const, totalAmount: 17200, voterCount: 189 },
  { id: '11', text: 'Street food markets', dimension: 'likes' as const, totalAmount: 15600, voterCount: 178 },
  { id: '12', text: 'Tourist overcrowding', dimension: 'dislikes' as const, totalAmount: 14200, voterCount: 156 },
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
      { text: 'Expand superblocks', dimension: 'ideas' as const, notes: 'Great for pedestrians', amount: 40 },
      { text: 'Beach access', dimension: 'likes' as const, notes: '', amount: 30 },
      { text: 'Tourist prices', dimension: 'dislikes' as const, notes: 'Everything is overpriced', amount: 30 },
    ],
    communityItems: [
      { id: '1', text: 'Expand superblocks', dimension: 'ideas' as const, totalAmount: 5200, voterCount: 52 },
      { id: '2', text: 'Beach access', dimension: 'likes' as const, totalAmount: 3800, voterCount: 41 },
      { id: '3', text: 'Tourist prices', dimension: 'dislikes' as const, totalAmount: 3500, voterCount: 38 },
    ],
    totalParticipants: 67,
    onBack: () => console.log('Back'),
    onShare: () => console.log('Share'),
    onPlayAgain: () => console.log('Play again'),
  },
}
