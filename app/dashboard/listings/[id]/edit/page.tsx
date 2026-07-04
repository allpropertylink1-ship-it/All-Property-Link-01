import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import EditListingForm from "./EditListingForm";

export default async function EditListingPage({ params }: { params: { id: string } }) {
  await requireAuth();

  const property = await prisma.property.findUnique({
    where: { id: params.id },
  });

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
            price: Number(property.price),
            propertyType: property.propertyType as "APARTMENT" | "HOUSE" | "LAND" | "COMMERCIAL",
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