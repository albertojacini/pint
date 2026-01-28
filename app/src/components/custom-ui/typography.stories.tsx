import type { Meta, StoryObj } from '@storybook/react'
import { PageTitle, SectionTitle, SubsectionTitle, Lead, Muted } from './typography'

const meta = {
  title: 'Foundations/Typography',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta
type Story = StoryObj

export const AllLevels: Story = {
  render: () => (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-1">
        <span className="text-[10px] font-mono text-muted-foreground">PageTitle — text-3xl font-bold</span>
        <PageTitle>Public housing policy in Barcelona</PageTitle>
      </div>
      <div className="space-y-1">
        <span className="text-[10px] font-mono text-muted-foreground">SectionTitle — text-2xl font-semibold</span>
        <SectionTitle>Ownership regulations</SectionTitle>
      </div>
      <div className="space-y-1">
        <span className="text-[10px] font-mono text-muted-foreground">SubsectionTitle — text-xl font-semibold</span>
        <SubsectionTitle>Rental price limits</SubsectionTitle>
      </div>
      <div className="space-y-1">
        <span className="text-[10px] font-mono text-muted-foreground">Lead — text-lg text-muted-foreground</span>
        <Lead>A comprehensive overview of housing provisions across the metropolitan area, covering ownership, rental, and social housing policies.</Lead>
      </div>
      <div className="space-y-1">
        <span className="text-[10px] font-mono text-muted-foreground">Muted — text-sm text-muted-foreground</span>
        <Muted>Last updated 3 days ago · 12 provisions · 4 entities</Muted>
      </div>
    </div>
  ),
}

export const PageTitleStory: Story = {
  name: 'PageTitle',
  render: () => <PageTitle>Public housing policy in Barcelona</PageTitle>,
}

export const SectionTitleStory: Story = {
  name: 'SectionTitle',
  render: () => <SectionTitle>Ownership regulations</SectionTitle>,
}

export const SubsectionTitleStory: Story = {
  name: 'SubsectionTitle',
  render: () => <SubsectionTitle>Rental price limits</SubsectionTitle>,
}

export const LeadStory: Story = {
  name: 'Lead',
  render: () => (
    <Lead>A comprehensive overview of housing provisions across the metropolitan area.</Lead>
  ),
}

export const MutedStory: Story = {
  name: 'Muted',
  render: () => <Muted>Last updated 3 days ago · 12 provisions</Muted>,
}

export const CustomTag: Story = {
  name: 'Custom HTML element',
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <PageTitle as="div">PageTitle rendered as div</PageTitle>
      <SectionTitle as="span">SectionTitle rendered as span</SectionTitle>
      <Lead as="div">Lead rendered as div</Lead>
    </div>
  ),
}

export const MonospaceUsage: Story = {
  name: 'Monospace (font-mono-ui)',
  render: () => (
    <div className="space-y-6 max-w-2xl">
      <p className="text-sm text-muted-foreground">
        Use <code className="font-mono-ui bg-muted px-1 rounded">font-mono-ui</code> for data-forward elements.
      </p>

      <div className="space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono-ui text-muted-foreground">Dates & timestamps</span>
          <p className="text-sm">
            Last updated <span className="font-mono-ui">3 days ago</span> · <span className="font-mono-ui">Jan 15, 2024</span>
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono-ui text-muted-foreground">Counts & stats</span>
          <p className="text-sm">
            <span className="font-mono-ui">12</span> provisions · <span className="font-mono-ui">4</span> entities · <span className="font-mono-ui">89%</span> support
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono-ui text-muted-foreground">IDs & reference codes</span>
          <p className="text-sm font-mono-ui">
            PROV-2024-0042 · ENT-BCN-001
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono-ui text-muted-foreground">Classification labels</span>
          <p className="text-sm font-mono-ui">
            ownership · regulation · taxation
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono-ui text-muted-foreground">Status indicators</span>
          <p className="text-sm">
            Status: <span className="font-mono-ui text-positive">approved</span> · <span className="font-mono-ui text-warning">pending</span> · <span className="font-mono-ui text-negative">rejected</span>
          </p>
        </div>
      </div>
    </div>
  ),
}
