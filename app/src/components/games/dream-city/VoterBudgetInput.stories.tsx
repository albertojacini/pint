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
      { id: '1', text: 'More bike lanes in the center', dimension: 'ideas', popularity: 234 },
      { id: '2', text: 'Free public transport for students', dimension: 'ideas', popularity: 189 },
      { id: '3', text: 'Night metro on weekends', dimension: 'ideas', popularity: 156 },
      { id: '4', text: 'Car-free Sundays', dimension: 'ideas', popularity: 142 },
      { id: '5', text: 'Rooftop gardens on public buildings', dimension: 'ideas', popularity: 98 },
      { id: '6', text: 'Public parks', dimension: 'likes', popularity: 298 },
      { id: '7', text: 'Cultural events', dimension: 'likes', popularity: 187 },
      { id: '8', text: 'Navigli district', dimension: 'likes', popularity: 165 },
      { id: '9', text: 'Public libraries', dimension: 'likes', popularity: 143 },
      { id: '10', text: 'Traffic congestion', dimension: 'dislikes', popularity: 312 },
      { id: '11', text: 'Air pollution', dimension: 'dislikes', popularity: 276 },
      { id: '12', text: 'Lack of affordable housing', dimension: 'dislikes', popularity: 198 },
      { id: '13', text: 'Tourist overcrowding', dimension: 'dislikes', popularity: 145 },
    ],
    onBack: () => console.log('Back'),
    onComplete: (items) => console.log('Complete', items),
  },
}

export const Barcelona: Story = {
  args: {
    cityName: 'City of Barcelona',
    existingItems: [
      { id: '1', text: 'Expand superblocks program', dimension: 'ideas', popularity: 89 },
      { id: '2', text: 'More beach showers', dimension: 'ideas', popularity: 67 },
      { id: '3', text: 'La Rambla', dimension: 'likes', popularity: 156 },
      { id: '4', text: 'Beach access', dimension: 'likes', popularity: 134 },
      { id: '5', text: 'Tourist prices', dimension: 'dislikes', popularity: 198 },
      { id: '6', text: 'Pickpocketing', dimension: 'dislikes', popularity: 167 },
    ],
    onBack: () => console.log('Back'),
    onComplete: (items) => console.log('Complete', items),
  },
}
