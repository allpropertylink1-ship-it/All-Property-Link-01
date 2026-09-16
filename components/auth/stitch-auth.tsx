import Link from "next/link";
import { ArrowRight, ShieldCheck } from "@/components/ui/icons";
import type { ComponentType } from "react";

type IconType = ComponentType<{ size?: number; className?: string }>;

/**
 * Shared Stitch-auth layout primitives.
 * PRESENTATION ONLY — no auth logic lives here. All auth behavior
 * (login/register/OTP/magic-link/forgot/reset/agent flows) is preserved
 * verbatim in the form components that consume these primitives.
 */

/** Labeled 16px filled input (Stitch: rounded-xl, pearl fill, focus lifts to surface). */
export const stitchInputClass =
  "mt-1 block w-full rounded-xl border border-border bg-surface-secondary px-4 py-3.5 text-text-primary placeholder:text-text-secondary focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30";

/** Same as above with room for a leading icon. */
export const stitchInputWithIconClass =
  "mt-1 block w-full rounded-xl border border-border bg-surface-secondary py-3.5 pl-11 pr-4 text-text-primary placeholder:text-text-secondary focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30";

/** Leading icon placed inside a relative input wrapper. */
export function InputLeadingIcon({ icon: Icon }: { icon: IconType }) {
  return (
    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
      <Icon size={18} />
    </span>
  );
}

/** Primary dark CTA (Stitch: dark primary pill, arrow affordance, 44px target). */
export function AuthSubmitButton({
  loading,
  label,
  loadingLabel,
}: {
  loading: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading}
      className="touch-target flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? loadingLabel : label}
      {!loading && <ArrowRight size={18} />}
    </button>
  );
}

/** "Or continue with" divider. */
export function AuthDivider({ label = "Or continue with" }: { label?: string }) {
  return (
    <div className="relative flex items-center py-1" aria-hidden="true">
      <div className="h-px flex-grow bg-border" />
      <span className="mx-3 flex-shrink text-xs font-semibold uppercase tracking-wider text-text-secondary">
        {label}
      </span>
      <div className="h-px flex-grow bg-border" />
    </div>
  );
}

/** Security assurance strip below the CTA. */
export function AuthAssurance({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg bg-surface-secondary px-3 py-2.5 text-center text-xs text-text-secondary">
      <ShieldCheck size={16} className="shrink-0 text-primary-400" />
      <span>{children}</span>
    </div>
  );
}

/** Accent icon badge used at the top of centered auth cards. */
export function AuthIconBadge({ icon: Icon }: { icon: IconType }) {
  return (
    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100 text-accent-600">
      <Icon size={22} />
    </span>
  );
}

interface CenteredAuthShellProps {
  icon: IconType;
  eyebrow?: string;
  title: string;
  subtitle: React.ReactNode;
  assurance?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}

/** Centered card layout for OTP / forgot / reset / activate / magic-link screens. */
export function CenteredAuthShell({
  icon,
  eyebrow,
  title,
  subtitle,
  assurance,
  backHref,
  backLabel,
  children,
}: CenteredAuthShellProps) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-surface-secondary px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="All Property Link home">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-heading text-sm font-bold text-white">
              APL
            </span>
            <span className="font-heading text-xl font-bold text-text-primary">
              All Property <span className="text-accent-600">Link</span>
            </span>
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6 shadow-lg sm:p-8">
          <div className="mb-6 text-center">
            <AuthIconBadge icon={icon} />
            {eyebrow && (
              <p className="mt-3 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                {eyebrow}
              </p>
            )}
            <h1 className="mt-1.5 font-heading text-2xl font-bold tracking-tight text-text-primary">
              {title}
            </h1>
            <div className="mt-1.5 text-sm leading-relaxed text-text-secondary">{subtitle}</div>
          </div>
          {children}
          {assurance && (
            <div className="mt-6">
              <AuthAssurance>{assurance}</AuthAssurance>
            </div>
          )}
          {backHref && backLabel && (
            <p className="mt-4 text-center text-sm text-text-secondary">
              <Link href={backHref} className="font-medium text-primary-600 hover:text-primary-700">
                {backLabel}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
