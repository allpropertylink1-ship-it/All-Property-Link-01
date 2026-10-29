import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth-utils"
import { resolvePostAuthTarget } from "@/lib/persona"
import { AuthShell } from "@/components/auth/AuthShell"
import { AgentLoginForm } from "@/components/auth/AgentLoginForm"

export default async function AgentSignInPage({ searchParams }: { searchParams: Promise<{ return?: string; tab?: string }> }) {
  const { return: returnParam } = await searchParams
  const session = await getSession()
  if (session?.user) {
    redirect(resolvePostAuthTarget(session.user, returnParam))
  }

  return (
    <AuthShell railView="rep">
      <AgentLoginForm returnUrl={returnParam} />
    </AuthShell>
  )
}