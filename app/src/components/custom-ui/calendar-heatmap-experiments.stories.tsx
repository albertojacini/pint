'use client'

import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CalendarHeatmap, CalendarHeatmapDataPoint } from './calendar-heatmap'

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
  const twoYearsAgo = new Date(now.getFullYear() - 2, 0, 1)

  for (let d = new Date(twoYearsAgo); d <= now; d.setDate(d.getDate() + 1)) {
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

// Wrapper component with filter controls
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

  const selectAll = () => setSelectedTypes(new Set(EVENT_TYPES))
  const selectNone = () => setSelectedTypes(new Set())

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

  // Color mapping for event types
  const typeColors: Record<EventType, string> = {
    Elections: 'bg-blue-500',
    Regulation: 'bg-green-500',
    Appointment: 'bg-purple-500',
    Budget: 'bg-yellow-500',
    Meeting: 'bg-orange-500',
    Announcement: 'bg-pink-500',
  }

  return (
    <div>
      {/* Filter controls */}
      <div className="mb-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Filter by Event Type</span>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Select all
            </button>
            <span className="text-muted-foreground">|</span>
            <button
              onClick={selectNone}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-all
                flex items-center gap-2
                ${
                  selectedTypes.has(type)
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }
              `}
            >
              <span className={`w-2 h-2 rounded-full ${typeColors[type]}`} />
              {type}
            </button>
          ))}
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Showing {filteredData.length} days with events ({selectedTypes.size} types selected)
        </div>
      </div>

      {/* Heatmap */}
      <CalendarHeatmap
        data={filteredData}
        onDateClick={(date, value) => {
          const eventsOnDate = sampleDataWithTypes.filter(
            (d) =>
              d.date.toISOString().split('T')[0] === date.toISOString().split('T')[0] &&
              selectedTypes.has(d.eventType)
          )
          const breakdown = EVENT_TYPES.filter((t) => selectedTypes.has(t))
            .map((type) => {
              const count = eventsOnDate.filter((e) => e.eventType === type).length
              return count > 0 ? `${type}: ${count}` : null
            })
            .filter(Boolean)
            .join('\n')

          alert(`Date: ${date.toLocaleDateString()}\nTotal events: ${value}\n\n${breakdown}`)
        }}
      />
    </div>
  )
}

// Base experiment with filters
export const Base: Story = {
  render: () => <CalendarHeatmapWithFilters />,
}
