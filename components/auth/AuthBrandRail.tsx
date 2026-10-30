"use client"

import Link from "next/link"
import Image from "next/image"
import { Handshake, ShieldCheck, ArrowRight } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

const railPoints = [
  {
    icon: Handshake,
    title: "Direct deals",
    body: "Verified owners & agents across Kenya.",
  },
  {
    icon: ShieldCheck,
    title: "ID-vetted fundis",
    body: "Trade pros checked before they reach you.",
  },
]

const railPointsRegister = [
  ...railPoints,
  {
    icon: ShieldCheck,
    title: "Save & get alerted",
    body: "Shortlists, saved searches & price-drop alerts on email or WhatsApp.",
  },
]

interface AuthBrandRailProps {
  view: "login" | "register" | "rep"
  backgroundImage: string
}

export function AuthBrandRail({ view, backgroundImage }: AuthBrandRailProps) {
  const isRegister = view === "register"
  const isRep = view === "rep"
  const points = isRegister ? railPointsRegister : railPoints

  return (
    <div
      className={cn(
        "relative w-full h-full min-h-[36dvh] lg:min-h-[600px] px-5 py-5 lg:px-6 lg:py-8",
        "rounded-xl bg-gradient-to-t from-primary-900/20 via-primary-900/35 to-primary-900/85 text-white",
      )}
    >
      {/* Background image fills the rounded rail; the outer surface clips it. */}
      <Image
        src={backgroundImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 z-0 object-cover"
        aria-hidden="true"
      />
      {/* Readability overlay over the image. */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-primary-900/20 via-primary-900/35 to-primary-900/85" aria-hidden="true" />

      <div className="relative flex flex-col justify-center h-full z-10">
        {!isRep && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-accent-200 ring-1 ring-white/15">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-400" aria-hidden="true" />
            {isRegister ? "Join APL" : "Welcome back"}
          </span>
        )}

        {/* Headline */}
        <h1 className="mt-3 font-heading text-2xl font-bold leading-snug tracking-tight text-white text-balance">
          {isRegister ? "Create your APL account." : isRep ? "APL Representative Sign In" : "Kenya's direct property & artisan network."}
        </h1>

        {/* Subtitle */}
        <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-white/75">
          {isRegister
            ? "One account for buying, renting, listing and hiring."
            : isRep
            ? "Sign in to your Representative Console."
            : "Sign in to your dashboard."}
        </p>

        {/* Assurance cards - only show for login/register, not rep */}
        {!isRep && (
          <div className="mt-5 w-full space-y-2">
            {points.map((point) => (
              <div
                key={point.title}
                className="flex items-center gap-2.5 rounded-lg bg-white/5 px-2.5 py-2 ring-1 ring-white/10"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-500/20 text-accent-200">
                  <point.icon size={16} />
                </span>
                <span className="text-left">
                  <span className="block text-[13px] font-semibold text-white">{point.title}</span>
                  <span className="block text-[11px] leading-snug text-white/65">{point.body}</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {!isRep && (
          <Link
            href={isRegister ? "/auth/login" : "/auth/register"}
            className={cn(
              "mt-5 inline-flex touch-target items-center justify-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-white/20"
            )}
          >
            {isRegister ? "Already have an account? Sign in" : "New here? Create an account"}
            {!isRegister && <ArrowRight size={14} className="text-accent-200" />}
          </Link>
        )}
      </div>
    </div>
  )
}
