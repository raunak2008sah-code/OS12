import { createContext } from 'react'

export type Theme = 'dark' | 'light' | 'system'

export interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeProviderState | null>(null)
