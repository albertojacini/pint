import Link from 'next/link'
import { Search, MessageCircle, Gamepad2 } from 'lucide-react'
import { entityPath } from '@/lib/utils'

interface EntityActionsProps {
  entity: { id: string; slug: string }
}

export function EntityActions({ entity }: EntityActionsProps) {
  return (
    <div className="flex items-center gap-2 py-4 mb-4">
      <button
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        title="Search"
      >
        <Search className="w-4 h-4" />
        <span>Search</span>
      </button>
      <button
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        title="Chat"
      >
        <MessageCircle className="w-4 h-4" />
        <span>Chat</span>
      </button>
      <Link
        href={`${entityPath(entity)}/compare`}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
      >
        <span>&ge;</span>
        <span>Compare</span>
      </Link>
      <Link
        href={`/games/voter-budget/${entity.id}`}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
      >
        <Gamepad2 className="w-4 h-4" />
        <span>Games</span>
      </Link>
    </div>
  )
}
