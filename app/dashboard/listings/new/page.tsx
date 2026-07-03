import { requireAuth } from "@/lib/auth-utils";
import { ListingForm } from "@/components/dashboard/ListingForm";

export default async function NewListingPage() {
  await requireAuth();

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
