import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-utils";
import { resolvePostAuthTarget } from "@/lib/persona";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  links: [
    { rel: "preload", as: "image", href: "/images/auth/signin-bg.jpg" },
    { rel: "preload", as: "image", href: "/images/auth/signup-bg.jpg" },
    { rel: "preload", as: "image", href: "/images/auth/reps-signin-bg.jpg" },
  ],
};

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ ref?: string; role?: string; return?: string; tab?: string }> }) {
  const { ref, return: returnParam, tab } = await searchParams;
  const session = await getSession();
  if (session?.user) {
    redirect(resolvePostAuthTarget(session.user, returnParam));
  }
  if (tab === "agent") {
    redirect(`/aplreps/sign-in${returnParam ? `?return=${encodeURIComponent(returnParam)}` : ""}`);
  }

  return (
    <AuthShell railView="register">
    <RegisterForm
      referralCode={ref}
      returnUrl={returnParam}
    />
    </AuthShell>
  );
}
