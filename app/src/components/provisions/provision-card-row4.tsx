import { Badge } from '@/components/ui/badge'

interface ProvisionCardRow4Props {
  type: string
  extraData: Record<string, unknown> | null
}

// Helper function to format purpose string
function formatPurpose(purpose: string): string {
  return purpose.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
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

// Calculate year-over-year growth percentage
function calculateGrowth(current: number | undefined, previous: number | undefined): number | null {
  if (current === undefined || previous === undefined || previous === 0) {
    return null
  }
  return ((current - previous) / previous) * 100
}

export function ProvisionCardRow4({ type, extraData }: ProvisionCardRow4Props) {
  // Ownership type - Rich display
  if (type === 'ownership' && extraData) {
    const ownership = extraData as any

    return (
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Asset name */}
        <div className="col-span-2">
          <div className="text-xs text-muted-foreground">Asset</div>
          <div className="text-sm font-semibold truncate">{ownership.assetName || 'N/A'}</div>
        </div>

        {/* Ownership percentage */}
        {ownership.ownershipPercentage !== undefined && (
          <div>
            <div className="text-xs text-muted-foreground">Ownership</div>
            <div className="text-sm font-semibold">{ownership.ownershipPercentage}%</div>
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

  // Regulation type - Rich display matching taxation style
  if (type === 'regulation' && extraData) {
    const regulation = extraData as any
    const hasAnyData = regulation.regulationType || regulation.domain || regulation.complexity !== undefined

    if (hasAnyData) {
      return (
        <div className="mb-3 space-y-3">
          {/* Row 1: Badges for categorical fields */}
          {(regulation.regulationType || regulation.domain) && (
            <div className="flex items-center gap-2 flex-wrap">
              {regulation.regulationType && (
                <Badge variant="secondary" className="text-xs capitalize">
                  {regulation.regulationType.replace(/_/g, ' ')}
                </Badge>
              )}
              {regulation.domain && (
                <Badge variant="secondary" className="text-xs capitalize">
                  {regulation.domain.replace(/_/g, ' ')}
                </Badge>
              )}
            </div>
          )}

          {/* Row 2: Complexity score with progress bar */}
          {regulation.complexity !== undefined && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Complexity</div>
              <div className="text-sm font-semibold mb-1.5">{regulation.complexity}/10</div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(regulation.complexity / 10) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )
    }
  }

  // Taxation type - Rich display matching new design
  if (type === 'taxation' && extraData) {
    const taxation = extraData as any

    // Calculate growth percentages
    const revenueGrowth = calculateGrowth(taxation.taxRevenue, taxation.taxRevenuePrevYear)
    const collectionCostGrowth = calculateGrowth(
      taxation.collectionCost,
      taxation.collectionCostPrevYear
    )

    // Calculate net contribution
    const netContribution =
      taxation.taxRevenue !== undefined && taxation.collectionCost !== undefined
        ? taxation.taxRevenue - taxation.collectionCost
        : null
    const netContributionPrev =
      taxation.taxRevenuePrevYear !== undefined && taxation.collectionCostPrevYear !== undefined
        ? taxation.taxRevenuePrevYear - taxation.collectionCostPrevYear
        : null
    const netContributionGrowth = calculateGrowth(
      netContribution ?? undefined,
      netContributionPrev ?? undefined
    )

    return (
      <div className="mb-3 space-y-3">
        {/* Row 1: Header - Badges + Year */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {taxation.taxType && (
              <Badge variant="secondary" className="text-xs capitalize">
                {taxation.taxType}
              </Badge>
            )}
            {taxation.progressivity && (
              <Badge variant="secondary" className="text-xs capitalize">
                {taxation.progressivity}
              </Badge>
            )}
          </div>
          {taxation.dataYear && (
            <span className="text-sm font-semibold text-muted-foreground">
              Year {taxation.dataYear}
            </span>
          )}
        </div>

        {/* Row 2: Rate Section */}
        {taxation.rateDescription && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">Rate</div>
            <div className="text-sm">{taxation.rateDescription}</div>
          </div>
        )}

        {/* Row 3: Financial Metrics - 3 Columns */}
        <div className="grid grid-cols-3 gap-3">
          {/* Column 1: Revenue */}
          {taxation.taxRevenue !== undefined && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Revenue</div>
              <div className="flex items-baseline gap-2">
                <div className="text-sm font-semibold">
                  {formatCurrency(taxation.taxRevenue, 'EUR')}
                </div>
                {revenueGrowth !== null && (
                  <div
                    className="text-xs font-medium"
                    style={{ color: getTrendColor(revenueGrowth) }}
                  >
                    {getTrendIndicator(revenueGrowth)} {revenueGrowth > 0 ? '+' : ''}
                    {revenueGrowth.toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Column 2: Collection Cost */}
          {taxation.collectionCost !== undefined && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Collection Cost</div>
              <div className="flex items-baseline gap-2">
                <div className="text-sm font-semibold">
                  {formatCurrency(taxation.collectionCost, 'EUR')}
                </div>
                {collectionCostGrowth !== null && (
                  <div
                    className="text-xs font-medium"
                    style={{ color: getTrendColor(collectionCostGrowth) }}
                  >
                    {getTrendIndicator(collectionCostGrowth)} {collectionCostGrowth > 0 ? '+' : ''}
                    {collectionCostGrowth.toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Column 3: Net Contribution */}
          {netContribution !== null && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Net contribution</div>
              <div className="flex items-baseline gap-2">
                <div className="text-sm font-semibold">
                  {formatCurrency(netContribution, 'EUR')}
                </div>
                {netContributionGrowth !== null && (
                  <div
                    className="text-xs font-medium"
                    style={{ color: getTrendColor(netContributionGrowth) }}
                  >
                    {getTrendIndicator(netContributionGrowth)}{' '}
                    {netContributionGrowth > 0 ? '+' : ''}
                    {netContributionGrowth.toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Row 4: Revenue Share */}
        {taxation.taxRevenueShare !== undefined && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">Revenue share</div>
            <div className="text-sm font-semibold mb-1.5">{taxation.taxRevenueShare}%</div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(taxation.taxRevenueShare, 100)}%` }}
              />
            </div>
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
        <div className="text-sm text-muted-foreground mb-3">
          Contract type: <span className="font-medium capitalize">{contract.contractType}</span>
        </div>
      )
    }
  }

  // Fallback for all other cases
  return (
    <div className="text-sm text-muted-foreground mb-3">
      Additional details available on request
    </div>
  )
}
