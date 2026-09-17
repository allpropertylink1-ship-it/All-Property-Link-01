import { requireAuth } from "@/lib/auth-utils";
import { personaRedirectTarget, canListProperties } from "@/lib/persona";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2 } from "@/components/ui/icons";
import { ListingForm } from "@/components/dashboard/ListingForm";

export default async function NewListingPage() {
  const session = await requireAuth();
  const me = session.user as { authMethod?: string; primaryUserType?: string | null; userTypes?: string[] };
  const personaTarget = personaRedirectTarget(me);
  if (personaTarget) {
    redirect(personaTarget);
  }
  const isTypeless = !me.primaryUserType && (!me.userTypes || me.userTypes.length === 0)
  if (!canListProperties(me)) {
    if (isTypeless) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 size={48} className="text-muted mb-4" />
          <h2 className="font-heading text-xl font-bold text-text-primary mb-2">Complete Your Setup</h2>
          <p className="text-text-secondary mb-6 max-w-md">
            Please complete identity verification and choose your account type to create property listings.
          </p>
          <Link href="/dashboard/kyc" className="touch-target inline-flex min-h-[44px] items-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700">
            Continue Setup
          </Link>
        </div>
      )
    }
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 size={48} className="text-muted mb-4" />
        <h2 className="font-heading text-xl font-bold text-text-primary mb-2">Access Restricted</h2>
        <p className="text-text-secondary mb-6 text-center max-w-md">
          Only Property Owners and Agents can manage property listings.
        </p>
        <Link href="/dashboard/notifications" className="text-sm text-primary-600 hover:text-primary-700">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section aria-labelledby="new-listing-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
          List property
        </p>
        <h1 id="new-listing-heading" className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">
          Create listing
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Four quick steps — category, location, photos, then publish. Free listing with direct buyer inquiries.
        </p>
      </section>
      <div className="mx-auto max-w-3xl">
        <ListingForm />
      </div>
    </div>
  );
}
