import type { Meta, StoryObj } from '@storybook/react'
import { Box } from './box'

const meta = {
  title: 'Custom-UI/Box',
  component: Box,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Box>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Default box with standard card-like styling',
  },
}

export const Muted: Story = {
  args: {
    variant: 'muted',
    children: 'Muted box for widgets and panels',
  },
}

export const Highlighted: Story = {
  args: {
    variant: 'highlighted',
    children: 'Highlighted box for important items like elections or ideas',
  },
}

export const AllVariants: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <Box variant="default">Default variant - standard card-like box</Box>
      <Box variant="muted">Muted variant - grey background for widgets/panels</Box>
      <Box variant="highlighted">Highlighted variant - dashed amber border for important items</Box>
    </div>
  ),
}

export const PaddingSizes: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <Box padding="none">
        <span className="bg-blue-100 dark:bg-blue-900">No padding (none)</span>
      </Box>
      <Box padding="sm">
        <span className="bg-blue-100 dark:bg-blue-900">Small padding (sm - p-2)</span>
      </Box>
      <Box padding="md">
        <span className="bg-blue-100 dark:bg-blue-900">Medium padding (md - p-3, default)</span>
      </Box>
      <Box padding="lg">
        <span className="bg-blue-100 dark:bg-blue-900">Large padding (lg - p-4)</span>
      </Box>
    </div>
  ),
}
