import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-utils"
import { notFound } from "next/navigation"
import { Building2 } from "lucide-react"
import { EditServiceForm } from "./EditServiceForm"

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const session = await requireAuth()
  const userId = (session.user as { id: string }).id

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
