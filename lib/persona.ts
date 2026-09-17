export interface PersonaUser {
  authMethod?: string
  primaryUserType?: string | null
  userTypes?: string[]
}

/** APL Representatives are staff: authMethod "agent" (+ aplAgentId server-side). */
export function isRep(user: PersonaUser | null | undefined): boolean {
  return !!user && user.authMethod === "agent"
}

/** Customers browse, review and keep a personal profile only. */
export function isCustomer(user: PersonaUser | null | undefined): boolean {
  return !!user && user.authMethod !== "agent" && user.primaryUserType === "CUSTOMER"
}

/** May create own property listings: owners + intermediary agents. */
export function canListProperties(user: PersonaUser | null | undefined): boolean {
  const held = user?.userTypes ?? []
  return held.includes("PROPERTY_OWNER") || held.includes("AGENT")
}

/** May create service listings: fundis + service providers. */
export function canListServices(user: PersonaUser | null | undefined): boolean {
  const held = user?.userTypes ?? []
  return held.includes("FUNDI") || held.includes("SERVICE_PROVIDER")
}

/**
 * Where a persona that must never see a user-only page goes instead.
 * Returns null when the user may stay.
 */
export function personaRedirectTarget(
  user: PersonaUser | null | undefined,
  opts?: { customerTo?: string }
): string | null {
  if (isRep(user)) return "/dashboard/agent"
  if (isCustomer(user)) return opts?.customerTo ?? "/"
  return null
}

/**
 * Post-sign-in home per persona. Single source of truth for every login
 * form, OAuth/magic-link callback, consent/onboarding completion, and the
 * signed-in guard on /auth entry points.
 * - APL Rep (authMethod "agent") → /dashboard/agent
 * - Customer (primaryUserType CUSTOMER) → / (marketplace home)
 * - Everyone else (owners, intermediary agents, fundis, providers,
 *   typeless/new) → /dashboard (KYC/onboarding gates forward as needed)
 */
export function personaHomeTarget(user: PersonaUser | null | undefined): string {
  if (isRep(user)) return "/dashboard/agent"
  if (isCustomer(user)) return "/"
  return "/dashboard"
}

/**
 * Validate a ?return= deep link. Must be a same-origin path: starts with
 * a single "/" (reject "//" protocol-relative), and must not point back
 * into /auth* (would loop with the signed-in guard) or /api/*.
 */
export function isSafeReturnUrl(value: string | null | undefined): boolean {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return false
  if (value === "/auth" || value.startsWith("/auth/") || value.startsWith("/api/")) return false
  return true
}

/** Resolve final post-auth destination: safe return URL wins, else persona home. */
export function resolvePostAuthTarget(
  user: PersonaUser | null | undefined,
  returnUrl?: string | null
): string {
  if (isSafeReturnUrl(returnUrl)) return returnUrl as string
  return personaHomeTarget(user)
}
