import { getEventsByEntity } from '@/lib/actions/events'
import { EventHeatmap, type HeatmapDayData } from './event-heatmap'
import { EventHeatmapFiltered } from './event-heatmap-filtered'

interface EventHeatmapLoaderProps {
  entityId: string
  showFilters?: boolean
}

export async function EventHeatmapLoader({ entityId, showFilters = true }: EventHeatmapLoaderProps) {
  const events = await getEventsByEntity(entityId)

  if (showFilters) {
    return <EventHeatmapFiltered events={events} />
  }

  const byDate = new Map<string, { date: Date; value: number }>()
  events.forEach((event) => {
    const existing = byDate.get(event.date)
    if (existing) {
      existing.value += 1
    } else {
      byDate.set(event.date, { date: new Date(event.date), value: 1 })
    }
  })
  const data: HeatmapDayData[] = Array.from(byDate.values())

  return <EventHeatmap data={data} />
}
