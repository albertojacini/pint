import type { Meta, StoryObj } from '@storybook/react'
import { ExecutiveMembers, type ExecutiveMember } from './executive-members'

const meta = {
  title: 'Entities/Administration/ExecutiveMembers',
  component: ExecutiveMembers,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ExecutiveMembers>

export default meta
type Story = StoryObj<typeof meta>

const milanExecutive: ExecutiveMember[] = [
  { name: 'Giuseppe Sala', role: 'mayor', icon: 'crown', party: 'PD' },
  { name: 'Anna Scavuzzo', role: 'councilor', icon: 'graduation-cap', roleTitle: 'Istruzione', party: 'PD' },
  { name: 'Pierfrancesco Maran', role: 'councilor', roleTitle: 'Urbanistica', party: 'PD' },
  { name: 'Marco Granelli', role: 'councilor', roleTitle: 'Sicurezza', party: 'PD' },
]

const largeExecutive: ExecutiveMember[] = [
  { name: 'Giuseppe Sala', role: 'mayor', icon: 'crown', party: 'PD' },
  { name: 'Anna Scavuzzo', role: 'councilor', party: 'PD' },
  { name: 'Pierfrancesco Maran', role: 'councilor', roleTitle: 'Urbanistica', party: 'PD' },
  { name: 'Marco Granelli', role: 'councilor', roleTitle: 'Sicurezza', party: 'PD' },
  { name: 'Arianna Censi', role: 'councilor', roleTitle: 'Mobilità', party: 'PD' },
  { name: 'Lamberto Bertolé', role: 'councilor', roleTitle: 'Welfare', party: 'PD' },
  { name: 'Gaia Romani', role: 'councilor', roleTitle: 'Casa', party: 'PD' },
  { name: 'Emmanuel Conte', role: 'councilor', roleTitle: 'Bilancio', party: 'PD' },
]

const veryLargeExecutive: ExecutiveMember[] = [
  { name: 'Giuseppe Sala', role: 'mayor', icon: 'crown', party: 'PD' },
  { name: 'Anna Scavuzzo', role: 'councilor', roleTitle: 'Istruzione', party: 'PD' },
  { name: 'Pierfrancesco Maran', role: 'councilor', roleTitle: 'Urbanistica', party: 'PD' },
  { name: 'Marco Granelli', role: 'councilor', roleTitle: 'Sicurezza', party: 'PD' },
  { name: 'Arianna Censi', role: 'councilor', roleTitle: 'Mobilità', party: 'PD' },
  { name: 'Lamberto Bertolé', role: 'councilor', roleTitle: 'Welfare', party: 'PD' },
  { name: 'Gaia Romani', role: 'councilor', roleTitle: 'Casa', party: 'PD' },
  { name: 'Emmanuel Conte', role: 'councilor', roleTitle: 'Bilancio', party: 'Lista Civica' },
  { name: 'Martina Riva', role: 'councilor', roleTitle: 'Sport', party: 'PD' },
  { name: 'Tommaso Sacchi', role: 'councilor', roleTitle: 'Cultura', party: 'PD' },
  { name: 'Elena Grandi', role: 'councilor', roleTitle: 'Ambiente', party: 'Verdi' },
  { name: 'Giancarlo Tancredi', role: 'councilor', roleTitle: 'Rigenerazione', party: 'PD' },
  { name: 'Mario Bianchi', role: 'councilor', roleTitle: 'Lavori Pubblici', party: 'PD' },
  { name: 'Laura Rossi', role: 'councilor', roleTitle: 'Commercio', party: 'PD' },
  { name: 'Francesco Neri', role: 'councilor', roleTitle: 'Turismo', party: 'Lista Civica' },
  { name: 'Giulia Verdi', role: 'councilor', roleTitle: 'Giovani', party: 'PD' },
  { name: 'Alessandro Blu', role: 'councilor', roleTitle: 'Innovazione', party: 'M5S' },
  { name: 'Chiara Gialli', role: 'councilor', roleTitle: 'Pari Opportunità', party: 'PD' },
  { name: 'Roberto Arancio', role: 'councilor', roleTitle: 'Partecipazione', party: 'PD' },
  { name: 'Silvia Viola', role: 'councilor', roleTitle: 'Decentramento', party: 'PD' },
  { name: 'Andrea Marrone', role: 'councilor', roleTitle: 'Periferie', party: 'Lista Civica' },
  { name: 'Federica Rosa', role: 'councilor', roleTitle: 'Servizi Civici', party: 'PD' },
  { name: 'Luca Celeste', role: 'councilor', roleTitle: 'Trasparenza', party: 'PD' },
  { name: 'Valentina Grigio', role: 'councilor', roleTitle: 'Legalità', party: 'PD' },
  { name: 'Davide Nero', role: 'councilor', roleTitle: 'Protezione Civile', party: 'PD' },
]

// All variants comparison
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Inline (default)</h3>
        <ExecutiveMembers members={milanExecutive} variant="inline" />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Inline with Role</h3>
        <ExecutiveMembers members={milanExecutive} variant="inline-with-role" />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Grid</h3>
        <ExecutiveMembers members={milanExecutive} variant="grid" />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Grid Minimal (no background)</h3>
        <ExecutiveMembers members={milanExecutive} variant="grid-minimal" />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">List</h3>
        <ExecutiveMembers members={milanExecutive} variant="list" />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Compact</h3>
        <ExecutiveMembers members={milanExecutive} variant="compact" />
      </div>
    </div>
  ),
  args: {
    members: milanExecutive,
  },
}

export const Inline: Story = {
  args: {
    members: milanExecutive,
    variant: 'inline',
  },
}

export const InlineWithRole: Story = {
  args: {
    members: milanExecutive,
    variant: 'inline-with-role',
  },
}

export const Grid: Story = {
  args: {
    members: milanExecutive,
    variant: 'grid',
  },
}

export const GridMinimal: Story = {
  args: {
    members: milanExecutive,
    variant: 'grid-minimal',
  },
}

export const List: Story = {
  args: {
    members: milanExecutive,
    variant: 'list',
  },
}

export const Compact: Story = {
  args: {
    members: milanExecutive,
    variant: 'compact',
  },
}

export const LargeExecutiveInline: Story = {
  args: {
    members: largeExecutive,
    variant: 'inline',
  },
}

export const LargeExecutiveGrid: Story = {
  args: {
    members: largeExecutive,
    variant: 'grid',
  },
}

export const LargeExecutiveList: Story = {
  args: {
    members: largeExecutive,
    variant: 'list',
  },
}

export const VeryLargeGridMinimal: Story = {
  name: 'Grid Minimal (25 members)',
  args: {
    members: veryLargeExecutive,
    variant: 'grid-minimal',
  },
}

export const VeryLargeGrid: Story = {
  name: 'Grid (25 members)',
  args: {
    members: veryLargeExecutive,
    variant: 'grid',
  },
}

export const Empty: Story = {
  args: {
    members: [],
  },
}
