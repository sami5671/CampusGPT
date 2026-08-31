'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  handleUserLogin, 
  handleAdminLogout, 
  handleRegister, 
  getCurrentUser 
} from '@/actions/auth-actions'

export type UserRole = 'student' | 'admin' | 'moderator'

export interface User {
  id: string
  email: string
  name: string
  fullName?: string
  role: UserRole
  primaryNumber?: string
  alternativeNumber?: string
  alternativeEmail?: string
  occupation?: string
  gender?: string
  DOB?: string
  address?: string
  providerId?: string
  avatar?: string
  studentId?: string
  idNumber?: string
  department?: string
  creditsCompleted?: string | number
  bloodGroup?: string
  currentSemester?: string
  creditsEnrolled?: string
  currentGPA?: string
  idCardFront?: string
  idCardBack?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (formData: FormData) => Promise<User>
  logout: () => Promise<void>
  updateUser: (updatedData: Partial<User>) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored session on mount and verify it with the server
    const syncSession = async () => {
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (e) {
          localStorage.removeItem('user')
        }
      }

      try {
        const res = await getCurrentUser()
        if (res.status && res.user) {
          const mappedUser: User = {
            ...res.user,
            name: res.user.fullName || res.user.name || '',
          }
          setUser(mappedUser)
          localStorage.setItem('user', JSON.stringify(mappedUser))
        } else {
          // If server session is invalid, clear client session
          setUser(null)
          localStorage.removeItem('user')
        }
      } catch (e) {
        // Fallback to local storage if API call fails (offline/network issue)
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser))
          } catch (e) {
            localStorage.removeItem('user')
          }
        }
      } finally {
        setIsLoading(false)
      }
    }
    syncSession()
  }, [])

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)

      const res = await handleUserLogin(formData)
      if (!res.status || !res.user) {
        throw new Error(res.error || 'Login failed. Please verify your credentials.')
      }

      const mappedUser: User = {
        ...res.user,
        name: res.user.fullName || res.user.name || '',
      }

      setUser(mappedUser)
      localStorage.setItem('user', JSON.stringify(mappedUser))
      return mappedUser
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (formData: FormData): Promise<User> => {
    setIsLoading(true)
    try {
      const res = await handleRegister(formData)
      if (!res.status || !res.user) {
        throw new Error(res.error || 'Registration failed.')
      }

      const mappedUser: User = {
        ...res.user,
        name: res.user.fullName || res.user.name || '',
      }

      setUser(mappedUser)
      localStorage.setItem('user', JSON.stringify(mappedUser))
      return mappedUser
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await handleAdminLogout()
      setUser(null)
      localStorage.removeItem('user')
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = (updatedData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null
      const newObj = { ...prev, ...updatedData }
      if (updatedData.fullName || updatedData.name) {
        newObj.name = updatedData.fullName || updatedData.name || prev.name
      }
      localStorage.setItem('user', JSON.stringify(newObj))
      return newObj
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
