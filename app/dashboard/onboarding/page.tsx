"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type OnboardingStep = "interests" | "agent" | "notifications" | "done";

const propertyTypes = [
  { value: "APARTMENT", label: "Apartment" },
  { value: "HOUSE", label: "House" },
  { value: "LAND", label: "Land" },
  { value: "COMMERCIAL", label: "Commercial" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [step, setStep] = useState<OnboardingStep>("interests");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [isAgent, setIsAgent] = useState(false);
  const [agentLicense, setAgentLicense] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);

  async function handleFinish() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyInterest: interests,
          isAgent,
          agentLicense: isAgent ? agentLicense : null,
          agencyName: isAgent ? agencyName : null,
          notificationPrefs: { email: notifyEmail, sms: notifySms },
          onboardingComplete: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save preferences");
        setLoading(false);
        return;
      }

      await update();
      setStep("done");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  function toggleInterest(value: string) {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  }

  if (step === "done") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
          <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="mb-2 font-heading text-2xl font-bold text-text-primary">You&apos;re all set!</h1>
        <p className="mb-8 text-text-secondary">Your preferences have been saved.</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-sm bg-accent-300 px-6 py-3 font-medium text-white hover:bg-accent-400"
        >
          Go to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Welcome to All Property Link</h1>
        <p className="mt-2 text-text-secondary">Help us personalise your experience</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">{error}</div>
      )}

      {step === "interests" && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary">What are you interested in?</label>
            <p className="mt-1 text-xs text-text-secondary">Select all that apply</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {propertyTypes.map((pt) => (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => toggleInterest(pt.value)}
                  className={`rounded-sm border px-4 py-3 text-sm font-medium transition-colors ${
                    interests.includes(pt.value)
                      ? "border-accent-300 bg-accent-300/10 text-accent-300"
                      : "border-border text-text-secondary hover:border-accent-300"
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStep("agent")}
            disabled={interests.length === 0}
            className="touch-target w-full rounded-sm bg-accent-300 px-4 py-3 font-medium text-white transition-colors hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}

      {step === "agent" && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary">Are you a real estate agent?</label>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsAgent(true)}
                className={`flex-1 rounded-sm border px-4 py-2.5 text-sm font-medium transition-colors ${
                  isAgent
                    ? "border-accent-300 bg-accent-300/10 text-accent-300"
                    : "border-border text-text-secondary hover:border-accent-300"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => { setIsAgent(false); setAgentLicense(""); setAgencyName(""); }}
                className={`flex-1 rounded-sm border px-4 py-2.5 text-sm font-medium transition-colors ${
                  !isAgent
                    ? "border-accent-300 bg-accent-300/10 text-accent-300"
                    : "border-border text-text-secondary hover:border-accent-300"
                }`}
              >
                No
              </button>
            </div>
          </div>
          {isAgent && (
            <>
              <div>
                <label htmlFor="agencyName" className="block text-sm font-medium text-text-primary">Agency name</label>
                <input
                  id="agencyName"
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="mt-1 block w-full rounded-sm border border-border px-4 py-3 text-text-primary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
                />
              </div>
              <div>
                <label htmlFor="agentLicense" className="block text-sm font-medium text-text-primary">License number (optional)</label>
                <input
                  id="agentLicense"
                  type="text"
                  value={agentLicense}
                  onChange={(e) => setAgentLicense(e.target.value)}
                  className="mt-1 block w-full rounded-sm border border-border px-4 py-3 text-text-primary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
                />
              </div>
            </>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("interests")}
              className="flex-1 rounded-sm border border-border px-4 py-3 text-sm font-medium text-text-secondary hover:bg-surface-secondary"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep("notifications")}
              className="flex-1 rounded-sm bg-accent-300 px-4 py-3 font-medium text-white hover:bg-accent-400"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === "notifications" && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">Notification preferences</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 rounded-sm border border-border px-4 py-3">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="h-4 w-4 accent-accent-300"
                />
                <span className="text-sm text-text-primary">Email notifications</span>
              </label>
              <label className="flex items-center gap-3 rounded-sm border border-border px-4 py-3">
                <input
                  type="checkbox"
                  checked={notifySms}
                  onChange={(e) => setNotifySms(e.target.checked)}
                  className="h-4 w-4 accent-accent-300"
                />
                <span className="text-sm text-text-primary">SMS notifications</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("agent")}
              className="flex-1 rounded-sm border border-border px-4 py-3 text-sm font-medium text-text-secondary hover:bg-surface-secondary"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleFinish}
              disabled={loading}
              className="flex-1 rounded-sm bg-accent-300 px-4 py-3 font-medium text-white hover:bg-accent-400 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Finish"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
