import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import type { PostSummary } from '@/lib/actions/discussions'
import { PostCard } from './post-card'
import { SortControls } from './sort-controls'
import { Button } from '@/components/ui/button'

interface PostListProps {
  posts: PostSummary[]
  basePath: string
}

export function PostList({ posts, basePath }: PostListProps) {
  const t = useTranslations('discussions')
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SortControls />
        <Link href={`${basePath}/new`}>
          <Button size="sm">{t('newPost')}</Button>
        </Link>
      </div>
      {posts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">{t('noDiscussionsYet')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} basePath={basePath} />
          ))}
        </div>
      )}
    </div>
  )
}
