import { getProvisionAggregatesByEntity } from '@/lib/actions/provisions'
import type { ProvisionAggregates } from '@/lib/actions/provisions'
import { ProvisionsOverview } from '@/components/provisions/provisions-overview'

type TypeCode = keyof ProvisionAggregates['byType']

interface ProvisionsOverviewLoaderProps {
  entityId: string
  entitySlug: string
}

export async function ProvisionsOverviewLoader({ entityId, entitySlug }: ProvisionsOverviewLoaderProps) {
  const aggregates = await getProvisionAggregatesByEntity(entityId)

  const types = (Object.keys(aggregates.byType) as TypeCode[])
    .filter((code) => aggregates.byType[code].count > 0)
    .map((code) => ({
      type: code,
      count: aggregates.byType[code].count,
    }))

  return (
    <ProvisionsOverview
      total={aggregates.total}
      types={types}
      treeLink={`/pe/${entitySlug}/pr/tree`}
    />
  )
}
