import { getEventsByEntity } from '@/lib/actions/events'
import { EventHeatmap, type HeatmapDayData } from './event-heatmap'
import { EventHeatmapFiltered } from './event-heatmap-filtered'

// --- EventHeatmapLoader ---

interface EventHeatmapLoaderProps {
  entityId: string
  startDate?: string
  endDate?: string
  showFilters?: boolean
}

function groupByDate(events: { date: string }[]): HeatmapDayData[] {
  const byDate = new Map<string, { date: Date; value: number }>()
  events.forEach((event) => {
    const existing = byDate.get(event.date)
    if (existing) {
      existing.value += 1
    } else {
      byDate.set(event.date, { date: new Date(event.date), value: 1 })
    }
  })
  return Array.from(byDate.values())
}

export async function EventHeatmapLoader({ entityId, startDate, endDate, showFilters = true }: EventHeatmapLoaderProps) {
  const events = await getEventsByEntity(entityId, { startDate, endDate })

  if (showFilters) {
    return <EventHeatmapFiltered events={events} />
  }

  return <EventHeatmap data={groupByDate(events)} />
}
