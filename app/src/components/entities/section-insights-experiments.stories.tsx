'use client'

import type { Meta, StoryObj } from '@storybook/react'
import { Sparkles } from 'lucide-react'
import { MarkdownContent } from '@/components/custom-ui/markdown-content'

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

// Variant A: Solid tint with rounded corners
function SolidTint({ content }: { content: string }) {
  return (
    <div className="rounded-lg bg-amber-50/50 border border-amber-200/60 p-3 dark:bg-amber-950/20 dark:border-amber-800/40">
      <div className="flex gap-2">
        <Sparkles className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
        <MarkdownContent
          content={content}
          className="prose prose-sm max-w-none text-muted-foreground [&>*:last-child]:mb-0"
        />
      </div>
    </div>
  )
}

// Variant B: Dashed border
function DashedBorder({ content }: { content: string }) {
  return (
    <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/30 p-3 dark:bg-amber-950/10 dark:border-amber-700">
      <div className="flex gap-2">
        <Sparkles className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
        <MarkdownContent
          content={content}
          className="prose prose-sm max-w-none text-muted-foreground [&>*:last-child]:mb-0"
        />
      </div>
    </div>
  )
}

// Variant C: Left bar accent
function LeftBar({ content }: { content: string }) {
  return (
    <div className="rounded-lg border-l-3 border-l-amber-400 bg-amber-50/40 pl-3 pr-3 py-2.5 dark:bg-amber-950/15 dark:border-l-amber-600">
      <div className="flex gap-2">
        <Sparkles className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
        <MarkdownContent
          content={content}
          className="prose prose-sm max-w-none text-muted-foreground [&>*:last-child]:mb-0"
        />
      </div>
    </div>
  )
}

// Variant D: Gradient accent (top border)
function GradientAccent({ content }: { content: string }) {
  return (
    <div className="rounded-lg border border-amber-200/40 bg-gradient-to-b from-amber-50/60 to-transparent p-3 dark:from-amber-950/20 dark:border-amber-800/30">
      <div className="flex gap-2">
        <Sparkles className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
        <MarkdownContent
          content={content}
          className="prose prose-sm max-w-none text-muted-foreground [&>*:last-child]:mb-0"
        />
      </div>
    </div>
  )
}

export const AllVariants: StoryObj = {
  render: () => (
    <div className="space-y-6 max-w-2xl">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">A — Solid tint</p>
        <SolidTint content={sampleContent} />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">B — Dashed border</p>
        <DashedBorder content={sampleContent} />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">C — Left bar accent</p>
        <LeftBar content={sampleContent} />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">D — Gradient accent</p>
        <GradientAccent content={sampleContent} />
      </div>
    </div>
  ),
}

export const ShortContent: StoryObj = {
  render: () => (
    <div className="space-y-6 max-w-2xl">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">A — Solid tint</p>
        <SolidTint content={shortContent} />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">B — Dashed border</p>
        <DashedBorder content={shortContent} />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">C — Left bar accent</p>
        <LeftBar content={shortContent} />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">D — Gradient accent</p>
        <GradientAccent content={shortContent} />
      </div>
    </div>
  ),
}
