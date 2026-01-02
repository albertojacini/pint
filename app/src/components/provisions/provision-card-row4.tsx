import type { ProvisionType } from '@/lib/actions/provisions'

interface ProvisionCardRow4Props {
  types: ProvisionType[]
  displayData: { items: Array<{ label: string; value: string }> } | null
}

export function ProvisionCardRow4({ types, displayData }: ProvisionCardRow4Props) {
  // If no display data or no items, don't render anything
  if (!displayData || !displayData.items || displayData.items.length === 0) {
    return null
  }

  return (
    <div className="mb-3 space-y-2">
      {displayData.items.map((item, index) => (
        <div key={index} className="flex justify-between items-baseline">
          <span className="text-xs text-muted-foreground">{item.label}</span>
          <span className="text-sm font-semibold">{item.value}</span>
        </div>
      ))}
    </div>
  )
}
