"use client"

import { create } from "zustand"
import type { User } from "@/types"

interface AuthState {
  user: User | null
  accessToken: string | null
  tokenType: string | null
  expiresIn: number | null
  isAuthenticated: boolean
  isInitialized: boolean
  login: (authResponse: {
    accessToken: string
    tokenType: string
    expiresIn: number
    user: User
  }) => void
  updateTokens: (authResponse: {
    accessToken: string
    tokenType: string
    expiresIn: number
    user: User
  }) => void
  updateUser: (user: User) => void
  logout: () => void
  setInitialized: (state: boolean) => void
}

export const useAuth = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  tokenType: null,
  expiresIn: null,
  isAuthenticated: false,
  isInitialized: false,
  login: ({ accessToken, tokenType, expiresIn, user }) => 
    set({ 
      user, 
      accessToken, 
      tokenType, 
      expiresIn, 
      isAuthenticated: true 
    }),
  updateTokens: ({ accessToken, tokenType, expiresIn, user }) => 
    set({ 
      user, 
      accessToken, 
      tokenType, 
      expiresIn, 
      isAuthenticated: true 
    }),
  updateUser: (user) => set({ user }),
  logout: async () => {
    // Clear client-side state
    set({ 
      user: null, 
      accessToken: null, 
      tokenType: null, 
      expiresIn: null, 
      isAuthenticated: false 
    })
    
    // Clear any localStorage/sessionStorage if used
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
    }
  },
  setInitialized: (state) => set({ isInitialized: state }),
}))
