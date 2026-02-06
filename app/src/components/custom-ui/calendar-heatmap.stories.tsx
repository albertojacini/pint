import type { Meta, StoryObj } from '@storybook/react'
import { CalendarHeatmap, CalendarHeatmapDataPoint } from './calendar-heatmap'

const meta: Meta<typeof CalendarHeatmap> = {
  title: 'Custom-UI/CalendarHeatmap',
  component: CalendarHeatmap,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof CalendarHeatmap>

// Generate sample data for the last 2 years
function generateSampleData(): CalendarHeatmapDataPoint[] {
  const data: CalendarHeatmapDataPoint[] = []
  const now = new Date()
  const twoYearsAgo = new Date(now.getFullYear() - 2, 0, 1)

  for (let d = new Date(twoYearsAgo); d <= now; d.setDate(d.getDate() + 1)) {
    // Random chance of having an event on this day
    if (Math.random() > 0.7) {
      data.push({
        date: new Date(d),
        value: Math.floor(Math.random() * 10) + 1,
      })
    }
  }

  return data
}

const sampleData = generateSampleData()

export const Default: Story = {
  args: {
    data: sampleData,
    onDateClick: (date, value) => {
      console.log('Clicked:', date.toISOString(), 'Value:', value)
    },
  },
}

export const Empty: Story = {
  args: {
    data: [],
  },
}

export const SparseData: Story = {
  args: {
    data: [
      { date: new Date(2025, 0, 15), value: 5 },
      { date: new Date(2025, 3, 20), value: 3 },
      { date: new Date(2025, 6, 10), value: 8 },
      { date: new Date(2025, 9, 5), value: 2 },
      { date: new Date(2026, 0, 1), value: 10 },
    ],
  },
}
