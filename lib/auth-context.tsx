"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { api } from "./api-client"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  avatar?: string | null
  phone?: string
  kycStatus?: string
  accountStatus?: string
  isAgent?: boolean
  companyName?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  signup: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<{ error?: string; user?: User }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({}),
  logout: async () => {},
  signup: async () => ({}),
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const { data, error } = await api.get<{ user: User }>("/api/auth/me")
      if (data?.user) setUser(data.user)
      else setUser(null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await api.post<{ user: User }>("/api/auth/login", { email, password })
    if (data?.user) {
      setUser(data.user)
      return {}
    }
    return { error: error || "Login failed" }
  }, [])

  const logout = useCallback(async () => {
    await api.post("/api/auth/logout")
    setUser(null)
  }, [])

  const signup = useCallback(async (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => {
    const { data: result, error } = await api.post<{ user: User }>("/api/auth/register", data)
    if (result?.user) {
      setUser(result.user)
      return { user: result.user }
    }
    return { error: error || "Registration failed" }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
