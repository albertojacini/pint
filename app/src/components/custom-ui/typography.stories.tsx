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
