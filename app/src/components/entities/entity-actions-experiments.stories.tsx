import type { Meta, StoryObj } from '@storybook/react'
import {
  Search, MessageCircle, Gamepad2, GitCompareArrows,
  Bot, Sparkles, BarChart3, Vote, Telescope,
  ArrowRight, ExternalLink, ChevronRight,
  Globe, Landmark, Scale, BookOpen,
} from 'lucide-react'

const meta: Meta = {
  title: 'Entities/EntityActionsExperiments',
  parameters: {
    layout: 'padded',
  },
}

export default meta

const actions = [
  { label: 'Search', icon: Search },
  { label: 'Chat', icon: MessageCircle },
  { label: 'Compare', icon: GitCompareArrows },
  { label: 'Games', icon: Gamepad2 },
]

const actionsAlt = [
  { label: 'Search', icon: Telescope },
  { label: 'Ask AI', icon: Sparkles },
  { label: 'Compare', icon: BarChart3 },
  { label: 'Vote', icon: Vote },
]

const actionsExtended = [
  { label: 'Search', icon: Search },
  { label: 'Chat', icon: Bot },
  { label: 'Compare', icon: GitCompareArrows },
  { label: 'Games', icon: Gamepad2 },
  { label: 'Explore', icon: Globe },
  { label: 'Policies', icon: Scale },
]

// ── Style Variants ──────────────────────────────────────────────────

