export interface Profile {
  id: string
  email: string
  display_name: string
  avatar_url: string | null
  exam_targets: string[] | null
  theme: string
  timezone?: string
  time_format?: string
  week_starts_on?: number
  accent_color?: string
  target_hours_per_day?: number
  created_at: string
  updated_at: string
}

export interface Subject {
  id: string
  slug: string
  name: string
  batch_days: string[] | null
  batch_time: string | null
  is_batch_paced: boolean
}

export interface Chapter {
  id: string
  subject_id: string
  name: string
  is_placeholder: boolean
  phase: string | null
  month: string | null
  order_index: number | null
  week_number: number | null
  difficulty: 'easy' | 'medium' | 'hard'
  priority: 'low' | 'medium' | 'high'
  estimated_hours: number
  jee_weight: 'none' | 'standard' | 'high'
  created_at: string
}

export interface RoadmapPhase {
  id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  order_index: number
  created_at: string
}

export interface RoadmapMonth {
  id: string
  phase_id: string
  name: string
  month_date: string
  focus_area: string | null
  order_index: number
  created_at: string
}

export interface RoadmapMonthWorkload {
  id: string
  month_id: string
  lecture_load: number
  practice_load: number
  revision_load: number
  testing_load: number
  created_at: string
}

export interface RoadmapMonthResource {
  id: string
  month_id: string
  name: string
  status: 'Inactive' | 'Active' | 'Heavy Focus' | 'Revision' | 'Completed'
  order_index: number
  created_at: string
}

export interface Note {
  id: string
  chapter_id: string
  user_id: string
  visibility: 'private' | 'shared'
  content: string | null
  updated_at: string
}

export interface Comment {
  id: string
  chapter_id: string
  user_id: string
  content: string | null
  created_at: string
  profiles?: Profile
}

export interface Mistake {
  id: string
  user_id: string
  chapter_id: string
  content: string
  tags: string[]
  is_resolved: boolean
  created_at: string
  updated_at: string
}

// OS10 NEW TABLES
export interface Resource {
  id: string
  name: string
  description: string | null
  order_index: number
}

export interface ChapterProgress {
  id: string
  user_id: string
  chapter_id: string
  status: string
  completed_at: string | null
}

export interface ResourceProgress {
  id: string
  user_id: string
  chapter_id: string
  resource_id: string
  status: string
  completed_at: string | null
}

export interface RoadmapWeek {
  id: string
  month_id: string
  week_number: number
  focus: string
  books_practice: string
  checkpoint: string
  created_at: string
}

export interface RoadmapTask {
  id: string
  week_id: string
  task_name: string
  is_completed: boolean
  created_at: string
}

export interface Milestone {
  id: string
  name: string
  condition: string
  target_date: string | null
  created_at: string
}

export interface FormulaSheet {
  id: string
  user_id: string
  chapter_id: string
  content: string
  last_reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface Revision {
  id: string
  user_id: string
  chapter_id: string
  revision_day: number
  status: string
  completed_at: string | null
}

export interface Backlog {
  id: string
  user_id: string
  chapter_id: string
  escalation_level: string
  cleared_at: string | null
  created_at: string
}

export interface MonthlyReview {
  id: string
  user_id: string
  month: string
  went_well: string
  didnt_go_well: string
  change_for_next_month: string
  created_at: string
}

export interface WeeklyReview {
  id: string
  user_id: string
  week_date: string
  planned_vs_done: string
  has_backlog: boolean
  energy_level: number
  adjustment_needed: string | null
  created_at: string
}

export interface CompareProfile {
  id: string
  user_id: string
  friend_id: string
  status: string
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      subjects: { Row: Subject; Insert: Partial<Subject>; Update: Partial<Subject> }
      chapters: { Row: Chapter; Insert: Partial<Chapter>; Update: Partial<Chapter> }
      roadmap_phases: { Row: RoadmapPhase; Insert: Partial<RoadmapPhase>; Update: Partial<RoadmapPhase> }
      roadmap_months: { Row: RoadmapMonth; Insert: Partial<RoadmapMonth>; Update: Partial<RoadmapMonth> }
      roadmap_month_workloads: { Row: RoadmapMonthWorkload; Insert: Partial<RoadmapMonthWorkload>; Update: Partial<RoadmapMonthWorkload> }
      roadmap_month_resources: { Row: RoadmapMonthResource; Insert: Partial<RoadmapMonthResource>; Update: Partial<RoadmapMonthResource> }
      notes: { Row: Note; Insert: Partial<Note>; Update: Partial<Note> }
      comments: { Row: Comment; Insert: Partial<Comment>; Update: Partial<Comment> }
      mistakes: { Row: Mistake; Insert: Partial<Mistake>; Update: Partial<Mistake> }
      
      resources: { Row: Resource; Insert: Partial<Resource>; Update: Partial<Resource> }
      chapter_progress: { Row: ChapterProgress; Insert: Partial<ChapterProgress>; Update: Partial<ChapterProgress> }
      resource_progress: { Row: ResourceProgress; Insert: Partial<ResourceProgress>; Update: Partial<ResourceProgress> }
      roadmap_weeks: { Row: RoadmapWeek; Insert: Partial<RoadmapWeek>; Update: Partial<RoadmapWeek> }
      roadmap_tasks: { Row: RoadmapTask; Insert: Partial<RoadmapTask>; Update: Partial<RoadmapTask> }
      milestones: { Row: Milestone; Insert: Partial<Milestone>; Update: Partial<Milestone> }
      formula_sheet: { Row: FormulaSheet; Insert: Partial<FormulaSheet>; Update: Partial<FormulaSheet> }
      revision: { Row: Revision; Insert: Partial<Revision>; Update: Partial<Revision> }
      backlog: { Row: Backlog; Insert: Partial<Backlog>; Update: Partial<Backlog> }
      monthly_reviews: { Row: MonthlyReview; Insert: Partial<MonthlyReview>; Update: Partial<MonthlyReview> }
      weekly_reviews: { Row: WeeklyReview; Insert: Partial<WeeklyReview>; Update: Partial<WeeklyReview> }
      compare_profiles: { Row: CompareProfile; Insert: Partial<CompareProfile>; Update: Partial<CompareProfile> }
    }
  }
}
