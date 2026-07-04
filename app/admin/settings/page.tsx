import { requireRole } from "@/lib/auth-utils";
import { saveSettings } from "@/lib/admin-actions";

export default async function AdminSettingsPage() {
  await requireRole(["ADMIN"]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary">
            Admin Settings
          </h1>
          <p className="text-text-secondary">
            Configure platform settings and preferences
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">
          General Settings
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Platform Name</span>
            <input
              type="text"
              name="platformName"
              defaultValue="All Property Link"
              className="w-full max-w-xs rounded-lg border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Platform URL</span>
            <input
              type="text"
              name="platformUrl"
              defaultValue="https://allpropertylink.vercel.app"
              className="w-full max-w-xs rounded-lg border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Contact Email</span>
            <input
              type="email"
              name="contactEmail"
              defaultValue="info@allpropertylink.com"
              className="w-full max-w-xs rounded-lg border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 mt-4">
        <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">
          Email Settings
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">From Name</span>
            <input
              type="text"
              name="fromName"
              defaultValue="All Property Link"
              className="w-full max-w-xs rounded-lg border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">From Email</span>
            <input
              type="email"
              name="fromEmail"
              defaultValue="info@allpropertylink.com"
              className="w-full max-w-xs rounded-lg border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Reply To</span>
            <input
              type="email"
              name="replyTo"
              defaultValue="info@allpropertylink.com"
              className="w-full max-w-xs rounded-lg border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 mt-4">
        <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">
          WhatsApp Settings
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Business Number</span>
            <input
              type="tel"
              name="businessNumber"
              defaultValue="+254 700 000 000"
              className="w-full max-w-xs rounded-lg border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Response Time</span>
            <select
              name="responseTime"
              className="w-full max-w-xs rounded-lg border border-border px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="immediate">Immediate</option>
              <option value="1hour">Within 1 hour</option>
              <option value="4hours">Within 4 hours</option>
              <option value="24hours">Within 24 hours</option>
            </select>
          </div>
        </div>
      </div>

      <form action={saveSettings} className="mt-8">
        <button
          type="submit"
          className="touch-target w-full rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-text-on-primary hover:bg-primary-700"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
}