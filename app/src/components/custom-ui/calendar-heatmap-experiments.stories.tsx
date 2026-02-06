'use client'

import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CalendarHeatmap, CalendarHeatmapDataPoint } from './calendar-heatmap'
import { FilterButton } from './buttons'

const meta: Meta<typeof CalendarHeatmap> = {
  title: 'Custom-UI/CalendarHeatmapExperiments',
  component: CalendarHeatmap,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof CalendarHeatmap>

// Event types for filtering
const EVENT_TYPES = ['Elections', 'Regulation', 'Appointment', 'Budget', 'Meeting', 'Announcement'] as const
type EventType = (typeof EVENT_TYPES)[number]

// Extended data point with event type
interface EventDataPoint extends CalendarHeatmapDataPoint {
  eventType: EventType
}

// Generate sample data with event types
function generateSampleDataWithTypes(): EventDataPoint[] {
  const data: EventDataPoint[] = []
  const now = new Date()
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

  for (let d = new Date(oneYearAgo); d <= now; d.setDate(d.getDate() + 1)) {
    if (Math.random() > 0.7) {
      const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)]
      data.push({
        date: new Date(d),
        value: Math.floor(Math.random() * 10) + 1,
        eventType,
      })
    }
  }

  return data
}

const sampleDataWithTypes = generateSampleDataWithTypes()

// Base experiment with filters
function CalendarHeatmapWithFilters() {
  const [selectedTypes, setSelectedTypes] = useState<Set<EventType>>(new Set(EVENT_TYPES))

  const toggleType = (type: EventType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  // Filter and aggregate data by date
  const filteredData = sampleDataWithTypes
    .filter((d) => selectedTypes.has(d.eventType))
    .reduce<CalendarHeatmapDataPoint[]>((acc, curr) => {
      const dateStr = curr.date.toISOString().split('T')[0]
      const existing = acc.find((d) => d.date.toISOString().split('T')[0] === dateStr)
      if (existing) {
        existing.value += curr.value
      } else {
        acc.push({ date: curr.date, value: curr.value })
      }
      return acc
    }, [])

  return (
    <div>
      {/* Filters using official FilterButton */}
      <div className="flex flex-wrap gap-1 mb-4">
        {EVENT_TYPES.map((type) => (
          <FilterButton
            key={type}
            selected={selectedTypes.has(type)}
            onSelectedChange={() => toggleType(type)}
          >
            {type}
          </FilterButton>
        ))}
      </div>

      {/* Heatmap */}
      <CalendarHeatmap
        data={filteredData}
        onDateClick={(date: Date, value: number) => {
          alert(`Date: ${date.toLocaleDateString()}\nEvents: ${value}`)
        }}
      />
    </div>
  )
}

export const Base: Story = {
  render: () => <CalendarHeatmapWithFilters />,
}
