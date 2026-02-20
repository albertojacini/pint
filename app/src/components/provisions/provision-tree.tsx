'use client'

import { Link } from '@/i18n/navigation'
import { provisionPath } from '@/lib/utils'
import type { ProvisionTreeNode } from '@/lib/actions/provisions'
import { getProvisionTypeColor } from '@/components/custom-ui/classification-badge'
import { RelevanceDots } from '@/components/custom-ui/relevance-dots'

interface ProvisionTreeProps {
  nodes: ProvisionTreeNode[]
  entity: { id: string; slug: string }
}

export function ProvisionTree({ nodes, entity }: ProvisionTreeProps) {
  return (
    <div className="space-y-1">
      {nodes.map((node) => (
        <TreeNode key={node.id} node={node} entity={entity} depth={0} />
      ))}
    </div>
  )
}

function TreeNode({
  node,
  entity,
  depth,
}: {
  node: ProvisionTreeNode
  entity: { id: string; slug: string }
  depth: number
}) {
  const primaryType = node.types[0]?.code
  const dotColor = primaryType ? getProvisionTypeColor(primaryType) : undefined

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50 transition-colors"
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        {/* Type color dot */}
        {dotColor && (
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: dotColor }}
          />
        )}

        {/* Title */}
        <Link
          href={provisionPath(entity, node)}
          className="text-sm hover:text-primary hover:underline transition-colors truncate"
        >
          {node.title}
        </Link>

        {/* Relevance */}
        {node.relevance != null && (
          <div className="shrink-0 ml-auto">
            <RelevanceDots score={node.relevance} />
          </div>
        )}
      </div>

      {/* Children */}
      {node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} entity={entity} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
