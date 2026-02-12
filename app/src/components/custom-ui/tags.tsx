interface TagProps {
  name: string
  className?: string
}

export function Tag({ name, className = '' }: TagProps) {
  return (
    <span
      className={`text-xs font-medium text-muted-foreground ${className}`}
    >
      <span className="text-foreground/30">#</span>{name.toLowerCase()}
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
    <div className={`flex gap-2 ${className}`}>
      {displayedTags.map((tag) => (
        <Tag key={tag.id} name={tag.name} />
      ))}
      {extraTagsCount > 0 && (
        <span className="text-xs font-medium text-muted-foreground/60">
          +{extraTagsCount}
        </span>
      )}
    </div>
  )
}
