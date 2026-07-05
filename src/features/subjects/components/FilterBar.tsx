import { Search, Filter, SlidersHorizontal } from 'lucide-react'

interface FilterOption {
  label: string
  value: string
}

interface FilterBarProps {
  searchQuery: string
  onSearchChange: (val: string) => void
  selectedPhase: string
  onPhaseChange: (val: string) => void
  phases: FilterOption[]
  selectedStatus: string
  onStatusChange: (val: string) => void
  statuses: FilterOption[]
  selectedDifficulty?: string
  onDifficultyChange?: (val: string) => void
  difficulties?: FilterOption[]
}

export function FilterBar({
  searchQuery, onSearchChange,
  selectedPhase, onPhaseChange, phases,
  selectedStatus, onStatusChange, statuses,
  selectedDifficulty, onDifficultyChange, difficulties
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-card border border-border p-3 rounded-xl shadow-sm">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter by name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-muted/50 border-transparent rounded-lg pl-9 pr-4 py-2 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
        <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/50 rounded-lg text-sm shrink-0">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select 
            value={selectedPhase} 
            onChange={(e) => onPhaseChange(e.target.value)}
            className="bg-transparent border-none p-0 focus:ring-0 text-sm font-medium outline-none cursor-pointer"
          >
            <option value="all">All Phases</option>
            {phases.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/50 rounded-lg text-sm shrink-0">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <select 
            value={selectedStatus} 
            onChange={(e) => onStatusChange(e.target.value)}
            className="bg-transparent border-none p-0 focus:ring-0 text-sm font-medium outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {difficulties && onDifficultyChange && (
          <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/50 rounded-lg text-sm shrink-0">
            <select 
              value={selectedDifficulty} 
              onChange={(e) => onDifficultyChange(e.target.value)}
              className="bg-transparent border-none p-0 focus:ring-0 text-sm font-medium outline-none cursor-pointer"
            >
              <option value="all">Any Difficulty</option>
              {difficulties.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
