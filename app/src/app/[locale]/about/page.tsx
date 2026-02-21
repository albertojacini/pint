import { getTranslations } from 'next-intl/server'
import { PageHeader } from '@/components/custom-ui/section'

export default async function AboutPage() {
  const t = await getTranslations('about')

  return (
    <div>
      <PageHeader title={t('title')} description={t('description')} />
      <p className="text-muted-foreground">{t('comingSoon')}</p>
    </div>
  )
}
