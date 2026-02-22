import { useTranslations } from 'next-intl'
import { TriangleAlert } from 'lucide-react'

export function EarlyPreviewBanner() {
  const t = useTranslations('banner')

  return (
    <div className="bg-red-50 border-b border-amber-200 px-4 py-2">
      <p className="container text-center text-lg text-amber-800 flex items-center justify-center gap-2">
        <TriangleAlert className="w-4 h-4 shrink-0" />
        {t('earlyPreview')}
      </p>
    </div>
  )
}
