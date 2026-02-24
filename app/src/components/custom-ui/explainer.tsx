'use client'

import { CircleHelp } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useState } from 'react'

// ============================================================================
// Types
// ============================================================================

export interface ExplainerChip {
  label: string
  content: React.ReactNode
  variant?: 'default' | 'accent'
}

export interface ExplainerItem {
  label: string
  title: string
  description: React.ReactNode
  chips?: ExplainerChip[]
}

interface ExplainerProps {
  items: ExplainerItem[]
  type?: 'items' | 'timeline'
  className?: string
}

// ============================================================================
// Inline link (Wikipedia-style) + Dialog
// ============================================================================

interface ExplainerLinkProps {
  label: string
  title?: string
  content: React.ReactNode
  children: React.ReactNode
}

export function ExplainerLink({ label, title, content, children }: ExplainerLinkProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="underline decoration-dashed underline-offset-2 text-link hover:decoration-solid transition-colors"
      >
        {children}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{title ?? label}</DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <div className="text-sm text-muted-foreground leading-relaxed">{content}</div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ============================================================================
// Chip + Dialog
// ============================================================================

function ChipWithDialog({ chip }: { chip: ExplainerChip }) {
  const [open, setOpen] = useState(false)
  const isAccent = chip.variant === 'accent'
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors',
          isAccent
            ? 'border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10'
            : 'border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <CircleHelp className="h-3 w-3 opacity-50" />
        {chip.label}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={isAccent ? 'max-w-4xl' : 'max-w-lg'}>
          <DialogHeader>
            <DialogTitle>{chip.label}</DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <div className="text-sm text-muted-foreground leading-relaxed">{chip.content}</div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ============================================================================
// Item content (shared between types)
// ============================================================================

function ItemContent({ item }: { item: ExplainerItem }) {
  return (
    <>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
        {item.label}
      </span>
      <p className="text-base font-medium leading-snug mt-0.5">{item.title}</p>
      <div className="text-sm text-muted-foreground mt-0.5">{item.description}</div>
      {item.chips && item.chips.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {item.chips.map((chip) => (
            <ChipWithDialog key={chip.label} chip={chip} />
          ))}
        </div>
      )}
    </>
  )
}

// ============================================================================
// Explainer
// ============================================================================

export function Explainer({ items, type = 'items', className }: ExplainerProps) {
  if (type === 'timeline') {
    return (
      <div className={cn('relative pl-6', className)}>
        <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
        <div className="space-y-5">
          {items.map((item, i) => (
            <div key={i} className="relative">
              <div
                className={cn(
                  'absolute -left-6 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background',
                  i === items.length - 1 ? 'bg-primary' : 'bg-muted-foreground/40'
                )}
              />
              <ItemContent item={item} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-5', className)}>
      {items.map((item, i) => (
        <div key={i}>
          <ItemContent item={item} />
        </div>
      ))}
    </div>
  )
}
