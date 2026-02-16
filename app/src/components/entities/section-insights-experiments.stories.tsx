'use client'

import type { Meta, StoryObj } from '@storybook/react'
import { SectionInsight } from '@/components/custom-ui/section-insight'

const meta: Meta = {
  title: 'Entities/SectionInsightsExperiments',
  parameters: {
    layout: 'padded',
  },
}

export default meta

const sampleContent =
  'The **current administration** led by *Giuseppe Sala* has prioritized sustainable mobility and digital transformation. Key metrics: **+23%** cycling infrastructure, **-15%** car traffic in Area C since 2019.'

const shortContent = 'Next municipal elections scheduled for **2026**.'

export const LongContent: StoryObj = {
  render: () => (
    <div className="max-w-2xl">
      <SectionInsight content={sampleContent} />
    </div>
  ),
}

export const ShortContent: StoryObj = {
  render: () => (
    <div className="max-w-2xl">
      <SectionInsight content={shortContent} />
    </div>
  ),
}

export const MultipleSections: StoryObj = {
  render: () => (
    <div className="space-y-6 max-w-2xl">
      <SectionInsight content="Milano è governata da una **coalizione di centrosinistra** dal 2011. L'attuale sindaco *Giuseppe Sala* è al secondo mandato (2021-2026)." />
      <SectionInsight content="Il bilancio 2024 ha raggiunto **€7,2 miliardi** di entrate, in crescita del *+4,3%* rispetto al 2023." />
      <SectionInsight content={shortContent} />
    </div>
  ),
}
