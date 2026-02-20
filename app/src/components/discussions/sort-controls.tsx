'use client'

import { useRouter, usePathname } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export function SortControls() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations('discussions')

  const sortOptions = [
    { value: 'recent', label: t('recent') },
    { value: 'score', label: t('top') },
    { value: 'active', label: t('active') },
  ]

  const typeOptions = [
    { value: '', label: t('all') },
    { value: 'discussion', label: t('discussion') },
    { value: 'question', label: t('question') },
    { value: 'proposal', label: t('proposal') },
    { value: 'analysis', label: t('analysisType') },
  ]
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
