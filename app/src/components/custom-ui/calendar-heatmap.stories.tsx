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

// Generate sample data for the last year
function generateSampleData(): CalendarHeatmapDataPoint[] {
  const data: CalendarHeatmapDataPoint[] = []
  const now = new Date()
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

  for (let d = new Date(oneYearAgo); d <= now; d.setDate(d.getDate() + 1)) {
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
      { date: new Date(2025, 3, 15), value: 5 },
      { date: new Date(2025, 6, 20), value: 3 },
      { date: new Date(2025, 9, 10), value: 8 },
      { date: new Date(2025, 11, 5), value: 2 },
      { date: new Date(2026, 1, 1), value: 10 },
    ],
  },
}
