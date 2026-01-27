import type { PostDetail as PostDetailType } from '@/lib/actions/discussions'
import { Badge } from '@/components/ui/badge'
import { VoteButton } from './vote-button'
import { CommentThread } from './comment-thread'
import { CommentForm } from './comment-form'
import { ProposalVotePanel } from './proposal-vote-panel'
import { MarkdownContent } from '@/components/custom-ui/markdown-content'

interface PostDetailProps {
  post: PostDetailType
  userId?: string
}

const postTypeBadge: Record<string, { label: string; className: string }> = {
  discussion: { label: 'Discussion', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  question: { label: 'Question', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  proposal: { label: 'Proposal', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  analysis: { label: 'Analysis', className: 'bg-green-100 text-green-800 border-green-200' },
}

export function PostDetail({ post, userId }: PostDetailProps) {
  const badge = postTypeBadge[post.postType] || postTypeBadge.discussion

  return (
    <div className="space-y-6">
      {/* Post header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge className={badge.className}>{badge.label}</Badge>
          {post.isPinned && (
            <span className="text-xs text-muted-foreground">Pinned</span>
          )}
        </div>
        <h1 className="text-xl font-semibold">{post.title}</h1>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{post.authorName || 'Anonymous'}</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Vote + body */}
      <div className="flex items-start gap-3">
        <VoteButton targetType="post" targetId={post.id} score={post.score} userId={userId} />
        <div className="flex-1 min-w-0">
          {post.body && <MarkdownContent content={post.body} />}
        </div>
      </div>

      {/* Proposal vote panel */}
      {post.postType === 'proposal' && post.proposalCounts && (
        <ProposalVotePanel postId={post.id} userId={userId} counts={post.proposalCounts} />
      )}

      {/* Comments section */}
      <div className="border-t border-border pt-6">
        <h3 className="text-sm font-medium mb-4">
          {post.commentCount} Comment{post.commentCount !== 1 ? 's' : ''}
        </h3>

        {userId && (
          <div className="mb-6">
            <CommentForm postId={post.id} authorId={userId} />
          </div>
        )}

        <CommentThread comments={post.comments} postId={post.id} userId={userId} />
      </div>
    </div>
  )
}
