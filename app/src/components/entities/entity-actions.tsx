import Link from 'next/link'
import { Search, MessageCircle } from 'lucide-react'

interface EntityActionsProps {
  entityId: string
}

export function EntityActions({ entityId }: EntityActionsProps) {
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
        href={`/entities/${entityId}/compare`}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
      >
        <span>&ge;</span>
        <span>Compare</span>
      </Link>
    </div>
  )
}
