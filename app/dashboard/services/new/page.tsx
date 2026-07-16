import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { NewServiceForm } from "./NewServiceForm";

export default async function NewServicePage() {
  await requireAuth();

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
