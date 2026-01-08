import Link from 'next/link'
import { PageTitle } from '@/components/custom-ui/typography'

const adminPages = [
  {
    title: 'Provision Ingestion',
    description: 'Create and manage provision drafts',
    href: '/admin/provision-ingestion',
  },
  {
    title: 'Event Ingestion',
    description: 'Import events from external sources and update provisions',
    href: '/admin/event-ingestion',
  },
]

export default function AdminPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <PageTitle className="mb-8">Admin</PageTitle>

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
