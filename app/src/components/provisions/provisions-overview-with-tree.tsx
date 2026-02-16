'use client'

import { ProvisionsOverview } from './provisions-overview'
import { ProvisionTreeModal } from './provision-tree-modal'

interface ProvisionsOverviewWithTreeProps {
  total: number
  types: Array<{ type: string; count: number }>
  entityId: string
  entitySlug: string
}

export function ProvisionsOverviewWithTree({
  total,
  types,
  entityId,
  entitySlug,
}: ProvisionsOverviewWithTreeProps) {
  return (
    <ProvisionTreeModal entityId={entityId} entitySlug={entitySlug}>
      {(openModal) => (
        <ProvisionsOverview total={total} types={types} onViewTree={openModal} />
      )}
    </ProvisionTreeModal>
  )
}
