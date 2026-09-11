const API_BASE = ""

interface ApiResponse<T = unknown> {
  data?: T
  error?: string
}

class ApiClient {
  private baseUrl: string

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

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const method = options.method || "GET"
      const cacheControl = method === "GET" ? "max-age=30, stale-while-revalidate=120" : "no-store"
      const headers = {
        "Content-Type": "application/json",
        "Cache-Control": cacheControl,
        ...options.headers,
      }
      // Transient Passenger/Vercel-proxy blips (502/503/504, timeouts) are
      // retried with backoff: GETs are idempotent (2 retries); mutations get
      // a single retry (a duplicate login only leaves an extra refresh-token
      // row, pruned by the 3-session cap).
      const maxAttempts = method === "GET" ? 3 : 2
      let res: Response | null = null
      let attempt = 0
      for (;;) {
        attempt += 1
        try {
          res = await this.fetchOnce(path, { ...options, headers }, 30000)
          if (!this.isRetriableStatus(res.status) || attempt >= maxAttempts) break
        } catch (err) {
          if (attempt >= maxAttempts) throw err
        }
        await new Promise((r) => setTimeout(r, 300 * attempt))
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
            return { error: retryBody.error || "Request failed" }
          }
          const retryBody = await retryRes.json()
          return { data: retryBody as T }
        }
        return { error: body.error || "Session expired" }
      }

      if (!finalRes.ok) {
        const body = await finalRes.json().catch(() => ({}))
        return { error: body.error || `HTTP ${finalRes.status}` }
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
