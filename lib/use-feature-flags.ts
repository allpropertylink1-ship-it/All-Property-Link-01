"use client"

import { useCallback, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { api } from "@/lib/api-client"

export interface PublicFlag {
  key: string
  enabled: boolean
  beta: boolean
  visible: boolean
}

/**
 * Client-side feature-flag hook. Refetches on route change and tab focus so
 * flipped flags reach already-open visitors within ~1 minute. `visible` is
 * computed server-side per visitor (beta allowlists never leave the server),
 * so this hook needs no knowledge of the current user.
 */
export function useFeatureFlags() {
  const [flags, setFlags] = useState<Record<string, PublicFlag>>({})
  const pathname = usePathname()

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const { data, error } = await api.get<{ data: PublicFlag[] }>("/api/feature-flags")
        if (error) return
        const next: Record<string, PublicFlag> = {}
        for (const flag of data?.data ?? []) next[flag.key] = flag
        if (!cancelled) setFlags(next)
      } catch {
        // keep last known flags; gates default to off
      }
    }
    void load()
    const onFocus = () => void load()
    window.addEventListener("focus", onFocus)
    return () => {
      cancelled = true
      window.removeEventListener("focus", onFocus)
    }
  }, [pathname])

  const isEnabled = useCallback((key: string) => flags[key]?.visible ?? false, [flags])
  const isBeta = useCallback((key: string) => flags[key]?.beta ?? false, [flags])

  return { flags, isEnabled, isBeta }
}
