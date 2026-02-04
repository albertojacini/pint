import type { Meta, StoryObj } from '@storybook/react'
import { PoliticalLandscape } from './political-landscape'

const meta = {
  title: 'Entities/PoliticalLandscape',
  component: PoliticalLandscape,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof PoliticalLandscape>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: {
      councilComposition: [
        { party: 'PD', seats: 18 },
        { party: 'Lega', seats: 8 },
        { party: 'FdI', seats: 6 },
        { party: 'FI', seats: 4 },
        { party: 'M5S', seats: 4 },
      ],
      executiveMembers: [
        { name: 'Giuseppe Sala', role: 'mayor', party: 'PD' },
        { name: 'Anna Scavuzzo', role: 'vice-mayor', party: 'PD' },
        { name: 'Pierfrancesco Maran', role: 'assessor', party: 'PD' },
        { name: 'Marco Granelli', role: 'assessor', party: 'PD' },
      ],
      nextElection: { date: '2026-06-15' },
      electionHistory: [
        {
          date: '2021-10-04',
          turnout: 47.69,
          results: [
            { candidate: 'Giuseppe Sala', coalition: 'Centrosinistra', percentage: 57.73, color: 'hsl(var(--tag-pink))' },
            { candidate: 'Luca Bernardo', coalition: 'Centrodestra', percentage: 31.91, color: 'hsl(var(--tag-blue))' },
          ],
        },
        {
          date: '2016-06-19',
          turnout: 54.65,
          results: [
            { candidate: 'Giuseppe Sala', coalition: 'Centrosinistra', percentage: 51.7, color: 'hsl(var(--tag-pink))' },
            { candidate: 'Stefano Parisi', coalition: 'Centrodestra', percentage: 48.3, color: 'hsl(var(--tag-blue))' },
          ],
        },
      ],
    },
    entitySlug: 'milan',
  },
}

export const CouncilOnly: Story = {
  args: {
    data: {
      councilComposition: [
        { party: 'PD', seats: 15 },
        { party: 'FdI', seats: 10 },
        { party: 'Lega', seats: 5 },
      ],
    },
    entitySlug: 'rome',
  },
}

export const ExecutiveOnly: Story = {
  args: {
    data: {
      executiveMembers: [
        { name: 'Mario Rossi', role: 'mayor', icon: '👨‍💼' },
        { name: 'Laura Bianchi', role: 'vice-mayor' },
        { name: 'Paolo Verdi', role: 'assessor', roleTitle: 'Urban Planning' },
      ],
    },
    entitySlug: 'turin',
  },
}

export const ElectionsOnly: Story = {
  args: {
    data: {
      nextElection: { date: '2027-05-20' },
      electionHistory: [
        {
          date: '2022-05-20',
          turnout: 52.3,
          results: [
            { candidate: 'Maria Rossi', coalition: 'Centro', percentage: 45.2, color: 'hsl(var(--tag-green))' },
            { candidate: 'Giovanni Bianchi', coalition: 'Destra', percentage: 38.1, color: 'hsl(var(--tag-blue))' },
            { candidate: 'Franco Neri', coalition: 'Sinistra', percentage: 12.4, color: 'hsl(var(--tag-pink))' },
          ],
        },
      ],
    },
    entitySlug: 'florence',
  },
}

export const NoData: Story = {
  args: {
    data: null,
    entitySlug: 'small-town',
  },
}
