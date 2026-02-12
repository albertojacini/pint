import { Search, MessageCircle, Gamepad2, GitCompareArrows } from 'lucide-react'
import { entityPath } from '@/lib/utils'
import { QuickActionButton } from '@/components/custom-ui/buttons'

interface EntityActionsProps {
  entity: { id: string; slug: string }
}

export function EntityActions({ entity }: EntityActionsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <QuickActionButton hideTextOnMobile icon={<Search className="w-3 h-3" />}>
        Search
      </QuickActionButton>
      <QuickActionButton hideTextOnMobile icon={<MessageCircle className="w-3 h-3" />}>
        Chat
      </QuickActionButton>
      <QuickActionButton hideTextOnMobile icon={<GitCompareArrows className="w-3 h-3" />} href={`${entityPath(entity)}/compare`}>
        Compare
      </QuickActionButton>
      <QuickActionButton hideTextOnMobile icon={<Gamepad2 className="w-3 h-3" />} href={`/games/voter-budget/${entity.id}`}>
        Games
      </QuickActionButton>
    </div>
  )
}
