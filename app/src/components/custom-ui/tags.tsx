interface TagProps {
  name: string
  className?: string
}

export function Tag({ name, className = '' }: TagProps) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground ${className}`}
    >
      {name}
    </span>
  )
}

interface TagsProps {
  tags: Array<{ id: string; name: string }>
  maxTags?: number
  className?: string
}

export function Tags({ tags, maxTags = 3, className = '' }: TagsProps) {
  if (tags.length === 0) return null

  const displayedTags = tags.slice(0, maxTags)
  const extraTagsCount = Math.max(0, tags.length - maxTags)

  return (
    <div className={`flex gap-1.5 ${className}`}>
      {displayedTags.map((tag) => (
        <Tag key={tag.id} name={tag.name} />
      ))}
      {extraTagsCount > 0 && (
        <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
          +{extraTagsCount}
        </span>
      )}
    </div>
  )
}
