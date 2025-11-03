import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Edit, Eye } from 'lucide-react'

interface PostCardProps {
  post: {
    id: string
    title: string
    content: string
    status: string
    createdAt: Date
    author?: {
      fullName: string | null
      email: string
    } | null
  }
  isAuthor: boolean
}

export function PostCard({ post, isAuthor }: PostCardProps) {
  const excerpt = post.content.slice(0, 150) + (post.content.length > 150 ? '...' : '')

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="line-clamp-2">{post.title}</CardTitle>
          {post.status !== 'published' && (
            <span className="ml-2 rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
              {post.status}
            </span>
          )}
        </div>
        <CardDescription>
          {post.author?.fullName || post.author?.email || 'Unknown'} •{' '}
          {format(new Date(post.createdAt), 'PP')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground">{excerpt}</p>
        <div className="mt-4 flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/posts/${post.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          </Button>
          {isAuthor && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/posts/${post.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