function StyleVariants() {
  return (
    <div className="space-y-10">
      {/* 1: Current — outlined with border */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Current (outlined)</p>
        <div className="flex items-center gap-2">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 2: Ghost — no border, bg on hover */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Ghost</p>
        <div className="flex items-center gap-1">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3: Soft — muted bg, no border */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Soft fill</p>
        <div className="flex items-center gap-2">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded bg-muted/60 hover:bg-muted transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 4: Pill outlined */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Pill outlined</p>
        <div className="flex items-center gap-2">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border border-border bg-background hover:bg-muted transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 5: Pill soft */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Pill soft</p>
        <div className="flex items-center gap-2">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-muted/60 hover:bg-muted transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 6: Underline ghost */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Underline ghost</p>
        <div className="flex items-center gap-4">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 7: Solid dark */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Solid dark</p>
        <div className="flex items-center gap-2">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded bg-foreground text-background hover:bg-foreground/80 transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 8: Icon trailing */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Icon trailing (outlined)</p>
        <div className="flex items-center gap-2">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded border border-border bg-background hover:bg-muted transition-colors"
            >
              <span>{label}</span>
              <Icon className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>

      {/* 9: Compact — smaller padding */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Compact outlined</p>
        <div className="flex items-center gap-1.5">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border border-border bg-background hover:bg-muted transition-colors"
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 10: Compact ghost */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Compact ghost</p>
        <div className="flex items-center gap-1">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 11: Compact pill outlined */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Compact pill outlined</p>
        <div className="flex items-center gap-1.5">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-border bg-background hover:bg-muted transition-colors"
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 12: Compact dark */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Compact dark</p>
        <div className="flex items-center gap-1.5">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-foreground text-background hover:bg-foreground/80 transition-colors"
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 13: Compact pill dark */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Compact pill dark</p>
        <div className="flex items-center gap-1.5">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-foreground text-background hover:bg-foreground/80 transition-colors"
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 14: Compact pill soft */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Compact pill soft</p>
        <div className="flex items-center gap-1.5">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-muted/60 hover:bg-muted transition-colors"
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

export const Styles: StoryObj = {
  render: () => <StyleVariants />,
}

// ── Icon Variants ───────────────────────────────────────────────────

function IconVariants() {
  return (
    <div className="space-y-10">
      {/* Original icons */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Original icons</p>
        <div className="flex items-center gap-2">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded border border-border bg-background hover:bg-muted transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Alternative icons */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Alternative icons (Telescope, Sparkles, BarChart3, Vote)</p>
        <div className="flex items-center gap-2">
          {actionsAlt.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded border border-border bg-background hover:bg-muted transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Extended set */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Extended set (6 actions)</p>
        <div className="flex items-center gap-2 flex-wrap">
          {actionsExtended.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded border border-border bg-background hover:bg-muted transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Icon-only */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Icon-only</p>
        <div className="flex items-center gap-1">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              title={label}
              className="flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </section>

      {/* Icon-only outlined */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Icon-only outlined</p>
        <div className="flex items-center gap-1.5">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              title={label}
              className="flex items-center justify-center w-9 h-9 rounded border border-border bg-background hover:bg-muted transition-colors"
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </section>

      {/* Icon-only circular */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Icon-only circular</p>
        <div className="flex items-center gap-1.5">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              title={label}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-background hover:bg-muted transition-colors"
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </section>

      {/* With chevron */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">With chevron arrow</p>
        <div className="flex items-center gap-2">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded border border-border bg-background hover:bg-muted transition-colors group"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

export const Icons: StoryObj = {
  render: () => <IconVariants />,
}

// ── Layout Variants ─────────────────────────────────────────────────

function LayoutVariants() {
  return (
    <div className="space-y-10">
      {/* Horizontal — default */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Horizontal (default)</p>
        <div className="flex items-center gap-2">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded border border-border bg-background hover:bg-muted transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* With separator line below */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">With bottom border</p>
        <div className="flex items-center gap-2 pb-4 border-b border-border">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded border border-border bg-background hover:bg-muted transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Tab-like — underline active style */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Tab-like (underline first)</p>
        <div className="flex items-center gap-4 border-b border-border">
          {actions.map(({ label, icon: Icon }, i) => (
            <button
              key={label}
              className={`flex items-center gap-2 px-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                i === 0
                  ? 'border-b-foreground text-foreground'
                  : 'border-b-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Vertical stack */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Vertical stack</p>
        <div className="flex flex-col gap-1 w-48">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Vertical with right arrow */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Vertical with arrow</p>
        <div className="flex flex-col gap-1 w-56">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors group"
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1 text-left">{label}</span>
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </section>

      {/* Grid layout — 2x2 */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Grid 2x2</p>
        <div className="grid grid-cols-2 gap-2 w-80">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded border border-border bg-background hover:bg-muted transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Grid with description */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Grid with description</p>
        <div className="grid grid-cols-2 gap-2 w-96">
          {[
            { label: 'Search', icon: Search, desc: 'Find policies and data' },
            { label: 'Chat', icon: MessageCircle, desc: 'Ask questions with AI' },
            { label: 'Compare', icon: GitCompareArrows, desc: 'Side-by-side analysis' },
            { label: 'Games', icon: Gamepad2, desc: 'Interactive simulations' },
          ].map(({ label, icon: Icon, desc }) => (
            <button
              key={label}
              className="flex flex-col items-start gap-1 px-4 py-3 rounded border border-border bg-background hover:bg-muted transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </div>
              <span className="text-xs text-muted-foreground">{desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Centered icon-top grid */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Icon-top centered grid</p>
        <div className="grid grid-cols-4 gap-2 w-96">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex flex-col items-center gap-1.5 px-3 py-3 rounded border border-border bg-background hover:bg-muted transition-colors"
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Toolbar style — grouped with dividers */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Toolbar (grouped)</p>
        <div className="inline-flex items-center border border-border rounded divide-x divide-border">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-muted transition-colors first:rounded-l last:rounded-r"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Toolbar icon-only */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Toolbar icon-only</p>
        <div className="inline-flex items-center border border-border rounded divide-x divide-border">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              title={label}
              className="flex items-center justify-center w-10 h-10 hover:bg-muted transition-colors first:rounded-l last:rounded-r"
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

export const Layouts: StoryObj = {
  render: () => <LayoutVariants />,
}

// ── Color & Emphasis ────────────────────────────────────────────────

function ColorVariants() {
  const coloredActions = [
    { label: 'Search', icon: Search, color: 'blue' },
    { label: 'Chat', icon: MessageCircle, color: 'purple' },
    { label: 'Compare', icon: GitCompareArrows, color: 'amber' },
    { label: 'Games', icon: Gamepad2, color: 'green' },
  ] as const

  const colorMap = {
    blue: { soft: 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    purple: { soft: 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
    amber: { soft: 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
    green: { soft: 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
  }

  return (
    <div className="space-y-10">
      {/* Soft colored */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Soft colored</p>
        <div className="flex items-center gap-2">
          {coloredActions.map(({ label, icon: Icon, color }) => (
            <button
              key={label}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded transition-colors ${colorMap[color].soft}`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Soft colored outlined */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Soft colored + border</p>
        <div className="flex items-center gap-2">
          {coloredActions.map(({ label, icon: Icon, color }) => (
            <button
              key={label}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded border transition-colors ${colorMap[color].soft} ${colorMap[color].border}`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Soft colored pills */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Soft colored pills</p>
        <div className="flex items-center gap-2">
          {coloredActions.map(({ label, icon: Icon, color }) => (
            <button
              key={label}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors ${colorMap[color].soft}`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Primary + secondary mix */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Primary + secondary emphasis</p>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded bg-foreground text-background hover:bg-foreground/80 transition-colors">
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
          {actions.slice(1).map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded border border-border bg-background hover:bg-muted transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Ghost with colored icons */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Ghost with colored icons</p>
        <div className="flex items-center gap-1">
          {coloredActions.map(({ label, icon: Icon, color }) => {
            const iconColor = {
              blue: 'text-blue-500',
              purple: 'text-purple-500',
              amber: 'text-amber-500',
              green: 'text-green-500',
            }[color]
            return (
              <button
                key={label}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded text-foreground hover:bg-muted transition-colors"
              >
                <Icon className={`w-4 h-4 ${iconColor}`} />
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Left color accent */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Left border accent</p>
        <div className="flex items-center gap-2">
          {coloredActions.map(({ label, icon: Icon, color }) => {
            const borderColor = {
              blue: 'border-l-blue-500',
              purple: 'border-l-purple-500',
              amber: 'border-l-amber-500',
              green: 'border-l-green-500',
            }[color]
            return (
              <button
                key={label}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-l-2 ${borderColor} bg-muted/40 hover:bg-muted transition-colors`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export const Colors: StoryObj = {
  render: () => <ColorVariants />,
}
