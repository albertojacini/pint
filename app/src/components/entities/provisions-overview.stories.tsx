import type { Meta, StoryObj } from '@storybook/react'
import { ProvisionsOverview } from './provisions-overview'

const meta = {
  title: 'Entities/ProvisionsOverview',
  component: ProvisionsOverview,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ProvisionsOverview>

export default meta
type Story = StoryObj<typeof meta>

const mockEntity = { id: 'ent_milan_123', slug: 'milan' }

export const Default: Story = {
  args: {
    entity: mockEntity,
    aggregates: {
      total: 156,
      byType: {
        taxation: { count: 32 },
        ownership: { count: 18 },
        contract: { count: 45 },
        regulation: { count: 28 },
        allocation: { count: 15 },
        designation: { count: 12 },
        infrastructure: { count: 6 },
      },
      tags: [
        { id: 'tag_1', name: 'Environment', slug: 'environment', category: 'topic', count: 34 },
        { id: 'tag_2', name: 'Transport', slug: 'transport', category: 'topic', count: 28 },
        { id: 'tag_3', name: 'Housing', slug: 'housing', category: 'topic', count: 22 },
        { id: 'tag_4', name: 'Education', slug: 'education', category: 'topic', count: 18 },
        { id: 'tag_5', name: 'Healthcare', slug: 'healthcare', category: 'topic', count: 15 },
        { id: 'tag_6', name: 'Tourism', slug: 'tourism', category: 'topic', count: 12 },
        { id: 'tag_7', name: 'Culture', slug: 'culture', category: 'topic', count: 10 },
        { id: 'tag_8', name: 'Sports', slug: 'sports', category: 'topic', count: 8 },
      ],
    },
    changes: [
      {
        id: 'ch_1',
        description: 'Updated parking fees',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        targetTitle: 'Parking Fee Regulation',
        targetProvisionTypes: ['regulation'],
      },
      {
        id: 'ch_2',
        description: 'New waste management contract',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        targetTitle: 'Waste Collection Services',
        targetProvisionTypes: ['contract'],
      },
      {
        id: 'ch_3',
        description: 'Property tax adjustment',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        targetTitle: 'IMU Tax Rate',
        targetProvisionTypes: ['taxation'],
      },
    ] as any,
  },
}

export const FewProvisions: Story = {
  args: {
    entity: mockEntity,
    aggregates: {
      total: 12,
      byType: {
        taxation: { count: 5 },
        regulation: { count: 4 },
        contract: { count: 3 },
        ownership: { count: 0 },
        allocation: { count: 0 },
        designation: { count: 0 },
        infrastructure: { count: 0 },
      },
      tags: [
        { id: 'tag_1', name: 'Local Services', slug: 'local-services', category: 'topic', count: 8 },
        { id: 'tag_2', name: 'Urban Planning', slug: 'urban-planning', category: 'topic', count: 4 },
      ],
    },
    changes: [],
  },
}

export const NoTags: Story = {
  args: {
    entity: mockEntity,
    aggregates: {
      total: 45,
      byType: {
        taxation: { count: 15 },
        regulation: { count: 20 },
        contract: { count: 10 },
        ownership: { count: 0 },
        allocation: { count: 0 },
        designation: { count: 0 },
        infrastructure: { count: 0 },
      },
      tags: [],
    },
    changes: [],
  },
}

export const WithActivity: Story = {
  args: {
    entity: mockEntity,
    aggregates: {
      total: 89,
      byType: {
        taxation: { count: 20 },
        ownership: { count: 12 },
        contract: { count: 25 },
        regulation: { count: 18 },
        allocation: { count: 8 },
        designation: { count: 4 },
        infrastructure: { count: 2 },
      },
      tags: [
        { id: 'tag_1', name: 'Mobility', slug: 'mobility', category: 'topic', count: 20 },
        { id: 'tag_2', name: 'Environment', slug: 'environment', category: 'topic', count: 15 },
      ],
    },
    changes: Array.from({ length: 25 }, (_, i) => ({
      id: `ch_${i}`,
      description: `Change ${i + 1}`,
      createdAt: new Date(Date.now() - i * 12 * 24 * 60 * 60 * 1000),
      targetTitle: `Provision ${i + 1}`,
      targetProvisionTypes: [['taxation', 'contract', 'regulation', 'ownership'][i % 4]],
    })) as any,
  },
}

export const Empty: Story = {
  args: {
    entity: mockEntity,
    aggregates: {
      total: 0,
      byType: {
        taxation: { count: 0 },
        ownership: { count: 0 },
        contract: { count: 0 },
        regulation: { count: 0 },
        allocation: { count: 0 },
        designation: { count: 0 },
        infrastructure: { count: 0 },
      },
      tags: [],
    },
    changes: [],
  },
}
