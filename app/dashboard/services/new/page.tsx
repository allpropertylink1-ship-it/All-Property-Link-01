import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { Building2 } from "@/components/ui/icons";
import { NewServiceForm } from "./NewServiceForm";

export default async function NewServicePage() {
  const session = await requireAuth();

  const types = session.user.userTypes ?? []
  if (!types.includes("FUNDI") && !types.includes("SERVICE_PROVIDER")) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 size={48} className="text-muted mb-4" />
        <h2 className="font-heading text-xl font-bold text-text-primary mb-2">Access Restricted</h2>
        <p className="text-text-secondary mb-6 text-center max-w-md">
          Only Fundis and Service Providers can manage service listings.
        </p>
        <Link href="/dashboard" className="text-sm text-accent-300 hover:text-accent-400">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const categories = await prisma.serviceCategory.findMany({
    orderBy: { name: "asc" },
    include: { children: { orderBy: { name: "asc" } } },
  });

  const rootCategories = categories.filter((c) => !c.parentId);

  return (
    <div>
      <h1 className="mb-8 font-heading text-2xl font-bold text-text-primary">
        Create Service Listing
      </h1>
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-surface p-6">
        <NewServiceForm categories={rootCategories} />
      </div>
    </div>
  );
}
