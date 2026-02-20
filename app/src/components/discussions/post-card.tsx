import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import type { PostSummary } from '@/lib/actions/discussions'
import { Badge } from '@/components/ui/badge'

interface PostCardProps {
  post: PostSummary
  basePath: string
}

export function PostCard({ post, basePath }: PostCardProps) {
  const t = useTranslations('discussions')

  const postTypeBadge: Record<string, { label: string; className: string }> = {
    discussion: { label: t('discussion'), className: 'bg-blue-100 text-blue-800 border-blue-200' },
    question: { label: t('question'), className: 'bg-purple-100 text-purple-800 border-purple-200' },
    proposal: { label: t('proposal'), className: 'bg-amber-100 text-amber-800 border-amber-200' },
    analysis: { label: t('analysisType'), className: 'bg-green-100 text-green-800 border-green-200' },
  }

  const badge = postTypeBadge[post.postType] || postTypeBadge.discussion

  return (
    <Link
      href={`${basePath}/${post.id}`}
      className="block border border-border/50 rounded-lg p-4 hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-start gap-3">
        {/* Score */}
        <div className="flex flex-col items-center text-muted-foreground min-w-[2rem]">
          <span className="text-xs">&#9650;</span>
          <span className="text-sm font-medium">{post.score}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={badge.className}>{badge.label}</Badge>
            {post.isPinned && (
              <span className="text-xs text-muted-foreground">{t('pinned')}</span>
            )}
          </div>
          <h3 className="font-medium text-sm leading-snug">{post.title}</h3>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span>{post.authorName || t('anonymous')}</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            <span>{t('comments', { count: post.commentCount })}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
