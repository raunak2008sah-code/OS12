import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './client'
import type { 
  Subject, RoadmapPhase, RoadmapMonth, Chapter, Note, Profile, 
  RoadmapMonthWorkload, RoadmapMonthResource, ChapterProgress, 
  MonthlyReview, DailyCheckin, ResourceProgress, WeeklyReview,
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

  friendProfile: (currentUserId?: string) => ['friendProfile', currentUserId] as const,
  allChapterProgress: (userId?: string) => ['allChapterProgress', userId] as const,
  dailyCheckins: (userId?: string) => ['dailyCheckins', userId] as const,
  monthlyCheckins: (userId: string | undefined, year: number, month: number) => ['monthlyCheckins', userId, year, month] as const,
  latestWeeklyReview: (userId?: string) => ['latestWeeklyReview', userId] as const,

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
      const { error } = await supabase.from('chapter_progress').upsert({ 
        user_id: userId, 
        chapter_id: chapterId, 
        status,
        completed_at: new Date().toISOString()
      } as any, { onConflict: 'user_id,chapter_id' })
      if (error) throw error
    },
    onMutate: async ({ userId, chapterId, status }) => {
      // Cancel any in-flight queries that would overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.chapterProgress(userId, chapterId) })
      await queryClient.cancelQueries({ queryKey: queryKeys.allChapterProgress(userId) })

      // Snapshot previous values for rollback
      const previousProgress = queryClient.getQueryData(queryKeys.chapterProgress(userId, chapterId))
      const previousAllProgress = queryClient.getQueryData(queryKeys.allChapterProgress(userId))

      const now = new Date().toISOString()

      // Optimistically update the single-chapter cache
      queryClient.setQueryData(queryKeys.chapterProgress(userId, chapterId), (old: any) => ({
        ...old,
        user_id: userId,
        chapter_id: chapterId,
        status,
        completed_at: now
      }))

      // Optimistically update the allChapterProgress cache
      queryClient.setQueryData(queryKeys.allChapterProgress(userId), (old: any) => {
        if (!Array.isArray(old)) return old
        const exists = old.some((p: any) => p.chapter_id === chapterId)
        if (exists) {
          return old.map((p: any) => p.chapter_id === chapterId ? { ...p, status, completed_at: now } : p)
        }
        return [...old, { user_id: userId, chapter_id: chapterId, status, completed_at: now }]
      })

      return { previousProgress, previousAllProgress, userId, chapterId }
    },
    onError: (_err, _variables, context: any) => {
      if (context?.previousProgress !== undefined) {
        queryClient.setQueryData(queryKeys.chapterProgress(context.userId, context.chapterId), context.previousProgress)
      }
      if (context?.previousAllProgress !== undefined) {
        queryClient.setQueryData(queryKeys.allChapterProgress(context.userId), context.previousAllProgress)
      }
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.chapterProgress(variables.userId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.chapterProgress(variables.userId, variables.chapterId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.allChapterProgress(variables.userId) })
      // Invalidate friend caches
      void queryClient.invalidateQueries({ queryKey: ['friendProfile'] })
      void queryClient.invalidateQueries({ queryKey: ['allChapterProgress'] })
      void queryClient.invalidateQueries({ queryKey: ['allRevisions'] })
      void queryClient.invalidateQueries({ queryKey: ['allNotes'] })
      void queryClient.invalidateQueries({ queryKey: ['allResourceProgress'] })
      void queryClient.invalidateQueries({ queryKey: ['dailyCheckins'] })
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
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  })
}

export function useDailyCheckins(userId?: string) {
  return useQuery({
    queryKey: queryKeys.dailyCheckins(userId),
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
      if (error) throw error
      return data as DailyCheckin[]
    },
    enabled: !!userId,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  })
}

export function useMonthlyCheckins(userId: string | undefined, year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.monthlyCheckins(userId, year, month),
    queryFn: async () => {
      if (!userId) return []
      
      const startStr = `${year}-${String(month).padStart(2, '0')}-01`
      const endStr = `${year}-${String(month).padStart(2, '0')}-31`
      
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startStr)
        .lte('date', endStr)
        .order('date', { ascending: false })
        
      if (error) throw error
      return data as DailyCheckin[]
    },
    enabled: !!userId,
  })
}

