import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-context"

export function useAgentPasswordGuard() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user || user.authMethod !== "agent") return
    if (user.mustChangePassword) {
      router.replace("/auth/agent-force-change-password")
    }
  }, [user, loading, router])

  return { loading }
}