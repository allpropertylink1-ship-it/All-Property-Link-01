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
  aplAgentId?: string
  companyName?: string
  agentCode?: string
  fullName?: string
}

interface OtpResponse {
  otpSent: boolean
  otpDestination: string
  identifier: string
  type: "EMAIL_VERIFICATION" | "PHONE_VERIFICATION"
  expiresIn: number
  retryAfter: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  signup: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string; referralCode?: string }) => Promise<{ error?: string; otp?: OtpResponse }>
  sendOtp: (identifier: string, type: "EMAIL_VERIFICATION" | "PHONE_VERIFICATION") => Promise<{ error?: string; data?: { expiresIn: number; retryAfter: number } }>
  verifyOtp: (identifier: string, token: string, type: "EMAIL_VERIFICATION" | "PHONE_VERIFICATION") => Promise<{ error?: string }>
  refreshUser: () => Promise<void>
  sendMagicLink: (email: string) => Promise<{ error?: string }>
  agentLogin: (agentCode: string, password: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({}),
  logout: async () => {},
  signup: async () => ({}),
  sendOtp: async () => ({}),
  verifyOtp: async () => ({}),
  refreshUser: async () => {},
  sendMagicLink: async () => ({}),
  agentLogin: async () => ({}),
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        if (data?.user) setUser(data.user)
        else setUser(null)
      } else {
        setUser(null)
      }
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

  const signup = useCallback(async (data: { email: string; password: string; firstName: string; lastName: string; phone?: string; referralCode?: string }) => {
    const { data: result, error } = await api.post<OtpResponse>("/api/auth/register", data)
    if (error) return { error }
    return { otp: result }
  }, [])

  const sendOtp = useCallback(async (identifier: string, type: "EMAIL_VERIFICATION" | "PHONE_VERIFICATION") => {
    const { data, error } = await api.post<{ expiresIn: number; retryAfter: number }>("/api/auth/send-otp", { identifier, type })
    if (error) return { error }
    return { data }
  }, [])

  const verifyOtp = useCallback(async (identifier: string, token: string, type: "EMAIL_VERIFICATION" | "PHONE_VERIFICATION") => {
    const { data, error } = await api.post<{ user: User }>("/api/auth/verify-otp", { identifier, token, type })
    if (error) return { error }
    if (data?.user) setUser(data.user)
    return {}
  }, [])

  const sendMagicLink = useCallback(async (email: string) => {
    const { error } = await api.post("/api/auth/magic-link", { email })
    if (error) return { error }
    return {}
  }, [])

  const agentLogin = useCallback(async (agentCode: string, password: string) => {
    const { data, error } = await api.post<{ user: User }>("/api/auth/agent-login", { agentCode, password })
    if (data?.user) {
      setUser(data.user)
      return {}
    }
    return { error: error || "Login failed" }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, sendOtp, verifyOtp, refreshUser: fetchUser, sendMagicLink, agentLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
