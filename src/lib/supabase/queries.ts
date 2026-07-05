import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './client'
import type { Subject, RoadmapPhase, RoadmapMonth, Chapter, Progress, Note, Comment, MonthlyProgress, Profile, RoadmapMilestone, RoadmapMonthWorkload, RoadmapMonthResource, Mistake } from './types'

export const queryKeys = {
  subjects: ['subjects'] as const,
  subject: (id: string) => ['subject', id] as const,
  roadmapPhases: ['roadmapPhases'] as const,
  roadmapMonths: ['roadmapMonths'] as const,
  roadmapMilestones: ['roadmapMilestones'] as const,
  roadmapMonthWorkload: (monthId: string) => ['roadmapMonthWorkload', monthId] as const,
  roadmapMonthResources: (monthId: string) => ['roadmapMonthResources', monthId] as const,
  chapters: (subjectId?: string) => ['chapters', subjectId] as const,
  chapter: (id: string) => ['chapter', id] as const,
  progress: (userId?: string, chapterId?: string) => ['progress', userId, chapterId] as const,
  monthlyProgress: (userId?: string, month?: string) => ['monthlyProgress', userId, month] as const,
  notes: (chapterId: string, userId?: string) => ['notes', chapterId, userId] as const,
  mistakes: (chapterId?: string, userId?: string) => ['mistakes', chapterId, userId] as const,
  comments: (chapterId: string) => ['comments', chapterId] as const,
  friendProfile: (currentUserId?: string) => ['friendProfile', currentUserId] as const,
  allProgress: (userId?: string) => ['allProgress', userId] as const,
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

export function useMilestones() {
  return useQuery({
    queryKey: queryKeys.roadmapMilestones,
    queryFn: async () => {
      const { data, error } = await supabase.from('roadmap_milestones').select('*').order('target_date')
      if (error) throw error
      return data as RoadmapMilestone[]
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
      return data as RoadmapMonthResource[]
    },
    enabled: !!monthId,
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

export function useProgress(userId?: string, chapterId?: string) {
  return useQuery({
    queryKey: queryKeys.progress(userId, chapterId),
    queryFn: async () => {
      if (!userId) return []
      let query = supabase.from('progress').select('*').eq('user_id', userId)
      if (chapterId) query = query.eq('chapter_id', chapterId)
      const { data, error } = await query
      if (error) throw error
      return data as Progress[]
    },
    enabled: !!userId,
  })
}

export function useAllProgress(userId?: string) {
  return useQuery({
    queryKey: queryKeys.allProgress(userId),
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase.from('progress').select('*').eq('user_id', userId)
      if (error) throw error
      return data as Progress[]
    },
    enabled: !!userId,
  })
}

export function useToggleProgress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, chapterId, stepKey, isCompleted }: { userId: string; chapterId: string; stepKey: string; isCompleted: boolean }) => {
      if (isCompleted) {
        const { error } = await supabase.from('progress').insert({ user_id: userId, chapter_id: chapterId, step_key: stepKey } as any)
        if (error) throw error
      } else {
        const { error } = await supabase.from('progress').delete().match({ user_id: userId, chapter_id: chapterId, step_key: stepKey })
        if (error) throw error
      }
    },
    onSuccess: (_, { userId, chapterId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.progress(userId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.progress(userId, chapterId) })
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

export function useMonthlyProgress(userId?: string, month?: string) {
  return useQuery({
    queryKey: queryKeys.monthlyProgress(userId, month),
    queryFn: async () => {
      if (!userId || !month) return null
      const { data, error } = await supabase
        .from('monthly_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)
        .maybeSingle()
      if (error) throw error
      return data as MonthlyProgress | null
    },
    enabled: !!userId && !!month,
  })
}

export function useSaveMonthlyProgress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { userId: string; month: string; data: Partial<MonthlyProgress> }) => {
      const { data, error } = await supabase
        .from('monthly_progress')
        .upsert(
          {
            user_id: payload.userId,
            month: payload.month,
            ...payload.data,
            updated_at: new Date().toISOString()
          } as any,
          { onConflict: 'user_id,month' }
        )
        .select()
        .single()
      if (error) throw error
      return data as MonthlyProgress
    },
    onSuccess: (data, { userId, month }) => {
      queryClient.setQueryData(queryKeys.monthlyProgress(userId, month), data)
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
      // Get all profiles except current user
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

// Re-using useProgress for the friend is possible by just passing their ID.