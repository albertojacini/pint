import { getProvisionAggregatesByEntity, getProvisionsByEntity } from '@/lib/actions/provisions'
import type { ProvisionAggregates } from '@/lib/actions/provisions'
import { ProvisionsOverview } from '@/components/provisions/provisions-overview'

type TypeCode = keyof ProvisionAggregates['byType']

interface ProvisionsOverviewLoaderProps {
  entityId: string
  entitySlug: string
}

export async function ProvisionsOverviewLoader({ entityId, entitySlug }: ProvisionsOverviewLoaderProps) {
  const [aggregates, provisions] = await Promise.all([
    getProvisionAggregatesByEntity(entityId),
    getProvisionsByEntity(entityId),
  ])

  const types = (Object.keys(aggregates.byType) as TypeCode[])
    .filter((code) => aggregates.byType[code].count > 0)
    .map((code) => ({
      type: code,
      count: aggregates.byType[code].count,
    }))

  const topProvisions = provisions.slice(0, 6).map((p) => ({
    title: p.title,
    type: p.types[0]?.code ?? 'regulation',
  }))

  return (
    <ProvisionsOverview
      total={aggregates.total}
      types={types}
      topProvisions={topProvisions}
      treeLink={`/pe/${entitySlug}/pr/tree`}
    />
  )
}
