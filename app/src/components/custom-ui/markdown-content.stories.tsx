import type { Meta, StoryObj } from '@storybook/react'
import { MarkdownContent } from './markdown-content'

const meta = {
  title: 'Foundations/Markdown Content',
  component: MarkdownContent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof MarkdownContent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    content: `# Housing Policy Overview

This provision establishes **rent control measures** for the metropolitan area.

## Key Points

- Maximum annual rent increase: *2%*
- Applies to residential properties only
- Exemptions for new construction (first 10 years)

## Implementation

The policy requires landlords to:

1. Register all rental properties
2. Submit annual pricing reports
3. Comply with tenant notification requirements

> This regulation aims to ensure affordable housing across all districts.

For more details, see the [full regulation text](https://example.com).`,
  },
}

export const ShortContent: Story = {
  args: {
    content: 'A brief policy note with **bold** and *italic* text.',
  },
}

export const WithLists: Story = {
  args: {
    content: `### Affected entities

- Barcelona (city)
- Catalonia (region)
- Spain (country)

### Timeline

1. Proposal submitted — Jan 2024
2. Public review — Feb 2024
3. Final vote — Mar 2024`,
  },
}
