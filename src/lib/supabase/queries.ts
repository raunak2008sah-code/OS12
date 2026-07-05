import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './client'
import type { 
  Subject, RoadmapPhase, RoadmapMonth, Chapter, Note, Comment, Profile, 
  RoadmapMonthWorkload, RoadmapMonthResource, Mistake, ChapterProgress, 
  MonthlyReview, Backlog, ResourceProgress, WeeklyReview, FormulaSheet,
  RoadmapWeek, Milestone, Revision
} from './types'

export const queryKeys = {
  subjects: ['subjects'] as const,
  subject: (id: string) => ['subject', id] as const,
  roadmapPhases: ['roadmapPhases'] as const,
  roadmapMonths: ['roadmapMonths'] as const,
  roadmapMilestones: ['roadmapMilestones'] as const,
  roadmapWeeks: (monthId: string) => ['roadmapWeeks', monthId] as const,
  roadmapMonthWorkload: (monthId: string) => ['roadmapMonthWorkload', monthId] as const,
  roadmapMonthResources: (monthId: string) => ['roadmapMonthResources', monthId] as const,
  chapters: (subjectId?: string) => ['chapters', subjectId] as const,
  chapter: (id: string) => ['chapter', id] as const,
  chapterProgress: (userId?: string, chapterId?: string) => ['chapterProgress', userId, chapterId] as const,
  resourceProgress: (userId?: string, chapterId?: string) => ['resourceProgress', userId, chapterId] as const,
  allResourceProgress: (userId?: string) => ['allResourceProgress', userId] as const,
  monthlyReview: (userId?: string, month?: string) => ['monthlyReview', userId, month] as const,
  notes: (chapterId: string, userId?: string) => ['notes', chapterId, userId] as const,
  mistakes: (chapterId?: string, userId?: string) => ['mistakes', chapterId, userId] as const,
  comments: (chapterId: string) => ['comments', chapterId] as const,
  friendProfile: (currentUserId?: string) => ['friendProfile', currentUserId] as const,
  allChapterProgress: (userId?: string) => ['allChapterProgress', userId] as const,
  backlog: (userId?: string) => ['backlog', userId] as const,
  latestWeeklyReview: (userId?: string) => ['latestWeeklyReview', userId] as const,
  formulaSheets: (userId?: string) => ['formulaSheets', userId] as const,
  allNotes: (userId?: string) => ['allNotes', userId] as const,
  allRevisions: (userId?: string) => ['allRevisions', userId] as const,
}

export function useSubjects() {
  return useQuery({
    queryKey: queryKeys.subjects,
    queryFn: async () => {
      const { data, error } = await supabase.from('subjects').select('*').order('name')
      if (error) throw error
      return data as Subject[]
    },
  })
}

export function useSubject(id: string) {
  return useQuery({
    queryKey: queryKeys.subject(id),
    queryFn: async () => {
      const { data, error } = await supabase.from('subjects').select('*').eq('id', id).single()
      if (error) throw error
      return data as Subject
    },
    enabled: !!id,
  })
}

export function useRoadmapPhases() {
  return useQuery({
    queryKey: queryKeys.roadmapPhases,
    queryFn: async () => {
      const { data, error } = await supabase.from('roadmap_phases').select('*').order('order_index')
      if (error) throw error
      return data as RoadmapPhase[]
    },
  })
}

export function useRoadmapMonths() {
  return useQuery({
    queryKey: queryKeys.roadmapMonths,
    queryFn: async () => {
      const { data, error } = await supabase.from('roadmap_months').select('*').order('order_index')
      if (error) throw error
      return data as RoadmapMonth[]
    },
  })
}

export function useRoadmapMonthWorkload(monthId?: string) {
  return useQuery({
    queryKey: monthId ? queryKeys.roadmapMonthWorkload(monthId) : ['roadmapMonthWorkload', 'skip'],
    queryFn: async () => {
      if (!monthId) return null
      const { data, error } = await supabase.from('roadmap_month_workloads').select('*').eq('month_id', monthId).maybeSingle()
      if (error) throw error
      return data as RoadmapMonthWorkload | null
    },
    enabled: !!monthId,
  })
}

