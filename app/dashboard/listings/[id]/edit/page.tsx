import { requireAuth, serverFetch } from "@/lib/auth-utils";
import { personaRedirectTarget, canListProperties } from "@/lib/persona";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2 } from "@/components/ui/icons";
import EditListingForm from "./EditListingForm";

export default async function EditListingPage({ params }: { params: { id: string } }) {
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

  const res = await serverFetch(`/api/user/properties/${encodeURIComponent(params.id)}`);
  if (!res.ok) {
    return <div>Property not found</div>;
  }
  const data = await res.json().catch(() => null);
  const property = data?.property;

  if (!property) {
    return <div>Property not found</div>;
  }

  return (
    <div>
      <h1 className="mb-8 font-heading text-2xl font-bold text-text-primary">
        Edit listing
      </h1>
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-surface p-6">
        <EditListingForm
          propertyId={params.id}
          property={{
            title: property.title,
            description: property.description,
            price: property.price == null ? null : Number(property.price),
            propertyType: property.propertyType as "APARTMENT" | "HOUSE" | "LAND" | "COMMERCIAL",
            listingPurpose: property.listingPurpose as "FOR_SALE" | "FOR_RENT_LONG_TERM" | "FOR_RENT_SHORT_TERM" | null | undefined,
            subType: (property.subType as string | null) ?? null,
            city: property.city,
            region: property.region,
            address: property.address,
            bedrooms: property.bedrooms ?? undefined,
            bathrooms: property.bathrooms ?? undefined,
            area: property.area ?? undefined,
            features: (property.features as string[]) ?? undefined,
            images: (property.images as string[]) ?? undefined,
          }}
        />
      </div>
    </div>
  );
}
