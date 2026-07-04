import Link from "next/link";
import { getSession } from "@/lib/auth-utils";
import { MobileMenu } from "./MobileMenu";

export async function Navbar() {
  const session = await getSession();
  const user = session?.user as { name?: string; role?: string } | undefined;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link
          href="/"
          className="touch-target font-heading text-xl font-bold text-primary-600"
        >
          All Property Link
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/properties"
            className="touch-target hidden text-sm font-medium text-text-secondary hover:text-text-primary sm:inline-flex"
          >
            Browse
          </Link>
          <div className="hidden sm:flex sm:items-center sm:gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="touch-target inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-text-on-primary hover:bg-primary-700"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="touch-target inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-text-on-primary hover:bg-primary-700"
              >
                Sign in
              </Link>
            )}
          </div>
          <MobileMenu user={!!user} />
        </div>
      </div>
    </nav>
  );
}