export function useRoadmapMonthResources(monthId?: string) {
  return useQuery({
    queryKey: monthId ? queryKeys.roadmapMonthResources(monthId) : ['roadmapMonthResources', 'skip'],
    queryFn: async () => {
      if (!monthId) return []
      const { data, error } = await supabase.from('roadmap_month_resources').select('*').eq('month_id', monthId).order('order_index')
      if (error) throw error
      return (data || []).map((row: any) => ({
        ...row,
        name: row.resource_name
      })) as RoadmapMonthResource[]
    },
    enabled: !!monthId,
  })
}

export function useRoadmapWeeks(monthId?: string) {
  return useQuery({
    queryKey: monthId ? queryKeys.roadmapWeeks(monthId) : ['roadmapWeeks', 'skip'],
    queryFn: async () => {
      if (!monthId) return []
      const { data, error } = await supabase.from('roadmap_weeks').select('*').eq('month_id', monthId).order('week_number')
      if (error) throw error
      return data as RoadmapWeek[]
    },
    enabled: !!monthId,
  })
}

export function useMilestones() {
  return useQuery({
    queryKey: queryKeys.roadmapMilestones,
    queryFn: async () => {
      const { data, error } = await supabase.from('milestones').select('*').order('created_at')
      if (error) throw error
      return data as Milestone[]
    },
  })
}

export function useChapters(subjectId?: string) {
  return useQuery({
    queryKey: queryKeys.chapters(subjectId),
    queryFn: async () => {
      let query = supabase.from('chapters').select('*')
      if (subjectId) query = query.eq('subject_id', subjectId)
      const { data, error } = await query.order('order_index')
      if (error) throw error
      return data as Chapter[]
    },
  })
}

export function useChapter(id: string) {
  return useQuery({
    queryKey: queryKeys.chapter(id),
    queryFn: async () => {
      const { data, error } = await supabase.from('chapters').select('*').eq('id', id).single()
      if (error) throw error
      return data as Chapter
    },
    enabled: !!id,
  })
}

export function useChapterProgress(userId?: string, chapterId?: string) {
  return useQuery({
    queryKey: queryKeys.chapterProgress(userId, chapterId),
    queryFn: async () => {
      if (!userId || !chapterId) return null
      const { data, error } = await supabase.from('chapter_progress').select('*').eq('user_id', userId).eq('chapter_id', chapterId).maybeSingle()
      if (error) throw error
      return data as ChapterProgress | null
    },
    enabled: !!userId && !!chapterId,
  })
}

export function useAllChapterProgress(userId?: string) {
  return useQuery({
    queryKey: queryKeys.allChapterProgress(userId),
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase.from('chapter_progress').select('*').eq('user_id', userId)
      if (error) throw error
      return data as ChapterProgress[]
    },
    enabled: !!userId,
  })
}

export function useToggleChapterProgress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, chapterId, status }: { userId: string; chapterId: string; status: string }) => {
      const { error } = await supabase.from('chapter_progress').upsert({ user_id: userId, chapter_id: chapterId, status } as any, { onConflict: 'user_id,chapter_id' })
      if (error) throw error
    },
    onSuccess: (_, { userId, chapterId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.chapterProgress(userId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.chapterProgress(userId, chapterId) })
    },
  })
}

export function useNotes(chapterId: string, userId?: string) {
  return useQuery({
    queryKey: queryKeys.notes(chapterId, userId),
    queryFn: async () => {
      if (!userId) return null
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('chapter_id', chapterId)
        .eq('user_id', userId)
        .maybeSingle()
      if (error) throw error
      return data as Note | null
    },
    enabled: !!userId && !!chapterId,
  })
}

export function useSaveNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ chapterId, userId, content }: { chapterId: string; userId: string; content: string }) => {
      const { data, error } = await supabase
        .from('notes')
        .upsert({ chapter_id: chapterId, user_id: userId, content, updated_at: new Date().toISOString() } as any, { onConflict: 'chapter_id,user_id' })
        .select()
        .single()
      if (error) throw error
      return data as Note
    },
    onSuccess: (data, { chapterId, userId }) => {
      queryClient.setQueryData(queryKeys.notes(chapterId, userId), data)
    },
  })
}

