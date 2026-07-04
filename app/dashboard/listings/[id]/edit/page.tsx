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
        <EditListingForm propertyId={params.id} property={property} />
      </div>
    </div>
  );
}