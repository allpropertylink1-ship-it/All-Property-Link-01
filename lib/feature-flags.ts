import { prisma } from "@/lib/prisma";

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  allowList: string[] | null;
}

/**
 * Server-side feature-flag lookup for server components and server actions.
 * Gated features MUST re-check here before acting — client-side gating is UI
 * only. Missing/unknown keys fail closed (feature off).
 */
export async function getFeatureFlags(): Promise<Map<string, FeatureFlag>> {
  const rows = await prisma.featureFlag.findMany();
  return new Map(
    rows.map((row) => [
      row.key,
      {
        key: row.key,
        enabled: row.enabled,
        allowList: (row.allowList as string[] | null) ?? null,
      },
    ])
  );
}

export function flagVisibleToUser(
  flag: FeatureFlag | undefined,
  email: string | null | undefined
): boolean {
  if (!flag) return false;
  if (!flag.enabled) return false;
  const allowList = flag.allowList ?? [];
  if (allowList.length === 0) return true;
  if (!email) return false;
  return allowList.includes(email.toLowerCase());
}

/** Convenience for server actions: pass the acting user's email. */
export async function isFeatureEnabled(
  key: string,
  email: string | null = null
): Promise<boolean> {
  const flags = await getFeatureFlags();
  return flagVisibleToUser(flags.get(key), email);
}
