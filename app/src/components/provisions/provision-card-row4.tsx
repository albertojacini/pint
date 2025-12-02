import { Badge } from '@/components/ui/badge'

interface ProvisionCardRow4Props {
  type: string
  extraData: Record<string, unknown> | null
}

// Helper function to format purpose string
function formatPurpose(purpose: string): string {
  return purpose.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Helper function to format currency
function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      notation: amount >= 1000000 ? 'compact' : 'standard',
      maximumFractionDigits: 0,
    }).format(amount)
  } catch (e) {
    return `${currency} ${amount.toLocaleString()}`
  }
}

export function ProvisionCardRow4({ type, extraData }: ProvisionCardRow4Props) {
  // Ownership type - Rich display
  if (type === 'ownership' && extraData) {
    const ownership = extraData as any

    return (
      <div className="grid grid-cols-2 gap-2 py-3 px-3 bg-muted/50 rounded-lg mb-3">
        {/* Asset name */}
        <div className="col-span-2">
          <div className="text-xs text-muted-foreground">Asset</div>
          <div className="text-sm font-semibold truncate">
            {ownership.assetName || 'N/A'}
          </div>
        </div>

        {/* Ownership percentage */}
        {ownership.ownershipPercentage !== undefined && (
          <div>
            <div className="text-xs text-muted-foreground">Ownership</div>
            <div className="text-sm font-semibold">
              {ownership.ownershipPercentage}%
            </div>
          </div>
        )}

        {/* Asset category */}
        {ownership.assetCategory && (
          <div>
            <div className="text-xs text-muted-foreground">Category</div>
            <div className="text-sm font-semibold capitalize">
              {ownership.assetCategory.replace(/_/g, ' ')}
            </div>
          </div>
        )}

        {/* Purpose badge */}
        {ownership.purpose && (
          <div className="col-span-2">
            <div className="text-xs text-muted-foreground mb-1">Purpose</div>
            <Badge variant="secondary" className="text-xs">
              {formatPurpose(ownership.purpose)}
            </Badge>
          </div>
        )}

        {/* Financial info - Valuation or Investment */}
        {(ownership.valuationAmount || ownership.investmentAmount) && (
          <div className="col-span-2">
            <div className="text-xs text-muted-foreground">
              {ownership.valuationAmount ? 'Valuation' : 'Investment'}
            </div>
            <div className="text-sm font-semibold">
              {formatCurrency(
                ownership.valuationAmount || ownership.investmentAmount,
                ownership.valuationCurrency || ownership.investmentCurrency || 'EUR'
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Regulation type - Simple display
  if (type === 'regulation' && extraData) {
    const regulation = extraData as any
    if (regulation.regulationType) {
      return (
        <div className="py-2 px-3 bg-muted/30 rounded text-sm text-muted-foreground mb-3">
          Type: <span className="font-medium capitalize">{regulation.regulationType}</span>
        </div>
      )
    }
  }

  // Taxation type - Simple display
  if (type === 'taxation' && extraData) {
    const taxation = extraData as any
    if (taxation.taxType) {
      return (
        <div className="py-2 px-3 bg-muted/30 rounded text-sm text-muted-foreground mb-3">
          <span className="font-medium capitalize">{taxation.taxType}</span>
          {taxation.rate && (
            <>
              {' · '}
              <span className="font-medium">
                {taxation.rate}{taxation.rateType === 'percentage' ? '%' : ''}
              </span>
            </>
          )}
        </div>
      )
    }
  }

  // Contract type - Simple display
  if (type === 'contract' && extraData) {
    const contract = extraData as any
    if (contract.contractType) {
      return (
        <div className="py-2 px-3 bg-muted/30 rounded text-sm text-muted-foreground mb-3">
          Contract type: <span className="font-medium capitalize">{contract.contractType}</span>
        </div>
      )
    }
  }

  // Fallback for all other cases
  return (
    <div className="py-2 px-3 bg-muted/30 rounded text-sm text-muted-foreground mb-3">
      Additional details available on request
    </div>
  )
}
