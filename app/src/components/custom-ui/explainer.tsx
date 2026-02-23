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
}

export interface ExplainerItem {
  label: string
  title: string
  description: string
  chips?: ExplainerChip[]
}

interface ExplainerProps {
  items: ExplainerItem[]
  type?: 'items' | 'timeline'
  className?: string
}

// ============================================================================
// Chip + Dialog
// ============================================================================

function ChipWithDialog({ chip }: { chip: ExplainerChip }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <CircleHelp className="h-3 w-3 opacity-50" />
        {chip.label}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
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
      <p className="text-sm font-medium leading-snug mt-0.5">{item.title}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
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
    <div className={cn('divide-y divide-border', className)}>
      {items.map((item, i) => (
        <div key={i} className="py-4 first:pt-0 last:pb-0">
          <ItemContent item={item} />
        </div>
      ))}
    </div>
  )
}
