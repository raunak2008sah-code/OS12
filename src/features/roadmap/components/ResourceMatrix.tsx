import { LayoutGrid } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RoadmapMonthResource } from '@/lib/supabase/types'

interface ResourceMatrixProps {
  resources: RoadmapMonthResource[]
}

export function ResourceMatrix({ resources }: ResourceMatrixProps) {
  if (!resources || resources.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <LayoutGrid className="h-5 w-5 text-primary" />
          Resource Activation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {resources.map((resource) => {
            let variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" = "outline"
            let dotColor = "bg-muted-foreground"

            switch (resource.status) {
              case 'Active':
                variant = 'default'
                dotColor = 'bg-blue-500'
                break
              case 'Heavy Focus':
                variant = 'destructive'
                dotColor = 'bg-red-500'
                break
              case 'Revision':
                variant = 'warning'
                dotColor = 'bg-orange-500'
                break
              case 'Completed':
                variant = 'success'
                dotColor = 'bg-green-500'
                break
              case 'Inactive':
              default:
                variant = 'secondary'
                dotColor = 'bg-muted-foreground/30'
                break
            }

            return (
              <div key={resource.id} className="flex items-center justify-between text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                <span className={`font-medium ${resource.status === 'Inactive' ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {resource.resource_name}
                </span>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${dotColor}`} />
                  <span className={`inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-24 text-center ${
                    variant === 'default' ? 'border-transparent bg-primary text-primary-foreground' :
                    variant === 'destructive' ? 'border-transparent bg-destructive text-destructive-foreground' :
                    variant === 'warning' ? 'border-transparent bg-orange-500 text-white' :
                    variant === 'success' ? 'border-transparent bg-green-500 text-white' :
                    'text-foreground'
                  }`}>
                    {resource.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
