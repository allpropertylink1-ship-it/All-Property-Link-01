import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-utils"
import { notFound } from "next/navigation"
import { EditServiceForm } from "./EditServiceForm"

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const session = await requireAuth()
  const userId = (session.user as { id: string }).id

  const service = await prisma.serviceListing.findFirst({
    where: { id: params.id, userId },
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
  })

  if (!service) notFound()

  const categories = await prisma.serviceCategory.findMany({
    orderBy: { name: "asc" },
    include: { children: { orderBy: { name: "asc" } } },
  })

  const rootCategories = categories.filter((c) => !c.parentId)

  return (
    <div>
      <h1 className="mb-8 font-heading text-2xl font-bold text-text-primary">Edit Service</h1>
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-surface p-6">
        <EditServiceForm
          service={{
            id: service.id,
            categoryId: service.categoryId,
            title: service.title,
            description: service.description,
            price: service.price ? Number(service.price) : null,
            currency: service.currency,
            pricePeriod: service.pricePeriod,
            location: service.location,
            city: service.city,
            region: service.region,
            images: (service.images as string[]) || [],
            category: service.category,
          }}
          categories={rootCategories}
        />
      </div>
    </div>
  )
}
