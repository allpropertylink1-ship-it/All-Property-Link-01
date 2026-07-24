import { requireRole } from "@/lib/auth-utils";

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
            Platform settings are configured via environment variables on the server.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">
          Platform Settings
        </h2>
        <p className="text-sm text-text-secondary">
          Settings such as platform name, contact email, and WhatsApp number are managed through
          environment variables on the Railway dashboard. Contact the development team to update
          these values.
        </p>
        <div className="mt-4 rounded-lg bg-primary-50 px-4 py-3 text-sm text-primary-700">
          To change settings, update the environment variables in your Railway or Vercel dashboard
          and redeploy the application.
        </div>
      </div>
    </div>
  );
}