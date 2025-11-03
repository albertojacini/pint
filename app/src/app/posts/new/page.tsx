import { requireUser } from '@/lib/auth'
import { NewPostForm } from '@/components/posts/new-post-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function NewPostPage() {
  await requireUser()

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
          <CardDescription>
            Share your thoughts on public policies and political projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewPostForm />
        </CardContent>
      </Card>
    </div>
  )
}
