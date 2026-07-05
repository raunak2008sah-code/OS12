import { useSubjects } from '@/lib/supabase/queries'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/StateBlocks'
import { Link } from 'react-router-dom'
import { Clock, Calendar } from 'lucide-react'

export default function SubjectListPage() {
  const { data: subjects, isLoading, error, refetch } = useSubjects()

  if (isLoading) return <LoadingState message="Loading subjects..." />
  
  if (error) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }

  if (!subjects?.length) {
    return <EmptyState title="No Subjects Found" description="There are no subjects configured in the curriculum." />
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Subjects</h1>
        <p className="text-muted-foreground mt-2">Manage your studies across different disciplines.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <div key={subject.id} className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/20">
            <div className="p-6">
              <h3 className="font-semibold text-xl tracking-tight mb-4 group-hover:text-primary transition-colors">{subject.name}</h3>
              
              <div className="space-y-2.5">
                {subject.batch_days && subject.batch_days.length > 0 && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4 text-primary/70" />
                    <span>{subject.batch_days.join(', ')}</span>
                  </div>
                )}
                {subject.batch_time && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4 text-primary/70" />
                    <span>{subject.batch_time}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-auto border-t border-border bg-muted/20 px-6 py-4 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {subject.is_batch_paced ? 'Batch Paced' : 'Self Paced'}
              </span>
              <Link to={`/subjects/${subject.id}`} className="text-sm font-medium text-primary hover:underline underline-offset-4 focus:outline-none">
                View chapters &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
