import type { Meta, StoryObj } from '@storybook/react'
import { EventsOverview } from './events-overview'

const meta = {
  title: 'Entities/EventsOverview',
  component: EventsOverview,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof EventsOverview>

export default meta
type Story = StoryObj<typeof meta>

const mockEntity = { id: 'ent_milan_123', slug: 'milan' }

export const Default: Story = {
  args: {
    entity: mockEntity,
    events: [
      {
        id: 'evt_1',
        title: 'New Urban Mobility Plan Approved',
        description: 'The city council approved the new 2024-2030 urban mobility plan focusing on sustainable transportation.',
        type: 'policy_change',
        createdAt: new Date('2024-01-15'),
        administrationId: 'adm_1',
        administrationName: 'Sala Administration 2021-2026',
      },
      {
        id: 'evt_2',
        title: 'Budget 2024 Presentation',
        description: 'The mayor presented the municipal budget for fiscal year 2024 with increased investments in green infrastructure.',
        type: 'announcement',
        createdAt: new Date('2024-01-10'),
        administrationId: 'adm_1',
        administrationName: 'Sala Administration 2021-2026',
      },
      {
        id: 'evt_3',
        title: 'New School Infrastructure Project',
        description: 'Construction begins on three new elementary schools in the metropolitan area.',
        type: 'project_start',
        createdAt: new Date('2024-01-05'),
        administrationId: null,
        administrationName: null,
      },
    ],
  },
}

export const ManyEvents: Story = {
  args: {
    entity: mockEntity,
    events: [
      {
        id: 'evt_1',
        title: 'City Council Meeting',
        description: 'Regular monthly session of the city council.',
        type: 'meeting',
        createdAt: new Date('2024-01-20'),
        administrationId: 'adm_1',
        administrationName: 'Current Administration',
      },
      {
        id: 'evt_2',
        title: 'New Park Opening',
        description: 'Grand opening of the Central Park extension.',
        type: 'event',
        createdAt: new Date('2024-01-18'),
        administrationId: null,
        administrationName: null,
      },
      {
        id: 'evt_3',
        title: 'Traffic Regulation Update',
        description: 'New traffic rules for the city center effective from February.',
        type: 'policy_change',
        createdAt: new Date('2024-01-15'),
        administrationId: 'adm_1',
        administrationName: 'Current Administration',
      },
      {
        id: 'evt_4',
        title: 'Public Consultation on Housing',
        description: 'Citizens invited to participate in housing policy consultation.',
        type: 'consultation',
        createdAt: new Date('2024-01-12'),
        administrationId: null,
        administrationName: null,
      },
      {
        id: 'evt_5',
        title: 'Sports Facility Renovation',
        description: 'Major renovation project for municipal sports facilities announced.',
        type: 'project_start',
        createdAt: new Date('2024-01-10'),
        administrationId: 'adm_1',
        administrationName: 'Current Administration',
      },
    ],
  },
}

export const SingleEvent: Story = {
  args: {
    entity: mockEntity,
    events: [
      {
        id: 'evt_1',
        title: 'Emergency Response Protocol Update',
        description: 'Updated guidelines for municipal emergency response procedures.',
        type: 'policy_change',
        createdAt: new Date('2024-01-01'),
        administrationId: null,
        administrationName: null,
      },
    ],
  },
}

export const NoDescription: Story = {
  args: {
    entity: mockEntity,
    events: [
      {
        id: 'evt_1',
        title: 'Council Resolution 2024/001',
        description: null,
        type: 'resolution',
        createdAt: new Date('2024-01-15'),
        administrationId: 'adm_1',
        administrationName: 'City Administration',
      },
      {
        id: 'evt_2',
        title: 'Ordinance 2024/012',
        description: null,
        type: 'ordinance',
        createdAt: new Date('2024-01-10'),
        administrationId: null,
        administrationName: null,
      },
    ],
  },
}

export const Empty: Story = {
  args: {
    entity: mockEntity,
    events: [],
  },
}
