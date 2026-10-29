import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-utils";
import { resolvePostAuthTarget } from "@/lib/persona";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ ref?: string; role?: string; return?: string }> }) {
  const { ref, role, return: returnParam } = await searchParams;
  const session = await getSession();
  if (session?.user) {
    redirect(resolvePostAuthTarget(session.user, returnParam));
  }

  return (
    <AuthShell railView="register">
      <RegisterForm
        referralCode={ref}
        initialRole={role}
        returnUrl={returnParam}
      />
    </AuthShell>
  );
}
