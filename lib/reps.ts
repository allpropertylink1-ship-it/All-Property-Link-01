/**
 * Central exclusion list for the public APL Representatives directory (/aplreps).
 *
 * Gitonga Wathanga (APL-GIT-001-08/26) is the internal fallback rep for
 * unassigned/migrated users — his referral/lookup/claims links must keep
 * working, so the backend record stays ACTIVE. We only hide him from
 * public display: directory list, detail page (404), and sitemap.
 */

export const HIDDEN_REP_AGENT_CODES = ["APL-GIT-001-08/26"] as const;

export const HIDDEN_REP_NAMES = ["gitonga wathanga"] as const;

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
}

/** True when a rep must never appear in the public reps section. */
export function isHiddenRep(agent: {
  fullName?: string | null;
  agentCode?: string | null;
}): boolean {
  const code = (agent.agentCode || "").trim().toUpperCase();
  if (code && (HIDDEN_REP_AGENT_CODES as readonly string[]).includes(code)) return true;
  const name = agent.fullName ? normalizeName(agent.fullName) : "";
  if (name && (HIDDEN_REP_NAMES as readonly string[]).includes(name)) return true;
  return false;
}
