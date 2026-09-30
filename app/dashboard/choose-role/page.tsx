"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Search,
  Shield,
  Check,
  Loader2,
  ArrowRight,
  ArrowLeft,
  UserCheck,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { personaHomeTarget } from "@/lib/persona";
import { FormBanner } from "@/components/shared/FormFeedback";
import { PersonaGate } from "@/components/dashboard/PersonaGate";
import SectorSpecialtyPicker from "@/components/dashboard/SectorSpecialtyPicker";
import { isOtherSpecialty } from "@/lib/service-taxonomy";

type Step = "choose" | "advertiser" | "customer-confirm" | "countdown";
type AdvertiserType = "PROPERTY_OWNER" | "AGENT" | "FUNDI" | "SERVICE_PROVIDER";

const ADVERTISER_OPTIONS: { value: AdvertiserType; label: string; hint: string }[] = [
  { value: "PROPERTY_OWNER", label: "Property Owner", hint: "List your own property for sale or rent" },
  { value: "AGENT", label: "Agent", hint: "List property on behalf of owners" },
  { value: "FUNDI", label: "Fundi", hint: "Offer trade services — plumbing, electrical, carpentry" },
  { value: "SERVICE_PROVIDER", label: "Service Provider", hint: "Offer cleaning, security, management & more" },
];

const COUNTDOWN_SECONDS = 8;

