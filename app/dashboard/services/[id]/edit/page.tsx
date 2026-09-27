import Link from "next/link"
import { requireAuth, serverFetch } from "@/lib/auth-utils"
import { personaRedirectTarget } from "@/lib/persona"
import { redirect, notFound } from "next/navigation"
import { Building2 } from "@/components/ui/icons"
import { EditServiceForm } from "./EditServiceForm"

interface Category {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
}

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const session = await requireAuth()
  const me = session.user as { authMethod?: string; primaryUserType?: string | null; userTypes?: string[] }
  const personaTarget = personaRedirectTarget(me)
  if (personaTarget) {
    redirect(personaTarget)
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

  const [serviceRes, mineRes, fullRes] = await Promise.all([
    serverFetch(`/api/user/services/${encodeURIComponent(params.id)}`),
    serverFetch("/api/services/categories/mine"),
    serverFetch("/api/services/categories"),
  ])
  const serviceData = await serviceRes.json().catch(() => null)
  const service = serviceData?.service

  if (!serviceRes.ok || !service) notFound()

  const mineData = await mineRes.json().catch(() => null)
  const fullData = await fullRes.json().catch(() => null)
  const mineRoots: Category[] = Array.isArray(mineData?.categories) ? mineData.categories : []
  const fullRoots: Category[] = Array.isArray(fullData?.categories) ? fullData.categories : []
  // Grandfather: the listing's current shelf is always present even when it
  // no longer intersects the provider's specialties (PATCH allows keeping it).
  const base = mineRoots.length > 0 ? mineRoots : fullRoots
  const currentId: string = service.categoryId
  const inTree = base.some((r) => r.id === currentId || r.children.some((c) => c.id === currentId))
  let rootCategories = base
  let grandfathered = false
  if (!inTree) {
    const holder = fullRoots.find((r) => r.id === currentId || r.children.some((c) => c.id === currentId))
    if (holder) {
      rootCategories = [...base, holder]
      grandfathered = true
    } else {
      rootCategories = fullRoots
    }
  }

  return (
    <div className="space-y-6">
      <section aria-labelledby="edit-service-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
          Service business
        </p>
        <h1 id="edit-service-heading" className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">Edit Service</h1>
        <p className="mt-1 text-sm text-text-secondary">Update details, pricing, photos, then save.</p>
      </section>
      <div className="mx-auto max-w-3xl">
        {grandfathered && (
          <div className="mb-4 rounded-xl border border-primary-200 bg-primary-50/50 px-4 py-3 text-sm text-primary-800" role="status">
            This listing&apos;s current category is kept even though it&apos;s outside your present specialties.
            Keeping it is allowed; moving it requires one of your specialties.
          </div>
        )}
        <EditServiceForm
          service={{
            id: service.id,
            categoryId: service.categoryId,
            categories: Array.isArray(service.categories) && service.categories.length > 0
              ? service.categories
              : [service.category],
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
