import {
  useEffect,
  useState,
  useCallback,
} from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { isAllowedEmail } from '@/lib/supabase/allowed-users'
import { AuthContext } from '@/lib/supabase/auth-context'

interface AuthState {
  session: Session | null
  user: User | null
  isAllowed: boolean
  isLoading: boolean
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    isAllowed: false,
    isLoading: true,
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null
      setState({
        session,
        user,
        isAllowed: user?.email ? isAllowedEmail(user.email) : false,
        isLoading: false,
      })
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      setState({
        session,
        user,
        isAllowed: user?.email ? isAllowedEmail(user.email) : false,
        isLoading: false,
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      if (!isAllowedEmail(email)) {
        return { error: 'Access restricted. This application is invite-only.' }
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    },
    []
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