function ChooseRoleInner() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();
  const [step, setStep] = useState<Step>("choose");
  const [advertiserType, setAdvertiserType] = useState<AdvertiserType>("PROPERTY_OWNER");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [kycTarget] = useState("/dashboard/kyc");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isTypeless =
    !user?.primaryUserType && (!user?.userTypes || user.userTypes.length === 0);

  // Already-roled accounts never see the chooser: advertisers go to KYC (or
  // their dashboard), customers are bounced home by PersonaGate already, but
  // double-guard here for direct navigation.
  useEffect(() => {
    if (loading || !user) return;
    if (user.primaryUserType === "CUSTOMER") {
      router.replace("/");
      return;
    }
    if (!isTypeless) {
      if (user.kycStatus === "VERIFIED") router.replace("/dashboard");
      else router.replace("/dashboard/kyc");
    }
  }, [loading, user, isTypeless, router]);

  // 8-second auto-redirect once the advertiser intent is saved.
  useEffect(() => {
    if (step !== "countdown") return;
    setCountdown(COUNTDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          router.push(kycTarget);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, router, kycTarget]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center" role="status">
        <Loader2 size={24} className="mx-auto animate-spin text-primary-600" />
        <p className="mt-3 text-sm text-text-secondary">Loading your account…</p>
      </div>
    );
  }
  if (!isTypeless) return null;

  const needsSpecialties =
    advertiserType === "FUNDI" || advertiserType === "SERVICE_PROVIDER";
  const realSpecialtyCount = specialties.filter((s) => !isOtherSpecialty(s)).length;

  async function submitRole(category: string, specs: string[]) {
    setSubmitting(true);
    setError("");
    const { error: apiError } = await api.post("/api/user/choose-role", {
      category,
      ...(specs.length > 0 ? { specialties: specs } : {}),
    });
    if (apiError) {
      setError(apiError);
      setSubmitting(false);
      return false;
    }
    await refreshUser().catch(() => null);
    setSubmitting(false);
    return true;
  }

  async function handleCustomerConfirm() {
    const ok = await submitRole("CUSTOMER", []);
    if (!ok) return;
    router.push(personaHomeTarget({ primaryUserType: "CUSTOMER" }));
  }

  async function handleAdvertiserContinue() {
    if (needsSpecialties && realSpecialtyCount === 0) {
      setError("Please select at least one specialty for your category");
      return;
    }
    const ok = await submitRole(advertiserType, needsSpecialties ? specialties : []);
    if (!ok) return;
    setStep("countdown");
  }

  function cancelCountdown() {
    if (timerRef.current) clearInterval(timerRef.current);
    setStep("advertiser");
  }

  // ---- Countdown interstitial (advertiser saved → KYC) ----
  if (step === "countdown") {
    const label =
      ADVERTISER_OPTIONS.find((o) => o.value === advertiserType)?.label ?? advertiserType;
    const pct = Math.round(((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * 100);
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success-500/10">
          <Check size={32} className="text-success-600" />
        </div>
        <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
          You&apos;re set up as {label}
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">
          Next: verify your identity
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Advertisers complete a quick KYC check before listing. You&apos;ll be
          redirected to verification in{" "}
          <strong className="text-text-primary" aria-live="polite">{countdown} second{countdown === 1 ? "" : "s"}</strong>.
        </p>
        <div
          className="mt-6 h-2 overflow-hidden rounded-full bg-surface-secondary"
          role="progressbar"
          aria-valuenow={COUNTDOWN_SECONDS - countdown}
          aria-valuemin={0}
          aria-valuemax={COUNTDOWN_SECONDS}
          aria-label="Redirecting to KYC verification"
        >
          <div
            className="h-full rounded-full bg-primary-600 transition-all duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => router.push(kycTarget)}
            className="touch-target inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            Go to KYC now <ArrowRight size={16} />
          </button>
          <button
            type="button"
            onClick={cancelCountdown}
            className="touch-target inline-flex min-h-[44px] items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // ---- Customer lock-in confirmation ----
  if (step === "customer-confirm") {
    return (
      <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
        <button
          type="button"
          onClick={() => { setStep("choose"); setError(""); }}
          className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <section aria-labelledby="customer-confirm-heading" className="rounded-xl border border-border bg-surface p-5 text-center sm:p-6">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <UserCheck size={22} />
          </span>
          <h1 id="customer-confirm-heading" className="mt-3 font-heading text-xl font-bold tracking-tight text-text-primary">
            Lock in a Customer account?
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Customers can rent, buy, browse listings, save favourites and leave
            reviews — <strong>no verification needed</strong>. This{" "}
            <strong>permanently locks</strong> your account: you&apos;ll never see
            KYC, Business profile or the advertiser dashboard.
          </p>
        </section>
        {error && <FormBanner variant="error">{error}</FormBanner>}
        <button
          type="button"
          onClick={handleCustomerConfirm}
          disabled={submitting}
          aria-busy={submitting}
          className="touch-target flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          {submitting ? "Locking in…" : "Yes — continue as Customer"}
        </button>
      </div>
    );
  }

  // ---- Advertiser sub-type picker ----
  if (step === "advertiser") {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <button
          type="button"
          onClick={() => { setStep("choose"); setError(""); setSpecialties([]); }}
          className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <section aria-labelledby="advertiser-heading" className="rounded-xl border border-border bg-surface p-5 text-center sm:p-6">
          <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
            Advertise a property or service
          </p>
          <h1 id="advertiser-heading" className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">
            What will you advertise?
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Pick the closest fit. You&apos;ll verify your identity (KYC) next, then
            complete your business profile.
          </p>
        </section>

        {error && <FormBanner variant="error">{error}</FormBanner>}

        <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Advertiser type">
          {ADVERTISER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={advertiserType === opt.value}
              onClick={() => { setAdvertiserType(opt.value); setSpecialties([]); setError(""); }}
              className={cn(
                "touch-target rounded-xl border p-4 text-left transition-colors",
                advertiserType === opt.value
                  ? "border-primary-500 bg-primary-50"
                  : "border-border bg-surface hover:border-primary-300"
              )}
            >
              <span className={cn("block text-sm font-semibold", advertiserType === opt.value ? "text-primary-700" : "text-text-primary")}>
                {opt.label}
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-text-secondary">{opt.hint}</span>
            </button>
          ))}
        </div>

        {needsSpecialties && (
          <section aria-label="Select your specialties" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
            <span className="block text-sm font-medium text-text-primary">
              Select your specialties <span className="text-error-500">*</span>
              <span className="ml-2 text-xs font-normal text-text-secondary">(tap to select multiple)</span>
            </span>
            <div className="mt-3">
              <SectorSpecialtyPicker
                persona={advertiserType}
                value={specialties}
                onChange={setSpecialties}
                onError={setError}
              />
            </div>
          </section>
        )}

        <button
          type="button"
          onClick={handleAdvertiserContinue}
          disabled={submitting || (needsSpecialties && realSpecialtyCount === 0)}
          aria-busy={submitting}
          className="touch-target flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
          {submitting ? "Saving…" : "Continue to verification"}
        </button>
      </div>
    );
  }

  // ---- Initial choice: advertise vs customer ----
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <section aria-labelledby="choose-role-heading" className="rounded-xl border border-border bg-surface p-5 text-center sm:p-6">
        <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
          Welcome to All Property Link
        </p>
        <h1 id="choose-role-heading" className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">
          How will you use APL?
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Choose once — <strong>Customer</strong> accounts lock permanently, advertisers verify identity next.
        </p>
      </section>

      {error && <FormBanner variant="error">{error}</FormBanner>}

      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => { setStep("advertiser"); setError(""); }}
          className="touch-target group rounded-xl border border-border bg-surface p-5 text-left transition-all hover:border-primary-400 hover:shadow-sm"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Building2 size={22} />
          </span>
          <span className="mt-3 block font-heading text-base font-bold text-text-primary">
            Advertise a property or service
          </span>
          <span className="mt-1 block text-[13px] leading-relaxed text-text-secondary">
            Property Owner, Agent, Fundi or Service Provider. Requires ID
            verification (KYC) before you can list.
          </span>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 group-hover:underline">
            Advertise <ArrowRight size={14} />
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setStep("customer-confirm"); setError(""); }}
          className="touch-target group rounded-xl border border-border bg-surface p-5 text-left transition-all hover:border-primary-400 hover:shadow-sm"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600">
            <Search size={22} />
          </span>
          <span className="mt-3 block font-heading text-base font-bold text-text-primary">
            Customer — rent, buy &amp; browse
          </span>
          <span className="mt-1 block text-[13px] leading-relaxed text-text-secondary">
            Looking to rent or buy, browse, save listings and leave reviews. No
            verification, no business setup.
          </span>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 group-hover:underline">
            Continue as Customer <ArrowRight size={14} />
          </span>
        </button>
      </div>
    </div>
  );
}

export default function ChooseRolePage() {
  return (
    <PersonaGate>
      <ChooseRoleInner />
    </PersonaGate>
  );
}