export function useComments(chapterId: string) {
  return useQuery({
    queryKey: queryKeys.comments(chapterId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(id, display_name, avatar_url)')
        .eq('chapter_id', chapterId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Comment[]
    },
    enabled: !!chapterId,
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ chapterId, userId, content }: { chapterId: string; userId: string; content: string }) => {
      const { error } = await supabase.from('comments').insert({ chapter_id: chapterId, user_id: userId, content } as any)
      if (error) throw error
    },
    onSuccess: (_, { chapterId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments(chapterId) })
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ commentId, userId }: { commentId: string; userId: string }) => {
      const { error } = await supabase.from('comments').delete().match({ id: commentId, user_id: userId })
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments'] })
    },
  })
}

export function useMonthlyReview(userId?: string, month?: string) {
  return useQuery({
    queryKey: queryKeys.monthlyReview(userId, month),
    queryFn: async () => {
      if (!userId || !month) return null
      const { data, error } = await supabase
        .from('monthly_reviews')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)
        .maybeSingle()
      if (error) throw error
      return data as MonthlyReview | null
    },
    enabled: !!userId && !!month,
  })
}

export function useSaveMonthlyReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { userId: string; month: string; data: Partial<MonthlyReview> }) => {
      const { data, error } = await supabase
        .from('monthly_reviews')
        .upsert(
          {
            user_id: payload.userId,
            month: payload.month,
            ...payload.data,
          } as any,
          { onConflict: 'user_id,month' }
        )
        .select()
        .single()
      if (error) throw error
      return data as MonthlyReview
    },
    onSuccess: (data, { userId, month }) => {
      queryClient.setQueryData(queryKeys.monthlyReview(userId, month), data)
    },
  })
}

export function useMistakes(chapterId?: string, userId?: string) {
  return useQuery({
    queryKey: queryKeys.mistakes(chapterId, userId),
    queryFn: async () => {
      if (!userId) return []
      let query = supabase.from('mistakes').select('*').eq('user_id', userId)
      if (chapterId) {
        query = query.eq('chapter_id', chapterId)
      }
      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) throw error
      return data as Mistake[]
    },
    enabled: !!userId,
  })
}

export function useFriendProfile(currentUserId?: string) {
  return useQuery({
    queryKey: queryKeys.friendProfile(currentUserId),
    queryFn: async () => {
      if (!currentUserId) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUserId)
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data as Profile | null
    },
    enabled: !!currentUserId,
  })
}

export function useBacklog(userId?: string) {
  return useQuery({
    queryKey: queryKeys.backlog(userId),
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('backlog')
        .select('*')
        .eq('user_id', userId)
        .is('cleared_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Backlog[]
    },
    enabled: !!userId,
  })
}

export function useAllResourceProgress(userId?: string) {
  return useQuery({
    queryKey: queryKeys.allResourceProgress(userId),
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('resource_progress')
        .select('*, resources(name)')
        .eq('user_id', userId)
      if (error) throw error
      return data as (ResourceProgress & { resources: { name: string } | null })[]
    },
    enabled: !!userId,
  })
}

export function useLatestWeeklyReview(userId?: string) {
  return useQuery({
    queryKey: queryKeys.latestWeeklyReview(userId),
    queryFn: async () => {
      if (!userId) return null
      const { data, error } = await supabase
        .from('weekly_reviews')
        .select('*')
        .eq('user_id', userId)
        .order('week_date', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data as WeeklyReview | null
    },
    enabled: !!userId,
  })
}

export function useFormulaSheets(userId?: string) {
  return useQuery({
    queryKey: queryKeys.formulaSheets(userId),
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('formula_sheet')
        .select('*')
        .eq('user_id', userId)
      if (error) throw error
      return data as FormulaSheet[]
    },
    enabled: !!userId,
  })
}

export function useAllNotes(userId?: string) {
  return useQuery({
    queryKey: queryKeys.allNotes(userId),
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
      if (error) throw error
      return data as Note[]
    },
    enabled: !!userId,
  })
}

export function useAllRevisions(userId?: string) {
  return useQuery({
    queryKey: queryKeys.allRevisions(userId),
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('revision')
        .select('*')
        .eq('user_id', userId)
      if (error) throw error
      return data as Revision[]
    },
    enabled: !!userId,
  })
}