export function useCreateDailyCheckin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, date }: { userId: string; date: string }) => {
      const { error } = await supabase.from('daily_checkins').insert({ user_id: userId, date } as any)
      if (error) throw error
    },
    onMutate: async ({ userId, date }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.dailyCheckins(userId) })
      const previous = queryClient.getQueryData(queryKeys.dailyCheckins(userId))
      
      queryClient.setQueryData(queryKeys.dailyCheckins(userId), (old: any) => {
        if (!Array.isArray(old)) return [{ user_id: userId, date, checked_at: new Date().toISOString() }]
        return [{ user_id: userId, date, checked_at: new Date().toISOString() }, ...old]
      })

      return { previous, userId }
    },
    onError: (_err, _newVal, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.dailyCheckins(context.userId), context.previous)
      }
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.dailyCheckins(variables.userId) })
      
      // Also invalidate the corresponding monthly check-in cache for the calendar
      const year = parseInt(variables.date.split('-')[0], 10)
      const month = parseInt(variables.date.split('-')[1], 10)
      void queryClient.invalidateQueries({ queryKey: queryKeys.monthlyCheckins(variables.userId, year, month) })
      // Invalidate friend caches that depend on check‑ins
      void queryClient.invalidateQueries({ queryKey: ['friendProfile'] })
      void queryClient.invalidateQueries({ queryKey: ['dailyCheckins'] })
    },
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
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
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
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
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
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
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
    onMutate: async ({ userId, chapterId, revisionDay, status }) => {
      await queryClient.cancelQueries({ queryKey: ['revisions', userId, chapterId] })
      const previousRevisions = queryClient.getQueryData(['revisions', userId, chapterId])
      queryClient.setQueryData(['revisions', userId, chapterId], (old: any) => {
        if (!old) return old
        return old.map((r: any) => r.revision_day === revisionDay ? { ...r, status } : r)
      })
      return { previousRevisions, userId, chapterId }
    },
    onError: (_err, _variables, context: any) => {
      if (context?.previousRevisions) {
        queryClient.setQueryData(['revisions', context.userId, context.chapterId], context.previousRevisions)
      }
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['revisions', variables.userId] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.allRevisions(variables.userId) })
      // Invalidate friend caches
      void queryClient.invalidateQueries({ queryKey: ['friendProfile'] })
      void queryClient.invalidateQueries({ queryKey: ['allRevisions'] })
      void queryClient.invalidateQueries({ queryKey: ['allNotes'] })
      void queryClient.invalidateQueries({ queryKey: ['allResourceProgress'] })
      void queryClient.invalidateQueries({ queryKey: ['dailyCheckins'] })
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
    onMutate: async ({ userId, chapterId, resourceId, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.resourceProgress(userId, chapterId) })
      const previousProgress = queryClient.getQueryData(queryKeys.resourceProgress(userId, chapterId))
      queryClient.setQueryData(queryKeys.resourceProgress(userId, chapterId), (old: any) => {
        if (!old) return old
        return old.map((p: any) => p.resource_id === resourceId ? { ...p, status } : p)
      })
      return { previousProgress, userId, chapterId }
    },
    onError: (_err, _variables, context: any) => {
      if (context?.previousProgress) {
        queryClient.setQueryData(queryKeys.resourceProgress(context.userId, context.chapterId), context.previousProgress)
      }
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.resourceProgress(variables.userId, variables.chapterId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.allResourceProgress(variables.userId) })
      // Invalidate friend caches
      void queryClient.invalidateQueries({ queryKey: ['friendProfile'] })
      void queryClient.invalidateQueries({ queryKey: ['allRevisions'] })
      void queryClient.invalidateQueries({ queryKey: ['allNotes'] })
      void queryClient.invalidateQueries({ queryKey: ['allResourceProgress'] })
      void queryClient.invalidateQueries({ queryKey: ['dailyCheckins'] })
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
