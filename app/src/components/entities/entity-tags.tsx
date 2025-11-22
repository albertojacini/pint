interface Tag {
  id: string
  name: string
  slug: string | null
  color: string | null
  category: string | null
}

interface EntityTagsProps {
  tags: Tag[]
}

export function EntityTags({ tags }: EntityTagsProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {tags.map((tag) => (
        <span
          key={tag.id}
          className="px-2 py-0.5 rounded text-xs font-medium text-white"
          style={{ backgroundColor: tag.color || '#6b7280' }}
        >
          {tag.name}
        </span>
      ))}
    </div>
  )
}
