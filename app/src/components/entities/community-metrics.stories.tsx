import type { Meta, StoryObj } from '@storybook/react'
import { CommunityMetrics } from './community-metrics'

const meta = {
  title: 'Entities/CommunityMetrics',
  component: CommunityMetrics,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof CommunityMetrics>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: {
      userSatisfaction: {
        overall: 7.2,
        responsesCount: 1245,
      },
      activeProjects: 23,
      communityEngagement: {
        totalUsers: 5420,
        activeContributors: 156,
      },
      surveys: [
        { title: 'Public Transport', score: 6.8, responses: 892 },
        { title: 'Healthcare', score: 7.5, responses: 756 },
        { title: 'Education', score: 8.1, responses: 645 },
        { title: 'Public Safety', score: 6.2, responses: 534 },
      ],
    },
  },
}

export const HighEngagement: Story = {
  args: {
    data: {
      userSatisfaction: {
        overall: 8.5,
        responsesCount: 5678,
      },
      activeProjects: 45,
      communityEngagement: {
        totalUsers: 25000,
        activeContributors: 890,
      },
      surveys: [
        { title: 'Public Transport', score: 8.2, responses: 2340 },
        { title: 'Healthcare', score: 8.8, responses: 1980 },
        { title: 'Education', score: 9.0, responses: 1650 },
        { title: 'Environment', score: 7.9, responses: 1420 },
      ],
    },
  },
}

export const LowEngagement: Story = {
  args: {
    data: {
      userSatisfaction: {
        overall: 5.2,
        responsesCount: 89,
      },
      activeProjects: 3,
      communityEngagement: {
        totalUsers: 245,
        activeContributors: 12,
      },
      surveys: [
        { title: 'Services', score: 4.5, responses: 34 },
        { title: 'Infrastructure', score: 5.8, responses: 28 },
      ],
    },
  },
}

export const SatisfactionOnly: Story = {
  args: {
    data: {
      userSatisfaction: {
        overall: 7.8,
        responsesCount: 1500,
      },
    },
  },
}

export const SurveysOnly: Story = {
  args: {
    data: {
      surveys: [
        { title: 'Mobility', score: 7.2, responses: 450 },
        { title: 'Housing', score: 6.5, responses: 380 },
        { title: 'Green Spaces', score: 8.0, responses: 290 },
      ],
    },
  },
}

export const NoData: Story = {
  args: {
    data: null,
  },
}
