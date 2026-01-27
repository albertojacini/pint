import Link from 'next/link'
import type { PostSummary } from '@/lib/actions/discussions'
import { Badge } from '@/components/ui/badge'

interface PostCardProps {
  post: PostSummary
  basePath: string
}

const postTypeBadge: Record<string, { label: string; className: string }> = {
  discussion: { label: 'Discussion', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  question: { label: 'Question', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  proposal: { label: 'Proposal', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  analysis: { label: 'Analysis', className: 'bg-green-100 text-green-800 border-green-200' },
}

export function PostCard({ post, basePath }: PostCardProps) {
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
              <span className="text-xs text-muted-foreground">Pinned</span>
            )}
          </div>
          <h3 className="font-medium text-sm leading-snug">{post.title}</h3>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span>{post.authorName || 'Anonymous'}</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            <span>{post.commentCount} comment{post.commentCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
