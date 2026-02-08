import type { Meta, StoryObj } from '@storybook/react'
import { EventCardSmall, EventCardMedium } from './event-cards'

const meta: Meta = {
  title: 'Events/EventCards',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta

const sampleEvent = {
  id: '1',
  title: 'National General Election 2025',
  descriptionShort: 'Voters head to the polls to elect representatives for the national parliament.',
  type: 'election',
  date: '2025-06-15',
}

export const Small: StoryObj = {
  render: () => <EventCardSmall event={sampleEvent} className="max-w-sm" />,
}

export const Medium: StoryObj = {
  render: () => <EventCardMedium event={sampleEvent} className="max-w-md" />,
}
