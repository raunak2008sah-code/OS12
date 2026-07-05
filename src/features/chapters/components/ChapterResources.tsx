import { BookOpen, CheckCircle2, Circle, PenTool } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ResourceProgress } from '@/lib/supabase/types'

interface ChapterResourcesProps {
  resources: { id: string; name: string }[]
  progress: (ResourceProgress & { resources: { name: string } | null })[]
  onToggle: (resourceId: string, status: string) => void
}

export function ChapterResources({ resources, progress, onToggle }: ChapterResourcesProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Resources
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {resources.map(res => {
            const currentProgress = progress.find(p => p.resource_id === res.id)
            const status = currentProgress?.status || 'pending'
            
            const nextStatus = status === 'pending' ? 'in_progress' : status === 'in_progress' ? 'completed' : 'pending'
            
            let badgeStyle = 'bg-muted/50 border-border text-muted-foreground'
            let Icon = Circle
            
            if (status === 'completed') {
              badgeStyle = 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400'
              Icon = CheckCircle2
            } else if (status === 'in_progress') {
              badgeStyle = 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
              Icon = PenTool
            }

            return (
              <button
                key={res.id}
                onClick={() => onToggle(res.id, nextStatus)}
                className={`flex items-center justify-between p-3 rounded-lg border text-left transition-colors hover:brightness-95 dark:hover:brightness-110 ${badgeStyle}`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{res.name}</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                  {status.replace('_', ' ')}
                </span>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
