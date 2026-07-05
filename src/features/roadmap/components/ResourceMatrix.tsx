import { Layers } from 'lucide-react'
import type { RoadmapMonthResource } from '@/lib/supabase/types'

interface ResourceMatrixProps {
  resources: RoadmapMonthResource[]
}

const ALL_RESOURCES = [
  'Science & Fun',
  'NCERT',
  'WINR',
  'Board PYQs',
  'JEE PYQs',
  'HC Verma',
  'Sample Papers',
  'Revision',
  'Mock Tests'
]

export function ResourceMatrix({ resources }: ResourceMatrixProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Active': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
      case 'Heavy Focus': return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
      case 'Revision': return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20'
      case 'Completed': return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
      case 'Inactive':
      default: return 'bg-muted/50 text-muted-foreground border-transparent opacity-60'
    }
  }

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
        <Layers className="h-5 w-5 text-primary" />
        <h2 className="font-semibold tracking-tight text-foreground">Resource Activation</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {ALL_RESOURCES.map(resName => {
          const dbResource = resources.find(r => r.resource_name === resName)
          const status = dbResource?.status || 'Inactive'
          
          return (
            <div key={resName} className={`flex flex-col p-3 rounded-lg border ${getStatusColor(status)}`}>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">{status}</span>
              <span className="font-medium">{resName}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
