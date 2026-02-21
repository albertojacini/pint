import { getTranslations } from 'next-intl/server'
import { PageHeader } from '@/components/custom-ui/section'

export default async function ProjectsPage() {
  const t = await getTranslations('projects')

  return (
    <div>
      <PageHeader title={t('title')} description={t('description')} />
      <p className="text-muted-foreground">{t('comingSoon')}</p>
    </div>
  )
}
