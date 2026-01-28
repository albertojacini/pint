import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Foundations/Color Palette',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta
type Story = StoryObj

// ============================================================================
// Swatch building blocks
// ============================================================================

function Swatch({ bg, label, cssVar }: { bg: string; label: string; cssVar: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={`${bg} w-full h-14 rounded-lg border border-border/40`} />
      <span className="text-xs font-medium">{label}</span>
      <span className="text-[10px] text-muted-foreground font-mono">{cssVar}</span>
    </div>
  )
}

function PairSwatch({
  bg,
  fg,
  label,
  cssVar,
}: {
  bg: string
  fg: string
  label: string
  cssVar: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={`${bg} ${fg} w-full h-14 rounded-lg border border-border/40 flex items-center justify-center text-sm font-medium`}>
        Aa
      </div>
      <span className="text-xs font-medium">{label}</span>
      <span className="text-[10px] text-muted-foreground font-mono">{cssVar}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h3 className="text-sm font-semibold text-foreground mb-4 pb-2 border-b border-border">
        {title}
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
        {children}
      </div>
    </div>
  )
}

// ============================================================================
// Full palette story
// ============================================================================

export const AllColors: Story = {
  render: () => (
    <div className="max-w-5xl">
      {/* Core */}
      <Section title="Core">
        <PairSwatch bg="bg-background" fg="text-foreground" label="Background" cssVar="--background" />
        <PairSwatch bg="bg-foreground" fg="text-background" label="Foreground" cssVar="--foreground" />
        <PairSwatch bg="bg-primary" fg="text-primary-foreground" label="Primary" cssVar="--primary" />
        <PairSwatch bg="bg-secondary" fg="text-secondary-foreground" label="Secondary" cssVar="--secondary" />
        <PairSwatch bg="bg-muted" fg="text-muted-foreground" label="Muted" cssVar="--muted" />
        <PairSwatch bg="bg-accent" fg="text-accent-foreground" label="Accent" cssVar="--accent" />
        <PairSwatch bg="bg-card" fg="text-card-foreground" label="Card" cssVar="--card" />
        <PairSwatch bg="bg-popover" fg="text-popover-foreground" label="Popover" cssVar="--popover" />
      </Section>

      {/* Semantic */}
      <Section title="Semantic Status">
        <Swatch bg="bg-positive" label="Positive" cssVar="--positive" />
        <Swatch bg="bg-positive-light" label="Positive Light" cssVar="--positive-light" />
        <Swatch bg="bg-negative" label="Negative" cssVar="--negative" />
        <Swatch bg="bg-negative-light" label="Negative Light" cssVar="--negative-light" />
        <Swatch bg="bg-warning" label="Warning" cssVar="--warning" />
        <Swatch bg="bg-warning-light" label="Warning Light" cssVar="--warning-light" />
        <Swatch bg="bg-neutral" label="Neutral" cssVar="--neutral" />
        <Swatch bg="bg-neutral-light" label="Neutral Light" cssVar="--neutral-light" />
      </Section>

      {/* Tags */}
      <Section title="Tags">
        <Swatch bg="bg-tag-purple" label="Purple" cssVar="--tag-purple" />
        <Swatch bg="bg-tag-blue" label="Blue" cssVar="--tag-blue" />
        <Swatch bg="bg-tag-cyan" label="Cyan" cssVar="--tag-cyan" />
        <Swatch bg="bg-tag-teal" label="Teal" cssVar="--tag-teal" />
        <Swatch bg="bg-tag-green" label="Green" cssVar="--tag-green" />
        <Swatch bg="bg-tag-orange" label="Orange" cssVar="--tag-orange" />
        <Swatch bg="bg-tag-pink" label="Pink" cssVar="--tag-pink" />
        <Swatch bg="bg-tag-slate" label="Slate" cssVar="--tag-slate" />
      </Section>

      {/* Utility */}
      <Section title="Utility">
        <Swatch bg="bg-border" label="Border" cssVar="--border" />
        <Swatch bg="bg-input" label="Input" cssVar="--input" />
        <Swatch bg="bg-ring" label="Ring" cssVar="--ring" />
        <PairSwatch bg="bg-destructive" fg="text-destructive-foreground" label="Destructive" cssVar="--destructive" />
      </Section>
    </div>
  ),
}

