import { format } from 'date-fns'

interface EntityMetadataProps {
  id: string
  createdAt: Date
  updatedAt: Date
}

export function EntityMetadata({ id, createdAt, updatedAt }: EntityMetadataProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Metadata</h2>
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Created:</span>{' '}
          <span className="font-medium">
            {format(new Date(createdAt), 'PPP')}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Last Updated:</span>{' '}
          <span className="font-medium">
            {format(new Date(updatedAt), 'PPP')}
          </span>
        </div>
        <div>
          <span className="text-gray-500">ID:</span>{' '}
          <span className="font-mono text-xs">{id}</span>
        </div>
      </div>
    </div>
  )
}
