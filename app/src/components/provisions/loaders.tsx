import { getProvisionAggregatesByEntity, getProvisionTreeByEntity } from '@/lib/actions/provisions'
import type { ProvisionAggregates } from '@/lib/actions/provisions'
import { ProvisionsOverviewWithTree } from '@/components/provisions/provisions-overview-with-tree'
import { ProvisionTree } from '@/components/provisions/provision-tree'

// --- ProvisionsOverviewLoader ---

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
    <ProvisionsOverviewWithTree
      total={aggregates.total}
      types={types}
      entityId={entityId}
      entitySlug={entitySlug}
    />
  )
}

// --- ProvisionTreeLoader ---

interface ProvisionTreeLoaderProps {
  entityId: string
  entitySlug: string
}

export async function ProvisionTreeLoader({ entityId, entitySlug }: ProvisionTreeLoaderProps) {
  const tree = await getProvisionTreeByEntity(entityId)

  return (
    <ProvisionTree
      nodes={tree}
      entity={{ id: entityId, slug: entitySlug }}
    />
  )
}
