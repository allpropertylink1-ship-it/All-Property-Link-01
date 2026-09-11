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
  if (!canListProperties(me)) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 size={48} className="text-muted mb-4" />
        <h2 className="font-heading text-xl font-bold text-text-primary mb-2">Access Restricted</h2>
        <p className="text-text-secondary mb-6 text-center max-w-md">
          Only Property Owners and Agents can manage property listings.
        </p>
        <Link href="/dashboard/notifications" className="text-sm text-accent-300 hover:text-accent-400">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-8 font-heading text-2xl font-bold text-text-primary">
        Create listing
      </h1>
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-surface p-6">
        <ListingForm />
      </div>
    </div>
  );
}
