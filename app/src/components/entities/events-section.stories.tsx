import type { Meta, StoryObj } from '@storybook/react'
import { EventsHeatmap } from './events-heatmap'
import { EventsOverview } from './events-overview'

interface Event {
  id: string
  title: string
  description: string | null
  type: string
  date: string
}

interface EventsSectionProps {
  entity: { id: string; slug: string }
  events: Event[]
}

function EventsSection({ entity, events }: EventsSectionProps) {
  return (
    <div>
      <EventsHeatmap events={events} />
      <div className="mt-6">
        <EventsOverview entity={entity} events={events} />
      </div>
    </div>
  )
}

const meta = {
  title: 'Entities/EventsSection',
  component: EventsSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof EventsSection>

export default meta
type Story = StoryObj<typeof meta>

const mockEntity = { id: 'ent_milan_123', slug: 'milan' }

// Generate events spread across the last year for realistic heatmap
function generateYearOfEvents(): Event[] {
  const events: Event[] = []
  const types = ['policy_change', 'announcement', 'meeting', 'project_start', 'consultation', 'event']
  const now = new Date()

  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 365)
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)

    events.push({
      id: `evt_${i}`,
      title: `Event ${i + 1}`,
      description: Math.random() > 0.3 ? `Description for event ${i + 1}` : null,
      type: types[Math.floor(Math.random() * types.length)],
      date: date.toISOString().split('T')[0],
    })
  }

  return events.sort((a, b) => b.date.localeCompare(a.date))
}

export const Default: Story = {
  args: {
    entity: mockEntity,
    events: [
      {
        id: 'evt_1',
        title: 'New Urban Mobility Plan Approved',
        description: 'The city council approved the new 2024-2030 urban mobility plan focusing on sustainable transportation.',
        type: 'policy_change',
        date: '2024-01-15',
      },
      {
        id: 'evt_2',
        title: 'Budget 2024 Presentation',
        description: 'The mayor presented the municipal budget for fiscal year 2024 with increased investments in green infrastructure.',
        type: 'announcement',
        date: '2024-01-10',
      },
      {
        id: 'evt_3',
        title: 'New School Infrastructure Project',
        description: 'Construction begins on three new elementary schools in the metropolitan area.',
        type: 'project_start',
        date: '2024-01-05',
      },
    ],
  },
}

export const WithManyEvents: Story = {
  args: {
    entity: mockEntity,
    events: generateYearOfEvents(),
  },
}

export const MixedEventTypes: Story = {
  args: {
    entity: mockEntity,
    events: [
      { id: 'evt_1', title: 'City Council Meeting', description: 'Regular monthly session.', type: 'meeting', date: '2024-01-20' },
      { id: 'evt_2', title: 'New Park Opening', description: 'Grand opening of Central Park extension.', type: 'event', date: '2024-01-18' },
      { id: 'evt_3', title: 'Traffic Regulation Update', description: 'New traffic rules for city center.', type: 'policy_change', date: '2024-01-15' },
      { id: 'evt_4', title: 'Public Consultation on Housing', description: 'Citizens invited to participate.', type: 'consultation', date: '2024-01-12' },
      { id: 'evt_5', title: 'Sports Facility Renovation', description: 'Major renovation project announced.', type: 'project_start', date: '2024-01-10' },
    ],
  },
}

export const Empty: Story = {
  args: {
    entity: mockEntity,
    events: [],
  },
}
