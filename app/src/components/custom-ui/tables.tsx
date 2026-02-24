import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DefinitionTableItem {
  label: string
  value: ReactNode
}

interface DefinitionTableProps {
  items: DefinitionTableItem[]
  className?: string
}

export function DefinitionTable({ items, className }: DefinitionTableProps) {
  return (
    <dl className={cn('text-sm space-y-2', className)}>
      {items.map((item) => (
        <div key={item.label} className="flex gap-2">
          <dt className="text-muted-foreground shrink-0 w-28">{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
