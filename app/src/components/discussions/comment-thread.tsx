'use client'

import { useState } from 'react'
import type { CommentNode } from '@/lib/actions/discussions'
import { VoteButton } from './vote-button'
import { CommentForm } from './comment-form'
import { Button } from '@/components/ui/button'

interface CommentThreadProps {
  comments: CommentNode[]
  postId: string
  userId?: string
  maxDepth?: number
}

export function CommentThread({ comments, postId, userId, maxDepth = 5 }: CommentThreadProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          userId={userId}
          maxDepth={maxDepth}
        />
      ))}
    </div>
  )
}

function CommentItem({
  comment,
  postId,
  userId,
  maxDepth,
}: {
  comment: CommentNode
  postId: string
  userId?: string
  maxDepth: number
}) {
  const [showReply, setShowReply] = useState(false)

  return (
    <div className={comment.depth > 0 ? 'ml-6 pl-4 border-l border-border/50' : ''}>
      <div className="flex items-start gap-2">
        <VoteButton targetType="comment" targetId={comment.id} score={comment.score} userId={userId} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{comment.authorName || 'Anonymous'}</span>
            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-sm mt-1 whitespace-pre-wrap">{comment.body}</p>
          {userId && comment.depth < maxDepth && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-1 text-xs text-muted-foreground"
              onClick={() => setShowReply(!showReply)}
            >
              Reply
            </Button>
          )}
          {showReply && userId && (
            <div className="mt-2">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                authorId={userId}
                onCancel={() => setShowReply(false)}
              />
            </div>
          )}
        </div>
      </div>
      {comment.children.length > 0 && (
        <div className="mt-3">
          <CommentThread
            comments={comment.children}
            postId={postId}
            userId={userId}
            maxDepth={maxDepth}
          />
        </div>
      )}
    </div>
  )
}
