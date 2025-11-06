import { getIdeas } from '@/lib/actions/ideas'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function IdeasPage() {
  const ideas = await getIdeas()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Policy Ideas</h1>
        <p className="text-muted-foreground">
          Explore abstract policy concepts and their evidence-based impacts
        </p>
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No ideas found. Run the seed script to populate data.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <Link key={idea.id} href={`/ideas/${idea.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-xl">{idea.title}</CardTitle>
                  </div>
                  {idea.categoryTitle && (
                    <Badge variant="secondary" className="w-fit">
                      {idea.categoryTitle}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 line-clamp-3">
                    {idea.description}
                  </CardDescription>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Effects</span>
                      <span className="font-semibold text-lg">{idea.effectsCount}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Implementations</span>
                      <span className="font-semibold text-lg">{idea.policiesCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
