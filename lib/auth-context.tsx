"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { api } from "./api-client"

export const CURRENT_TERMS_VERSION = "2026-09-17"

// Shown when login succeeds but the session cookies were rejected by the
// browser (third-party-cookie blocking). Retrying usually goes through the
// same-origin proxy and sticks; the message says so.
export const COOKIES_BLOCKED_ERROR =
  "Sign-in didn't stick — your browser blocked our login cookies. Please allow third-party cookies for this site (or open it in Chrome), then sign in again."

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
  requiresPasswordChange?: boolean
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
  login: (emailOrPhone: string, password: string, rememberMe?: boolean) => Promise<{ error?: string; code?: string; user?: User }>
  logout: () => Promise<void>
  phoneLogin: (phone: string) => Promise<{ error?: string; data?: { expiresIn: number; retryAfter: number } }>
  signup: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string; referralCode?: string; acceptedTerms: boolean; ageConfirmed: boolean; termsVersion?: string }) => Promise<{ error?: string; code?: string; otp?: OtpResponse }>
  sendOtp: (identifier: string, type: "EMAIL_VERIFICATION" | "PHONE_VERIFICATION") => Promise<{ error?: string; data?: { expiresIn: number; retryAfter: number } }>
  verifyOtp: (identifier: string, token: string, type: "EMAIL_VERIFICATION" | "PHONE_VERIFICATION", rememberMe?: boolean) => Promise<{ error?: string; code?: string; user?: User }>
  updateRegistration: (data: { oldIdentifier: string; email?: string; phone?: string; firstName?: string; lastName?: string }) => Promise<{ error?: string; otp?: OtpResponse }>
  refreshUser: () => Promise<User | null | undefined>
  clearSession: () => void
  sendMagicLink: (email: string) => Promise<{ error?: string }>
  agentLogin: (agentCode: string, password: string, rememberMe?: boolean) => Promise<{ error?: string; requiresPasswordChange?: boolean }>
  agentForgotPassword: (identifier: string) => Promise<{ error?: string }>
  agentResetPassword: (token: string, password: string) => Promise<{ error?: string }>
  firstPasswordChange: (newPassword: string) => Promise<{ error?: string }>
  changePassword: (newPassword: string, currentPassword?: string) => Promise<{ error?: string }>
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
  clearSession: () => {},
  sendMagicLink: async () => ({}),
  agentLogin: async () => ({}),
  agentForgotPassword: async () => ({}),
  agentResetPassword: async () => ({}),
  firstPasswordChange: async () => ({}),
  changePassword: async () => ({}),
  updateRegistration: async () => ({}),
  acceptConsent: async () => ({}),
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async (): Promise<User | null | undefined> => {
    // Tri-state session read (incident 2026-09-17 — redirect ping-pong):
    // - User object  = CONFIRMED session (server agrees).
    // - null         = DENIED (definitive 401/403/404, or 200 with no user).
    //                  Clears client state; caller stays on the form.
    // - undefined    = UNKNOWN (all attempts threw/timed out, or a
    //                  non-denied error status). Caller must NEVER navigate
    //                  on unknown — redirecting without server agreement is
    //                  what ping-ponged with requireAuth. Caller defers to
    //                  the server (whose verdicts always terminate).
    // UNKNOWN never touches client state: a transient blip must not sign
    // a healthy session out (nor keep a dead one alive for redirect).
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
      if (!res) return undefined
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
      return undefined
    } catch {
      // Unparseable body on an ok response: leave session untouched.
      return undefined
    } finally {
      setLoading(false)
    }
  }, [])

  const clearSession = useCallback(() => {
    setUser(null)
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = useCallback(async (emailOrPhone: string, password: string, rememberMe = true) => {
    const isPhone = /^(\+254|0?7\d{8})$/.test(emailOrPhone.replace(/\s/g, ""))
    const payload = isPhone
      ? { phone: emailOrPhone.replace(/\s/g, "").replace(/^0/, "+254"), password, rememberMe }
      : { email: emailOrPhone, password, rememberMe }
    const { data, error, code } = await api.post<{ user: User }>("/api/auth/login", payload)
    if (data?.user) {
      // Confirm the session cookies actually stuck before navigating.
      // Incident 2026-09-17 ("logged in then immediately logged out"): when
      // the login POST is served via the direct-origin fallback (proxy 502
      // during a backend slow spell), browsers that block third-party
      // cookies — Safari, Firefox-strict, WhatsApp/IG/TikTok in-app browsers
      // — reject the Set-Cookie and the session is dead on arrival. A
      // definitive DENIED here means exactly that: stop with an actionable
      // message instead of navigating into a phantom logout. UNKNOWN
      // (unreachable server) falls through to setUser + optimistic
      // navigation; the server remains the source of truth.
      const probe = await fetchUser()
      if (probe === null) {
        return { error: COOKIES_BLOCKED_ERROR, code: "COOKIES_BLOCKED" }
      }
      setUser({ ...(probe ?? data.user), authMethod: "user" })
      return { user: (probe ?? data.user) as User }
    }
    // Phase 2 (2026-09): surface machine-readable verdicts (e.g.
    // PASSWORD_RESET_REQUIRED) so the form can offer recovery.
    return { error: error || "Login failed", code }
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
    const { data, error, code } = await api.post<{ user: User }>("/api/auth/verify-otp", { identifier, token, type, rememberMe })
    if (error) return { error, code }
    if (data?.user) {
      // Same rule as login(): a definitive DENIED right after a successful
      // verify means the cookies didn't stick — actionable message, no
      // navigation. UNKNOWN navigates optimistically (server decides).
      const probe = await fetchUser()
      if (probe === null) {
        return { error: COOKIES_BLOCKED_ERROR, code: "COOKIES_BLOCKED" }
      }
      setUser({ ...(probe ?? data.user), authMethod: "user" })
      return { user: (probe ?? data.user) as User }
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

  // Phase 2 (2026-09): personal reset for flagged sessions (no current
  // password needed) and regular changes (current required). Clears the
  // mustChangePassword flag and revokes all sessions server-side.
  const changePassword = useCallback(async (newPassword: string, currentPassword?: string) => {
    const { error } = await api.post("/api/auth/change-password", { newPassword, currentPassword })
    if (error) return { error }
    await fetchUser()
    return {}
  }, [fetchUser])

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
    <AuthContext.Provider value={{ user, loading, login, logout, phoneLogin, signup, sendOtp, verifyOtp, refreshUser: fetchUser, clearSession, sendMagicLink, agentLogin, agentForgotPassword, agentResetPassword, firstPasswordChange, changePassword, updateRegistration, acceptConsent }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
