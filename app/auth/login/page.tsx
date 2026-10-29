import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-utils";
import { resolvePostAuthTarget } from "@/lib/persona";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginPane } from "@/components/auth/LoginPane";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ ref?: string; return?: string }> }) {
  const { return: returnParam } = await searchParams;
  const session = await getSession();
  if (session?.user) {
    redirect(resolvePostAuthTarget(session.user, returnParam));
  }

  return (
    <AuthShell railView="login">
      <LoginPane returnUrl={returnParam} />
    </AuthShell>
  );
}
