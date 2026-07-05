export interface Profile {
  id: string
  email: string
  display_name: string
  avatar_url: string | null
  exam_targets: string[] | null
  theme: string
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

export interface RoadmapMilestone {
  id: string
  name: string
  description: string | null
  target_date: string
  status: 'upcoming' | 'completed' | 'missed'
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
  resource_name: string
  status: 'Inactive' | 'Active' | 'Heavy Focus' | 'Revision' | 'Completed'
  order_index: number
  created_at: string
}

export interface Progress {
  id: string
  user_id: string
  chapter_id: string
  step_key: string
  completed_at: string
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
  profiles?: Profile // Added for joining with author data
}

export interface MonthlyProgress {
  id: string
  user_id: string
  month: string
  went_well: string | null
  didnt_go_well: string | null
  one_change: string | null
  lessons_learned: string | null
  goals_next_month: string | null
  created_at: string
  updated_at: string | null
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      subjects: { Row: Subject; Insert: Partial<Subject>; Update: Partial<Subject> }
      chapters: { Row: Chapter; Insert: Partial<Chapter>; Update: Partial<Chapter> }
      roadmap_phases: { Row: RoadmapPhase; Insert: Partial<RoadmapPhase>; Update: Partial<RoadmapPhase> }
      roadmap_months: { Row: RoadmapMonth; Insert: Partial<RoadmapMonth>; Update: Partial<RoadmapMonth> }
      progress: { Row: Progress; Insert: Partial<Progress>; Update: Partial<Progress> }
      notes: { Row: Note; Insert: Partial<Note>; Update: Partial<Note> }
      comments: { Row: Comment; Insert: Partial<Comment>; Update: Partial<Comment> }
      monthly_progress: { Row: MonthlyProgress; Insert: Partial<MonthlyProgress>; Update: Partial<MonthlyProgress> }
      roadmap_milestones: { Row: RoadmapMilestone; Insert: Partial<RoadmapMilestone>; Update: Partial<RoadmapMilestone> }
      roadmap_month_workloads: { Row: RoadmapMonthWorkload; Insert: Partial<RoadmapMonthWorkload>; Update: Partial<RoadmapMonthWorkload> }
      roadmap_month_resources: { Row: RoadmapMonthResource; Insert: Partial<RoadmapMonthResource>; Update: Partial<RoadmapMonthResource> }
    }
  }
}
