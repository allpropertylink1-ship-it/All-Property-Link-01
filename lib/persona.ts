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
  if (isCustomer(user)) return opts?.customerTo ?? "/dashboard/notifications"
  return null
}
