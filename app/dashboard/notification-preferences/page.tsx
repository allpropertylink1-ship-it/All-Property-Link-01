"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { FormBanner } from "@/components/shared/FormFeedback";
import { SlidersHorizontal, Mail, Phone, MessageCircle } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface NotificationPrefs {
  channels: { email: boolean; sms: boolean; whatsapp: boolean };
  events: {
    PRICE_DROP: boolean;
    SAVED_SEARCH_MATCH: boolean;
    LISTING_LIFECYCLE: boolean;
    KYC_VERDICT: boolean;
    REVIEWS: boolean;
    SYSTEM: boolean;
  };
}

const DEFAULT_PREFS: NotificationPrefs = {
  channels: { email: true, sms: true, whatsapp: true },
  events: {
    PRICE_DROP: true,
    SAVED_SEARCH_MATCH: true,
    LISTING_LIFECYCLE: true,
    KYC_VERDICT: true,
    REVIEWS: true,
    SYSTEM: true,
  },
};

const CHANNELS = [
  { key: "email" as const, label: "Email", Icon: Mail },
  { key: "sms" as const, label: "SMS", Icon: Phone },
  { key: "whatsapp" as const, label: "WhatsApp", Icon: MessageCircle },
];

const EVENT_ROWS: { key: keyof NotificationPrefs["events"]; label: string; help: string }[] = [
  { key: "PRICE_DROP", label: "Price drops", help: "When a saved listing changes price" },
  { key: "SAVED_SEARCH_MATCH", label: "Saved search matches", help: "When a new listing matches a search you saved" },
  { key: "LISTING_LIFECYCLE", label: "Listing & approval updates", help: "When your listing or service is approved or rejected" },
  { key: "KYC_VERDICT", label: "ID verification", help: "When your identity documents are approved or rejected" },
  { key: "REVIEWS", label: "Reviews", help: "When someone reviews your profile, work, or business" },
  { key: "SYSTEM", label: "System updates", help: "Important account or platform notices" },
];

function Toggle({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <label
      className={cn(
        "inline-flex touch-target items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-primary"
      />
      <span>{label}</span>
    </label>
  );
}

export default function NotificationPreferencesPage() {
  const { user } = useAuth();
  const hasPhone = !!user?.phone;
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ variant: "error" | "success"; message: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await api.get<{ prefs: NotificationPrefs }>("/api/user/notification-prefs");
      if (!error && data?.prefs) {
        setPrefs((prev) => ({
          channels: { ...prev.channels, ...data.prefs.channels },
          events: { ...prev.events, ...data.prefs.events },
        }));
      }
    } catch {
      // keep all-on defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function setChannel(key: keyof NotificationPrefs["channels"], value: boolean) {
    setPrefs((prev) => ({ ...prev, channels: { ...prev.channels, [key]: value } }));
  }

  function setEvent(key: keyof NotificationPrefs["events"], value: boolean) {
    setPrefs((prev) => ({ ...prev, events: { ...prev.events, [key]: value } }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const { error } = await api.patch("/api/user/notification-prefs", { prefs });
      if (error) throw new Error(error);
      setFeedback({ variant: "success", message: "Preferences saved." });
    } catch (err) {
      setFeedback({ variant: "error", message: err instanceof Error ? err.message : "Could not save preferences" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section aria-labelledby="notification-prefs-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-primary-50 p-2.5 text-primary"><SlidersHorizontal size={20} /></span>
          <div>
            <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">Preferences</p>
            <h1 id="notification-prefs-heading" className="mt-0.5 font-heading text-2xl font-bold tracking-tight text-text-primary">
              Notification preferences
            </h1>
          </div>
        </div>
        <p className="mt-4 text-sm text-text-secondary">
          Choose which channels and topics reach you outside the website. The in-site bell always shows updates — these
          settings control whether we also email or text you about them.
        </p>
      </section>

      {feedback && <FormBanner variant={feedback.variant}>{feedback.message}</FormBanner>}
      {!hasPhone && (
        <FormBanner variant="error">
          Add a phone number on your profile to receive SMS and WhatsApp notifications. Email works without one.
        </FormBanner>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <section aria-labelledby="channels-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 id="channels-heading" className="font-heading text-lg font-semibold text-text-primary">Outbound channels</h2>
          <p className="mt-1 text-sm text-text-secondary">Turn a channel on or off for all of your notifications.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {CHANNELS.map(({ key, label, Icon }) => (
              <div key={key} className="flex flex-col items-start gap-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  <Icon size={14} /> <span className="capitalize">{label}</span>
                </span>
                <Toggle
                  key={key}
                  label={label}
                  checked={prefs.channels[key]}
                  disabled={key !== "email" && !hasPhone}
                  onChange={(v) => setChannel(key, v)}
                />
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="topics-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 id="topics-heading" className="font-heading text-lg font-semibold text-text-primary">Topics</h2>
          <p className="mt-1 text-sm text-text-secondary">Pick which kinds of updates you want to hear about off-site.</p>
          <ul className="mt-4 divide-y divide-border">
            {loading ? (
              <li className="py-6 text-sm text-text-secondary" role="status" aria-busy="true">Loading your preferences…</li>
            ) : (
              EVENT_ROWS.map((row) => (
                <li key={row.key} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                <div className="min-w-0">
                  <p className="font-medium text-text-primary">{row.label}</p>
                  <p className="text-xs text-text-secondary">{row.help}</p>
                </div>
                <label className="inline-flex touch-target cursor-pointer items-center gap-2 text-sm font-medium text-text-primary">
                  <input
                    type="checkbox"
                    checked={prefs.events[row.key]}
                    onChange={(e) => setEvent(row.key, e.target.checked)}
                    className="ml-1 h-4 w-4 accent-primary"
                  />
                  <span className="sr-only">Enabled</span>
                  <span className="text-xs font-semibold text-text-secondary">
                    {prefs.events[row.key] ? "On" : "Off"}
                  </span>
                </label>
              </li>
              ))
            )}
          </ul>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || loading}
            className="touch-target rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save preferences"}
          </button>
        </div>
      </form>
    </div>
  );
}