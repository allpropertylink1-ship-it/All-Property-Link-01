import { prisma } from "@/lib/prisma";

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  allowList: string[] | null;
}

const CACHE_TTL_MS = 30_000;

let cached: { at: number; data: Map<string, FeatureFlag> } | null = null;

/**
 * Server-side feature-flag lookup for server components and server actions.
 * Gated features MUST re-check here before acting — client-side gating is UI
 * only. Missing/unknown keys fail closed (feature off).
 *
 * Cached 30s (mirrors the backend store's TTL): flipping a flag in the admin
 * panel reaches new renders within ~30 seconds without a DB hit per request.
 */
export async function getFeatureFlags(): Promise<Map<string, FeatureFlag>> {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.data;
  const rows = await prisma.featureFlag.findMany();
  cached = {
    at: Date.now(),
    data: new Map(
      rows.map((row) => [
        row.key,
        {
          key: row.key,
          enabled: row.enabled,
          allowList: (row.allowList as string[] | null) ?? null,
        },
      ])
    ),
  };
  return cached.data;
}

export function flagVisibleToUser(
  flag: FeatureFlag | undefined,
  email: string | null | undefined
): boolean {
  if (!flag) return false;
  if (!flag.enabled) return false;
  // null / [] = everyone when enabled; anything else that is not an array is
  // corrupt data we cannot verify membership in — fail closed, never open.
  if (flag.allowList == null) return true;
  if (!Array.isArray(flag.allowList)) return false;
  if (flag.allowList.length === 0) return true;
  if (!email) return false;
  return flag.allowList.includes(email.toLowerCase());
}

/** Convenience for server actions: pass the acting user's email. */
export async function isFeatureEnabled(
  key: string,
  email: string | null = null
): Promise<boolean> {
  const flags = await getFeatureFlags();
  return flagVisibleToUser(flags.get(key), email);
}
