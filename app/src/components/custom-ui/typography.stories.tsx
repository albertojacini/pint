import type { Meta, StoryObj } from '@storybook/react'
import { PageTitle, SectionL1Title, SectionL2Title, SectionL3Title, Lead, Muted } from './typography'

const meta = {
  title: 'Custom-UI/Typography',
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
        <span className="text-[10px] font-mono text-muted-foreground">PageTitle — text-2xl font-semibold</span>
        <PageTitle>Public housing policy in Barcelona</PageTitle>
      </div>
      <div className="space-y-1">
        <span className="text-[10px] font-mono text-muted-foreground">SectionL1Title — text-xl font-medium</span>
        <SectionL1Title>Ownership regulations</SectionL1Title>
      </div>
      <div className="space-y-1">
        <span className="text-[10px] font-mono text-muted-foreground">SectionL2Title — text-sm font-medium text-muted-foreground</span>
        <SectionL2Title>Rental price limits</SectionL2Title>
      </div>
      <div className="space-y-1">
        <span className="text-[10px] font-mono text-muted-foreground">SectionL3Title — text-[10px] uppercase tracking-wider text-muted-foreground/60</span>
        <SectionL3Title>Maximum monthly rent</SectionL3Title>
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

export const SectionL1TitleStory: Story = {
  name: 'SectionL1Title',
  render: () => <SectionL1Title>Ownership regulations</SectionL1Title>,
}

export const SectionL2TitleStory: Story = {
  name: 'SectionL2Title',
  render: () => <SectionL2Title>Rental price limits</SectionL2Title>,
}

export const SectionL3TitleStory: Story = {
  name: 'SectionL3Title',
  render: () => <SectionL3Title>Maximum monthly rent</SectionL3Title>,
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
      <SectionL1Title as="span">SectionL1Title rendered as span</SectionL1Title>
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
