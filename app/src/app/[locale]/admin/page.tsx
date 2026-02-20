import { Link } from '@/i18n/navigation'
import { PageHeader } from '@/components/custom-ui/section'
import { getTranslations } from 'next-intl/server'

export default async function AdminPage() {
  const t = await getTranslations('admin')

  const adminPages = [
    {
      title: t('provisionIngestion'),
      description: t('provisionIngestionDescription'),
      href: '/admin/provision-ingestion' as const,
    },
    {
      title: t('eventIngestion'),
      description: t('eventIngestionDescription'),
      href: '/admin/event-ingestion' as const,
    },
  ]

  return (
    <div>
      <PageHeader title={t('title')} />

      <div className="grid gap-4">
        {adminPages.map((page) => (
          <Link key={page.href} href={page.href} className="block">
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
              <h3 className="font-medium text-gray-900 text-lg">{page.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{page.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
