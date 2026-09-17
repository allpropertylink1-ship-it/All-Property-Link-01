"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { api } from "./api-client"

export const CURRENT_TERMS_VERSION = "2026-09-17"

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
  referredByAgentCode?: string
  primaryUserType?: string | null
  companyName?: string
  agentCode?: string
  fullName?: string
  authMethod?: "user" | "agent"
  mustChangePassword?: boolean
  userTypes?: string[]
  acceptedTermsAt?: string | null
  termsVersion?: string | null
  ageConfirmed?: boolean
}

export interface OtpResponse {
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
  login: (emailOrPhone: string, password: string, rememberMe?: boolean) => Promise<{ error?: string; user?: User }>
  logout: () => Promise<void>
  phoneLogin: (phone: string) => Promise<{ error?: string; data?: { expiresIn: number; retryAfter: number } }>
  signup: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string; referralCode?: string; acceptedTerms: boolean; ageConfirmed: boolean; termsVersion?: string }) => Promise<{ error?: string; code?: string; otp?: OtpResponse }>
  sendOtp: (identifier: string, type: "EMAIL_VERIFICATION" | "PHONE_VERIFICATION") => Promise<{ error?: string; data?: { expiresIn: number; retryAfter: number } }>
  verifyOtp: (identifier: string, token: string, type: "EMAIL_VERIFICATION" | "PHONE_VERIFICATION", rememberMe?: boolean) => Promise<{ error?: string; user?: User }>
  updateRegistration: (data: { oldIdentifier: string; email?: string; phone?: string; firstName?: string; lastName?: string }) => Promise<{ error?: string; otp?: OtpResponse }>
  refreshUser: () => Promise<User | null>
  sendMagicLink: (email: string) => Promise<{ error?: string }>
  agentLogin: (agentCode: string, password: string, rememberMe?: boolean) => Promise<{ error?: string; requiresPasswordChange?: boolean }>
  agentForgotPassword: (identifier: string) => Promise<{ error?: string }>
  agentResetPassword: (token: string, password: string) => Promise<{ error?: string }>
  firstPasswordChange: (newPassword: string) => Promise<{ error?: string }>
  acceptConsent: () => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({}),
  logout: async () => {},
  phoneLogin: async () => ({}),
  signup: async () => ({}),
  sendOtp: async () => ({}),
  verifyOtp: async () => ({}),
  refreshUser: async () => null,
  sendMagicLink: async () => ({}),
  agentLogin: async () => ({}),
  agentForgotPassword: async () => ({}),
  agentResetPassword: async () => ({}),
  firstPasswordChange: async () => ({}),
  updateRegistration: async () => ({}),
  acceptConsent: async () => ({}),
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    // Retry idempotent session reads through transient origin 502/503/504s
    // and timeouts (shared-hosting blips). A retriable failure must NOT clear
    // a known session: only a definitive 401/403/404 (or a 200 with no user)
    // signs the user out. Returns the hydrated user (GET /me carries
    // primaryUserType/userTypes, which login/verify responses omit).
    let res: Response | null = null
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000)
        try {
          res = await fetch("/api/auth/me", { credentials: "include", signal: controller.signal })
        } finally {
          clearTimeout(timeoutId)
        }
        if (res.status !== 502 && res.status !== 503 && res.status !== 504) break
        res = null
      } catch {
        res = null
      }
      if (attempt < 3) await new Promise((r) => setTimeout(r, 300 * attempt))
    }
    try {
      if (!res) return null
      if (res.ok) {
        const data = await res.json()
        if (data?.user) {
          setUser(data.user)
          return data.user as User
        }
        setUser(null)
        return null
      } else if (res.status === 401 || res.status === 403 || res.status === 404) {
        setUser(null)
        return null
      }
      return null
    } catch {
      // Unparseable body on an ok response: leave session untouched.
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = useCallback(async (emailOrPhone: string, password: string, rememberMe = true) => {
    const isPhone = /^(\+254|0?7\d{8})$/.test(emailOrPhone.replace(/\s/g, ""))
    const payload = isPhone
      ? { phone: emailOrPhone.replace(/\s/g, "").replace(/^0/, "+254"), password, rememberMe }
      : { email: emailOrPhone, password, rememberMe }
    const { data, error } = await api.post<{ user: User }>("/api/auth/login", payload)
    if (data?.user) {
      // Login responses omit primaryUserType/userTypes; hydrate from /me so
      // callers can route by persona (customer → /) without a misclassify.
      // If hydration fails (slow proxy, blip), return undefined and let the
      // caller navigate optimistically — the server (retries, no 8s proxy
      // cap) is the source of truth and routes/corrects from there. Never
      // dead-end on a transient /me failure.
      const hydrated = await fetchUser()
      return { user: hydrated ?? undefined }
    }
    return { error: error || "Login failed" }
  }, [fetchUser])

  const logout = useCallback(async () => {
    await api.post("/api/auth/logout")
    setUser(null)
  }, [])

  const signup = useCallback(async (data: { email: string; password: string; firstName: string; lastName: string; phone?: string; referralCode?: string; acceptedTerms: boolean; ageConfirmed: boolean; termsVersion?: string }) => {
    const payload = { ...data, termsVersion: data.termsVersion || CURRENT_TERMS_VERSION }
    const { data: result, error } = await api.post<OtpResponse & { code?: string }>("/api/auth/register", payload)
    if (error) return { error, code: (result as unknown as { code?: string })?.code }
    return { otp: result }
  }, [])

  const sendOtp = useCallback(async (identifier: string, type: "EMAIL_VERIFICATION" | "PHONE_VERIFICATION") => {
    const { data, error } = await api.post<{ expiresIn: number; retryAfter: number }>("/api/auth/send-otp", { identifier, type })
    if (error) return { error }
    return { data }
  }, [])

  const verifyOtp = useCallback(async (identifier: string, token: string, type: "EMAIL_VERIFICATION" | "PHONE_VERIFICATION", rememberMe = true) => {
    const { data, error } = await api.post<{ user: User }>("/api/auth/verify-otp", { identifier, token, type, rememberMe })
    if (error) return { error }
    if (data?.user) {
      // Verify responses omit primaryUserType; hydrate from /me for persona
      // routing. Same graceful rule as login(): undefined on failure,
      // caller navigates optimistically, server corrects.
      const hydrated = await fetchUser()
      return { user: hydrated ?? undefined }
    }
    return {}
  }, [fetchUser])

  const phoneLogin = useCallback(async (phone: string) => {
    const { data, error } = await api.post<{ expiresIn: number; retryAfter: number }>("/api/auth/phone-login", { phone })
    if (error) return { error }
    return { data }
  }, [])

  const sendMagicLink = useCallback(async (email: string) => {
    const { error } = await api.post("/api/auth/magic-link", { email })
    if (error) return { error }
    return {}
  }, [])

  const agentLogin = useCallback(async (agentCode: string, password: string, rememberMe = true) => {
    const { data, error } = await api.post<{ user: User; requiresPasswordChange?: boolean }>("/api/auth/agent-login", { agentCode, password, rememberMe })
    if (data?.user) {
      setUser({ ...data.user, authMethod: "agent" })
      return { requiresPasswordChange: data.requiresPasswordChange }
    }
    return { error: error || "Login failed" }
  }, [])

  const agentForgotPassword = useCallback(async (identifier: string) => {
    const identifierKey = identifier.includes("@") ? "email" : "agentCode"
    const { error } = await api.post("/api/auth/agent-forgot-password", { [identifierKey]: identifier })
    if (error) return { error }
    return {}
  }, [])

  const agentResetPassword = useCallback(async (token: string, password: string) => {
    const { error } = await api.post("/api/auth/agent-reset-password", { token, password })
    if (error) return { error }
    return {}
  }, [])

  const firstPasswordChange = useCallback(async (newPassword: string) => {
    const { error } = await api.post("/api/referral-partner/first-password-change", { newPassword })
    if (error) return { error }
    return {}
  }, [])

  const updateRegistration = useCallback(async (data: { oldIdentifier: string; email?: string; phone?: string; firstName?: string; lastName?: string }) => {
    const { data: result, error } = await api.post<OtpResponse>("/api/auth/update-registration", data)
    if (error) return { error }
    return { otp: result }
  }, [])

  const acceptConsent = useCallback(async () => {
    const { error } = await api.post("/api/auth/consent", { acceptedTerms: true, ageConfirmed: true, termsVersion: CURRENT_TERMS_VERSION })
    if (error) return { error }
    await fetchUser()
    return {}
  }, [fetchUser])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, phoneLogin, signup, sendOtp, verifyOtp, refreshUser: fetchUser, sendMagicLink, agentLogin, agentForgotPassword, agentResetPassword, firstPasswordChange, updateRegistration, acceptConsent }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
