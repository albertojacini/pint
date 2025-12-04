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

// Get trend arrow indicator based on growth value
function getTrendIndicator(growth: number): string {
  if (growth > 0) return '↑'
  if (growth < 0) return '↓'
  return '→'
}

// Get color for trend based on growth value
function getTrendColor(growth: number): string {
  if (growth > 0) return 'rgb(34 197 94)' // green-500
  if (growth < 0) return 'rgb(239 68 68)' // red-500
  return 'rgb(107 114 128)' // gray-500
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

  // Taxation type - Rich display
  if (type === 'taxation' && extraData) {
    const taxation = extraData as any

    return (
      <div className="grid grid-cols-2 gap-2 py-3 px-3 bg-muted/50 rounded-lg mb-3">
        {/* Row 1: Tax Type + Rate Description */}
        {taxation.taxType && (
          <div className="col-span-2 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs capitalize">
              {taxation.taxType}
            </Badge>
            {taxation.rateDescription && (
              <span className="text-sm font-medium">{taxation.rateDescription}</span>
            )}
          </div>
        )}

        {/* Row 2: Revenue + Collection Cost */}
        {taxation.taxRevenueAmount && (
          <div>
            <div className="text-xs text-muted-foreground">
              Revenue {taxation.taxRevenueFiscalYear && `(${taxation.taxRevenueFiscalYear})`}
            </div>
            <div className="text-sm font-semibold">
              {formatCurrency(taxation.taxRevenueAmount, 'EUR')}
            </div>
          </div>
        )}

        {taxation.collectionCostAmount && (
          <div>
            <div className="text-xs text-muted-foreground">
              Collection Cost {taxation.collectionCostYear && `(${taxation.collectionCostYear})`}
            </div>
            <div className="text-sm font-semibold">
              {formatCurrency(taxation.collectionCostAmount, 'EUR')}
            </div>
          </div>
        )}

        {/* Row 3: Revenue Growth + Revenue Share */}
        {taxation.revenueGrowth !== undefined && (
          <div>
            <div className="text-xs text-muted-foreground">Revenue Growth</div>
            <div className="text-sm font-semibold" style={{ color: getTrendColor(taxation.revenueGrowth) }}>
              {getTrendIndicator(taxation.revenueGrowth)} {taxation.revenueGrowth > 0 ? '+' : ''}{taxation.revenueGrowth}% YoY
            </div>
          </div>
        )}

        {taxation.taxRevenueShare !== undefined && (
          <div>
            <div className="text-xs text-muted-foreground">Revenue Share</div>
            <div className="text-sm font-semibold mb-1">{taxation.taxRevenueShare}%</div>
            {/* Progress bar visualization */}
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(taxation.taxRevenueShare, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Row 4: Progressivity */}
        {taxation.progressivity && (
          <div className="col-span-2">
            <div className="text-xs text-muted-foreground mb-1">Tax Design</div>
            <Badge variant="secondary" className="text-xs capitalize">
              {taxation.progressivity}
            </Badge>
          </div>
        )}
      </div>
    )
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
