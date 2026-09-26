const API_BASE = ""
const API_BACKEND = (typeof process !== "undefined" && (process.env.NEXT_PUBLIC_API_URL as string | undefined)) || "https://api.allpropertylink.co.ke"

interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  // Phase 2 (2026-09): machine-readable server verdicts (e.g.
  // PASSWORD_RESET_REQUIRED). Propagated on every error path below.
  code?: string
}

class ApiClient {
  private baseUrl: string
  private refreshPromise: Promise<boolean> | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async fetchOnce(
    path: string,
    options: RequestInit,
    timeoutMs: number
  ): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    try {
      return await fetch(`${this.baseUrl}${path}`, {
        ...options,
        credentials: "include",
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private isRetriableStatus(status: number): boolean {
    return status === 502 || status === 503 || status === 504
  }

  private async directFetch<T>(path: string, options: RequestInit, headers: Record<string, string>): Promise<ApiResponse<T>> {
    try {
      const res = await this.fetchOnce(`${API_BACKEND}${path}`, { ...options, headers }, 30000)
      if (res.status === 401) {
        const body = await res.json().catch(() => ({}))
        return { error: body.error || "Session expired", code: body.code }
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        return { error: body.error || `HTTP ${res.status}`, code: body.code }
      }
      const body = await res.json()
      return { data: body as T }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return { error: "Request timed out" }
      return { error: err instanceof Error ? err.message : "Network error" }
    }
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const method = options.method || "GET"
      // Session reads must never be cached: a stale pre-consent /me bounces
      // users between /dashboard and /auth/consent after they accept Terms.
      const isSessionPath = path.startsWith("/api/auth") || path.startsWith("/api/user")
      const cacheControl = method === "GET" && !isSessionPath ? "max-age=30, stale-while-revalidate=120" : "no-store"
      const headers = {
        "Content-Type": "application/json",
        "Cache-Control": cacheControl,
        ...options.headers,
      } as Record<string, string>
      // Transient Passenger/Vercel-proxy blips (502/503/504, timeouts) are
      // retried with backoff: GETs are idempotent (2 retries); mutations get
      // a single retry (a duplicate login only leaves an extra refresh-token
      // row, pruned by the 3-session cap). After retries, fall back direct
      // to origin to bypass Vercel edge -> origin ROUTER_EXTERNAL_TARGET
      // failures (e.g. cpt1 edge blocked by host firewall).
      const maxAttempts = method === "GET" ? 3 : 2
      let res: Response | null = null
      let attempt = 0
      let lastError: unknown = null
      for (;;) {
        attempt += 1
        try {
          res = await this.fetchOnce(path, { ...options, headers, ...(isSessionPath ? { cache: "no-store" as RequestCache } : {}) }, 30000)
          if (!this.isRetriableStatus(res.status) || attempt >= maxAttempts) break
        } catch (err) {
          lastError = err
          if (attempt >= maxAttempts) break
        }
        await new Promise((r) => setTimeout(r, 300 * attempt))
      }
      // If proxy gave a retriable status or threw, try direct origin once
      const needsDirectFallback =
        (res && this.isRetriableStatus(res.status)) || (!res && lastError)
      if (needsDirectFallback) {
        // Direct fallback already handles its own 401/json parsing
        return this.directFetch<T>(path, options, headers)
      }
      const finalRes = res as Response

      if (finalRes.status === 401) {
        const body = await finalRes.json().catch(() => ({}))
        const refreshed = await this.refresh()
        if (refreshed) {
          const retryRes = await fetch(`${this.baseUrl}${path}`, {
            ...options,
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              ...options.headers,
            },
          })
          if (!retryRes.ok) {
            const retryBody = await retryRes.json().catch(() => ({}))
            return { error: retryBody.error || "Request failed", code: retryBody.code }
          }
          const retryBody = await retryRes.json()
          return { data: retryBody as T }
        }
        return { error: body.error || "Session expired", code: body.code }
      }

      if (!finalRes.ok) {
        const body = await finalRes.json().catch(() => ({}))
        return { error: body.error || `HTTP ${finalRes.status}`, code: body.code }
      }

      const body = await finalRes.json()
      return { data: body as T }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return { error: "Request timed out" }
      }
      return { error: err instanceof Error ? err.message : "Network error" }
    }
  }

  private async refresh(): Promise<boolean> {
    if (this.refreshPromise) return this.refreshPromise
    this.refreshPromise = this._refresh()
    try {
      return await this.refreshPromise
    } finally {
      this.refreshPromise = null
    }
  }

  private async _refresh(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      const res = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return res.ok
    } catch {
      return false
    }
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: "GET" })
  }

  async post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async patch<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: "DELETE" })
  }
}

export const api = new ApiClient(API_BASE)
