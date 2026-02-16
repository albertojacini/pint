'use client'

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { getProvisionTreeByEntity } from '@/lib/actions/provisions'
import type { ProvisionTreeNode } from '@/lib/actions/provisions'
import { ProvisionTree } from './provision-tree'
import { Loader2 } from 'lucide-react'

interface ProvisionTreeModalProps {
  entityId: string
  entitySlug: string
  children: (openModal: () => void) => React.ReactNode
}

export function ProvisionTreeModal({ entityId, entitySlug, children }: ProvisionTreeModalProps) {
  const [open, setOpen] = useState(false)
  const [tree, setTree] = useState<ProvisionTreeNode[] | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleOpen() {
    setOpen(true)
    if (!tree) {
      startTransition(async () => {
        const data = await getProvisionTreeByEntity(entityId)
        setTree(data)
      })
    }
  }

  return (
    <>
      {children(handleOpen)}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Provision Tree</DialogTitle>
            <DialogDescription>Hierarchical view of all provisions</DialogDescription>
          </DialogHeader>
          {isPending || !tree ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : tree.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No provisions found</p>
          ) : (
            <ProvisionTree nodes={tree} entity={{ id: entityId, slug: entitySlug }} />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
