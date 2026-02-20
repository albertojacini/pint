'use client'

import { cn } from '@/lib/utils'
import { FilterButton } from '@/components/custom-ui/buttons'

export interface FilterBarSmallProps {
  items: string[]
  selected: Set<string>
  onSelectedChange: (selected: Set<string>) => void
  showAll?: boolean
  allLabel?: string
  labelFn?: (item: string) => string
  className?: string
}

export function FilterBarSmall({
  items,
  selected,
  onSelectedChange,
  showAll = true,
  allLabel = 'All',
  labelFn,
  className,
}: FilterBarSmallProps) {
  const allSelected = selected.size === items.length

  const toggleItem = (item: string) => {
    const next = new Set(selected)
    if (next.has(item)) {
      next.delete(item)
    } else {
      next.add(item)
    }
    onSelectedChange(next)
  }

  const toggleAll = () => {
    onSelectedChange(allSelected ? new Set() : new Set(items))
  }

  if (items.length <= 1) return null

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {showAll && (
        <>
          <FilterButton selected={allSelected} onSelectedChange={toggleAll}>
            {allLabel}
          </FilterButton>
          <div className="w-px bg-border mx-1" />
        </>
      )}
      {items.map((item) => (
        <FilterButton
          key={item}
          selected={selected.has(item)}
          onSelectedChange={() => toggleItem(item)}
        >
          {labelFn ? labelFn(item) : item}
        </FilterButton>
      ))}
    </div>
  )
}