// ============================================================================
// Semantic only — focused view for quick reference
// ============================================================================

export const Semantic: Story = {
  render: () => (
    <div className="max-w-3xl">
      <div className="grid grid-cols-2 gap-6">
        {/* Positive */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Positive</h4>
          <div className="flex gap-2">
            <div className="flex-1 h-20 rounded-lg bg-positive flex items-end p-2">
              <span className="text-[10px] font-mono text-white">positive</span>
            </div>
            <div className="flex-1 h-20 rounded-lg bg-positive-light flex items-end p-2">
              <span className="text-[10px] font-mono">positive-light</span>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-positive font-medium">text-positive</span>
            <span className="text-positive-light font-medium">text-positive-light</span>
          </div>
        </div>

        {/* Negative */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Negative</h4>
          <div className="flex gap-2">
            <div className="flex-1 h-20 rounded-lg bg-negative flex items-end p-2">
              <span className="text-[10px] font-mono text-white">negative</span>
            </div>
            <div className="flex-1 h-20 rounded-lg bg-negative-light flex items-end p-2">
              <span className="text-[10px] font-mono">negative-light</span>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-negative font-medium">text-negative</span>
            <span className="text-negative-light font-medium">text-negative-light</span>
          </div>
        </div>

        {/* Warning */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Warning</h4>
          <div className="flex gap-2">
            <div className="flex-1 h-20 rounded-lg bg-warning flex items-end p-2">
              <span className="text-[10px] font-mono text-white">warning</span>
            </div>
            <div className="flex-1 h-20 rounded-lg bg-warning-light flex items-end p-2">
              <span className="text-[10px] font-mono">warning-light</span>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-warning font-medium">text-warning</span>
            <span className="text-warning-light font-medium">text-warning-light</span>
          </div>
        </div>

        {/* Neutral */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Neutral</h4>
          <div className="flex gap-2">
            <div className="flex-1 h-20 rounded-lg bg-neutral flex items-end p-2">
              <span className="text-[10px] font-mono text-white">neutral</span>
            </div>
            <div className="flex-1 h-20 rounded-lg bg-neutral-light border border-border/40 flex items-end p-2">
              <span className="text-[10px] font-mono">neutral-light</span>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-neutral font-medium">text-neutral</span>
            <span className="text-neutral-light font-medium">text-neutral-light</span>
          </div>
        </div>
      </div>
    </div>
  ),
}

// ============================================================================
// Tags only
// ============================================================================

export const Tags: Story = {
  render: () => (
    <div className="max-w-2xl">
      <div className="grid grid-cols-4 gap-3">
        {(
          [
            ['bg-tag-purple', 'Purple', '--tag-purple'],
            ['bg-tag-blue', 'Blue', '--tag-blue'],
            ['bg-tag-cyan', 'Cyan', '--tag-cyan'],
            ['bg-tag-teal', 'Teal', '--tag-teal'],
            ['bg-tag-green', 'Green', '--tag-green'],
            ['bg-tag-orange', 'Orange', '--tag-orange'],
            ['bg-tag-pink', 'Pink', '--tag-pink'],
            ['bg-tag-slate', 'Slate', '--tag-slate'],
          ] as const
        ).map(([bg, label, cssVar]) => (
          <div key={cssVar} className="flex flex-col gap-1.5">
            <div className={`${bg} h-16 rounded-lg flex items-end p-2`}>
              <span className="text-[10px] font-mono text-white">{label.toLowerCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${bg}`} />
              <span className="text-xs font-medium">{label}</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">{cssVar}</span>
          </div>
        ))}
      </div>
    </div>
  ),
}
