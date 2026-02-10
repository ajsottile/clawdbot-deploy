import { create } from 'zustand'

export interface User {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  createdAt: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setIsLoading: (isLoading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  
  setIsLoading: (isLoading) => set({ isLoading }),
  
  logout: () => set({ user: null, isAuthenticated: false }),
}))
