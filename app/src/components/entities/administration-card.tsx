import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

interface AdministrationCardProps {
  administration: {
    id: string
    name: string
    termStart: Date
    termEnd: Date | null
    status: string
    description: string | null
    mayor?: {
      fullName: string
    } | null
  }
  isHighlighted?: boolean
}

export function AdministrationCard({ administration, isHighlighted = false }: AdministrationCardProps) {
  const termPeriod = administration.termEnd
    ? `${format(new Date(administration.termStart), 'MMM yyyy')} - ${format(new Date(administration.termEnd), 'MMM yyyy')}`
    : `${format(new Date(administration.termStart), 'MMM yyyy')} - Present`

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    historical: 'bg-gray-100 text-gray-800',
    upcoming: 'bg-blue-100 text-blue-800',
  }

  const statusColor = statusColors[administration.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'

  return (
    <Link href={`/administrations/${administration.id}`}>
      <Card className={`flex flex-col hover:shadow-lg transition-shadow ${isHighlighted ? 'border-green-500 border-2' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-lg">{administration.name}</CardTitle>
            <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${statusColor}`}>
              {administration.status}
            </span>
          </div>
          <CardDescription>
            {termPeriod}
            {administration.mayor && (
              <>
                {' '}<br />
                Mayor: {administration.mayor.fullName}
              </>
            )}
          </CardDescription>
        </CardHeader>
        {administration.description && (
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">{administration.description}</p>
          </CardContent>
        )}
      </Card>
    </Link>
  )
}
