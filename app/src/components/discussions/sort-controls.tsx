'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

const sortOptions = [
  { value: 'recent', label: 'Recent' },
  { value: 'score', label: 'Top' },
  { value: 'active', label: 'Active' },
]

const typeOptions = [
  { value: '', label: 'All' },
  { value: 'discussion', label: 'Discussion' },
  { value: 'question', label: 'Question' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'analysis', label: 'Analysis' },
]

export function SortControls() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') || 'recent'
  const currentType = searchParams.get('type') || ''

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1">
        {sortOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={currentSort === opt.value ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setParam('sort', opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
      <div className="w-px h-4 bg-border mx-1" />
      <div className="flex items-center gap-1">
        {typeOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={currentType === opt.value ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setParam('type', opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
