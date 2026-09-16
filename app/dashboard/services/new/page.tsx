import Link from "next/link";
import { serverFetch } from "@/lib/auth-utils";
import { requireAuth } from "@/lib/auth-utils";
import { personaRedirectTarget } from "@/lib/persona";
import { redirect } from "next/navigation";
import { Building2 } from "@/components/ui/icons";
import { NewServiceForm } from "./NewServiceForm";

interface Category {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
}

export default async function NewServicePage() {
  const session = await requireAuth();
  const me = session.user as { authMethod?: string; primaryUserType?: string | null; userTypes?: string[] };
  const personaTarget = personaRedirectTarget(me);
  if (personaTarget) {
    redirect(personaTarget);
  }

  const types = me.userTypes ?? []
  if (!types.includes("FUNDI") && !types.includes("SERVICE_PROVIDER")) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 size={48} className="text-muted mb-4" />
        <h2 className="font-heading text-xl font-bold text-text-primary mb-2">Access Restricted</h2>
        <p className="text-text-secondary mb-6 text-center max-w-md">
          Only Fundis and Service Providers can manage service listings.
        </p>
        <Link href="/dashboard" className="text-sm text-primary-600 hover:text-primary-700">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const res = await serverFetch("/api/services/categories");
  const data = await res.json().catch(() => null);
  const rootCategories: Category[] = data?.categories || [];

  return (
    <div className="space-y-6">
      <section aria-labelledby="new-service-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
          Service business
        </p>
        <h1 id="new-service-heading" className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">
          Create Service Listing
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Describe the service, set pricing, add photos, then publish.
        </p>
      </section>
      <div className="mx-auto max-w-3xl">
        <NewServiceForm categories={rootCategories} />
      </div>
    </div>
  );
}
