import Link from "next/link"
import { CheckCircle, Plus, BadgeCheck } from "@/components/ui/icons"

const ASSURANCES = [
  "Direct phone & WhatsApp inquiries",
  "Instant listing publishing",
  "Kenya DPA 2019 compliant",
]

export function CTASection() {
  return (
    <section aria-labelledby="home-cta-heading" className="bg-surface">
      <div className="container mx-auto max-w-7xl px-4 pb-12 sm:pb-16">
        <div className="relative overflow-hidden rounded-xl bg-primary p-6 shadow-xl sm:p-10">
          {/* Ambient decorative shapes */}
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-accent-500/20" />
          <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="inline-flex items-center rounded-md bg-accent-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                Zero Intermediary Friction • Verified Deal Ecosystem
              </p>
              <h2 id="home-cta-heading" className="mt-3 font-heading text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Are You a Property Owner, Developer, or Certified Fundi?
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-white/75 sm:text-base">
                List your rental units, land plots, or technical trade services directly to thousands of
                active buyers and tenants across Kenya with absolute identity protection.
              </p>
              <ul className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
                {ASSURANCES.map((point) => (
                  <li key={point} className="flex items-center gap-1.5">
                    <CheckCircle size={18} className="shrink-0 text-accent-400" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col">
              <Link
                href="/dashboard/listings/new"
                className="inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-accent-600"
              >
                <Plus size={18} aria-hidden="true" />
                List a Property for Free
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-primary shadow-sm transition-colors hover:bg-primary-50"
              >
                <BadgeCheck size={18} aria-hidden="true" />
                Register as a Verified Fundi
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
