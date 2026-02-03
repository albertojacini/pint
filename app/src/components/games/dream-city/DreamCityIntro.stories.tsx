import type { Meta, StoryObj } from '@storybook/react'
import { DreamCityIntro } from './DreamCityIntro'

const meta = {
  title: 'Games/DreamCity/Intro',
  component: DreamCityIntro,
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
} satisfies Meta<typeof DreamCityIntro>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    cityName: 'Comune di Milano',
  },
}

export const WithCustomStats: Story = {
  args: {
    cityName: 'Comune di Milano',
    stats: {
      participants: 2341,
      totalInvested: 234100,
      topIdeas: [
        'Car-free Sundays in the city center',
        'More green spaces in Navigli',
        'Night buses every 15 minutes',
        'Free Wi-Fi in all public squares',
      ],
    },
  },
}

export const NewCity: Story = {
  args: {
    cityName: 'City of Barcelona',
    stats: {
      participants: 12,
      totalInvested: 1200,
      topIdeas: [
        'Expand the superblocks program',
        'More beach cleaning',
      ],
    },
  },
}

export const WithStartHandler: Story = {
  args: {
    cityName: 'Comune di Milano',
    onStart: (dimension) => {
      alert(`Starting with: ${dimension}`)
    },
  },
}