export function useRevisions(userId?: string, chapterId?: string) {
  return useQuery({
    queryKey: ['revisions', userId, chapterId],
    queryFn: async () => {
      if (!userId || !chapterId) return []
      const { data, error } = await supabase
        .from('revision')
        .select('*')
        .eq('user_id', userId)
        .eq('chapter_id', chapterId)
      if (error) throw error
      return data as Revision[]
    },
    enabled: !!userId && !!chapterId,
  })
}

export function useToggleRevision() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, chapterId, revisionDay, status }: { userId: string; chapterId: string; revisionDay: number; status: string }) => {
      const { error } = await supabase.from('revision').upsert({ 
        user_id: userId, 
        chapter_id: chapterId, 
        revision_day: revisionDay, 
        status, 
        completed_at: status === 'completed' ? new Date().toISOString() : null 
      } as any, { onConflict: 'user_id,chapter_id,revision_day' })
      if (error) throw error
    },
    onSuccess: (_, { userId, chapterId }) => {
      void queryClient.invalidateQueries({ queryKey: ['revisions', userId, chapterId] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.allRevisions(userId) })
    },
  })
}

export function useResourceProgress(userId?: string, chapterId?: string) {
  return useQuery({
    queryKey: queryKeys.resourceProgress(userId, chapterId),
    queryFn: async () => {
      if (!userId || !chapterId) return []
      const { data, error } = await supabase
        .from('resource_progress')
        .select('*, resources(*)')
        .eq('user_id', userId)
        .eq('chapter_id', chapterId)
      if (error) throw error
      return data as (ResourceProgress & { resources: { name: string, description: string | null, order_index: number } | null })[]
    },
    enabled: !!userId && !!chapterId,
  })
}

export function useToggleResourceProgress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, chapterId, resourceId, status }: { userId: string; chapterId: string; resourceId: string; status: string }) => {
      const { error } = await supabase.from('resource_progress').upsert({ 
        user_id: userId, 
        chapter_id: chapterId, 
        resource_id: resourceId, 
        status, 
        completed_at: status === 'completed' ? new Date().toISOString() : null 
      } as any, { onConflict: 'user_id,chapter_id,resource_id' })
      if (error) throw error
    },
    onSuccess: (_, { userId, chapterId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.resourceProgress(userId, chapterId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.allResourceProgress(userId) })
    },
  })
}

export function useResources() {
  return useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const { data, error } = await supabase.from('resources').select('*').order('order_index')
      if (error) throw error
      return data as { id: string, name: string, description: string | null, order_index: number }[]
    },
  })
}

export function useFormulaSheet(userId?: string, chapterId?: string) {
  return useQuery({
    queryKey: ['formulaSheet', userId, chapterId],
    queryFn: async () => {
      if (!userId || !chapterId) return null
      const { data, error } = await supabase
        .from('formula_sheet')
        .select('*')
        .eq('user_id', userId)
        .eq('chapter_id', chapterId)
        .maybeSingle()
      if (error) throw error
      return data as FormulaSheet | null
    },
    enabled: !!userId && !!chapterId,
  })
}

export function useSaveFormulaSheet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, chapterId, content }: { userId: string; chapterId: string; content: string }) => {
      const { data, error } = await supabase.from('formula_sheet').upsert({
        user_id: userId,
        chapter_id: chapterId,
        content,
        updated_at: new Date().toISOString()
      } as any, { onConflict: 'user_id,chapter_id' }).select().single()
      if (error) throw error
      return data as FormulaSheet
    },
    onSuccess: (data, { userId, chapterId }) => {
      queryClient.setQueryData(['formulaSheet', userId, chapterId], data)
      void queryClient.invalidateQueries({ queryKey: queryKeys.formulaSheets(userId) })
    },
  })
}

export function useAddMistake() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (mistake: { user_id: string; chapter_id: string; content: string; tags: string[] }) => {
      const { error } = await supabase.from('mistakes').insert(mistake as any)
      if (error) throw error
    },
    onSuccess: (_, { user_id, chapter_id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.mistakes(chapter_id, user_id) })
    },
  })
}

export function useToggleMistakeResolved() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ mistakeId, isResolved }: { mistakeId: string; isResolved: boolean; userId: string; chapterId: string }) => {
      // @ts-ignore
      const { error } = await supabase.from('mistakes').update({ is_resolved: isResolved }).eq('id', mistakeId)
      if (error) throw error
    },
    onSuccess: (_, { userId, chapterId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.mistakes(chapterId, userId) })
    },
  })
}