"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react"
import { useAuth } from "./auth-context"
import { api } from "./api-client"

/**
 * Favorites store — single source of truth for every heart on the site.
 *
 * Modes:
 *  - Members (`authMethod === "user"`, server-backed): favorites persisted via
 *    /api/favorites; guest saves are merged into the account on login.
 *  - Guests + agent sessions: localStorage only (`apl-favs`), no backend.
 *
 * `ref` = property SLUG (PROPERTY cards carry no id), service id, agent id.
 * Optimistic toggle with revert on server failure (Lane-D offline fast-fail).
 */

export type FavoriteType = "PROPERTY" | "SERVICE" | "AGENT"
export interface SavedItem {
  type: FavoriteType
  ref: string
}

const FAV_KEY = "apl-favs"
export const FAVORITE_TYPES: FavoriteType[] = ["PROPERTY", "SERVICE", "AGENT"]

export function favoriteCountPath(): string {
  return "/api/favorites"
}

function readLocal(): SavedItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(FAV_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x): x is SavedItem =>
        typeof x === "object" &&
        x !== null &&
        (x as SavedItem).type !== undefined &&
        FAVORITE_TYPES.includes((x as SavedItem).type) &&
        typeof (x as SavedItem).ref === "string",
    )
  } catch {
    return []
  }
}

function writeLocal(items: SavedItem[]): void {
  try {
    window.localStorage.setItem(FAV_KEY, JSON.stringify(items))
  } catch {
    // storage unavailable (private mode) — in-memory only
  }
}

function keyOf(i: SavedItem): string {
  return `${i.type}:${i.ref}`
}

const typeSegment: Record<FavoriteType, string> = {
  PROPERTY: "properties",
  SERVICE: "services",
  AGENT: "agents",
}

interface FavoritesContextValue {
  /** Server-backed member mode (vs guest/agent localStorage). */
  isMember: boolean
  /** Initial server list not yet loaded (member only). */
  loading: boolean
  /** Current saved items (ordered: newest first). */
  saved: SavedItem[]
  isSaved: (type: FavoriteType, ref: string) => boolean
  toggle: (type: FavoriteType, ref: string, label?: string) => Promise<{ error?: string }>
  counts: Record<FavoriteType, number>
  refresh: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextValue>({
  isMember: false,
  loading: false,
  saved: [],
  isSaved: () => false,
  toggle: async () => ({}),
  counts: { PROPERTY: 0, SERVICE: 0, AGENT: 0 },
  refresh: async () => {},
})

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const isMember = user?.authMethod === "user"

  const [saved, setSaved] = useState<SavedItem[]>(() => (typeof window === "undefined" ? [] : readLocal()))
  const [loading, setLoading] = useState(false)
  const prevMember = useRef<boolean | null>(null)

  const mergeIfNeeded = useCallback(async (): Promise<void> => {
    const locals = readLocal()
    if (locals.length === 0) return
    try {
      await api.post<{ favorites: unknown }>("/api/favorites/merge", {
        items: locals.map((i) => (i.type === "PROPERTY" ? { targetType: i.type, slug: i.ref } : { targetType: i.type, id: i.ref })),
      })
      writeLocal([])
    } catch {
      // merge failure is non-fatal; local list remains and is retried on next init
    }
  }, [])

  const refresh = useCallback(async (): Promise<void> => {
    if (!isMember) return
    setLoading(true)
    try {
      const { data } = await api.get<{ favorites: { targetType: FavoriteType; property?: { slug?: string } | null; service?: { id?: string } | null; agent?: { id?: string } | null }[] }>("/api/favorites")
      const mapped: SavedItem[] = (data?.favorites ?? [])
        .map<SavedItem>((f): SavedItem => {
          if (f.targetType === "PROPERTY") return { type: "PROPERTY", ref: f.property?.slug ?? "" }
          if (f.targetType === "SERVICE") return { type: "SERVICE", ref: f.service?.id ?? "" }
          return { type: "AGENT", ref: f.agent?.id ?? "" }
        })
        .filter((x): x is SavedItem => x.ref.length > 0)
      setSaved(mapped)
    } finally {
      setLoading(false)
    }
  }, [isMember])

  useEffect(() => {
    const wasMember = prevMember.current
    prevMember.current = isMember
    if (isMember && wasMember !== true) {
      ;(async () => {
        await mergeIfNeeded()
        await refresh()
      })()
    } else if (!isMember) {
      // Guest/agent: reset to the localStorage snapshot (in case a member
      // session ended and left the server list loaded).
      setSaved(readLocal())
    }
  }, [isMember, mergeIfNeeded, refresh])

  // Cross-tab sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== FAV_KEY) return
      if (isMember) {
        void refresh()
      } else {
        setSaved(readLocal())
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [isMember, refresh])

  const toggle = useCallback(
    async (type: FavoriteType, ref: string): Promise<{ error?: string }> => {
      const item: SavedItem = { type, ref }
      const key = keyOf(item)
      const isNowSaved = saved.some((s) => keyOf(s) === key)
      // Optimistic update.
      const next = isNowSaved ? saved.filter((s) => keyOf(s) !== key) : [item, ...saved]
      setSaved(next)

      const persistLocal = () => {
        if (!isMember) writeLocal(next)
      }

      if (!isMember) {
        persistLocal()
        // Broadcast to other tabs (same-tab listeners still use state).
        try {
          window.dispatchEvent(new StorageEvent("storage", { key: FAV_KEY, newValue: JSON.stringify(next) }))
        } catch { /* older browsers fine without */ }
        return {}
      }

      // Member: write through to the backend; revert on failure.
      const segment = typeSegment[type]
      const path = `/api/favorites/${segment}/${encodeURIComponent(ref)}`
      const method = isNowSaved ? api.delete : api.put
      const { error } = await method<{ ok: boolean }>(path)
      if (error) {
        setSaved(saved) // revert
        return { error }
      }
      return {}
    },
    [saved, isMember],
  )

  const value = useMemo<FavoritesContextValue>(() => {
    const counts: Record<FavoriteType, number> = { PROPERTY: 0, SERVICE: 0, AGENT: 0 }
    const set = new Set(saved.map(keyOf))
    for (const t of FAVORITE_TYPES) {
      counts[t] = saved.filter((s) => s.type === t).length
    }
    return {
      isMember,
      loading,
      saved,
      isSaved: (t, r) => set.has(keyOf({ type: t, ref: r })),
      toggle,
      counts,
      refresh,
    }
  }, [isMember, loading, saved, toggle, refresh])

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites(): FavoritesContextValue {
  return useContext(FavoritesContext)
}