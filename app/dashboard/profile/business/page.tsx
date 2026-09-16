/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useEffect } from "react"
import { uploadImage, IMAGE_PRESETS, HEIC_HINT, isHeicFile } from "@/lib/image-client";
import { Check, Loader2, Save, Camera, User, Building2, RotateCw } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api-client"
import { resolveImageUrl } from "@/lib/images";
import { FormBanner } from "@/components/shared/FormFeedback"
import { PersonaGate } from "@/components/dashboard/PersonaGate"

const categories = [
  { value: "AGENT", label: "Agent" },
  { value: "FUNDI", label: "Fundi" },
  { value: "SERVICE_PROVIDER", label: "Service Provider" },
  { value: "PROPERTY_OWNER", label: "Property Owner" },
]

const specialtiesAgent = [
  { value: "AC_REFRIGERATION", group: "AC & Refrigeration" },
  { value: "APPLIANCE_REPAIR", group: "Appliance Repair" },
  { value: "BARBER", group: "Barber" },
  { value: "BRICKLAYING", group: "Bricklaying" },
  { value: "CAR_ELECTRICIAN", group: "Car Electrician" },
  { value: "CAR_SEATS_UPHOLSTERY", group: "Car Seats Upholstery" },
  { value: "CARPENTRY", group: "Carpentry" },
  { value: "CEILING_WORKS", group: "Ceiling Works" },
  { value: "DRAINAGE_SEWAGE", group: "Drainage & Sewage" },
  { value: "ELECTRICAL", group: "Electrical" },
  { value: "ELECTRONICS_REPAIR", group: "Electronics Repair" },
  { value: "FABRICATION_METAL", group: "Fabrication & Metal Works" },
  { value: "FENCE_GATE", group: "Fence & Gate Works" },
  { value: "FLOORING", group: "Flooring" },
  { value: "FLOORING_TILING", group: "Flooring & Tiling" },
  { value: "GENERAL_REPAIR", group: "General Repair" },
  { value: "GLAZING_WINDOWS", group: "Glazing & Windows" },
  { value: "HOME_AUTOMATION", group: "Home Automation" },
  { value: "LANDSCAPING", group: "Landscaping" },
  { value: "MASONRY", group: "Masonry" },
  { value: "MERCEDES_SPECIALIST", group: "Mercedes Specialist" },
  { value: "MOBILE_PHONE_REPAIR", group: "Mobile Phone Repair" },
  { value: "MOTOR_VEHICLE_BODY", group: "Motor Vehicle Body Repair" },
  { value: "MOTOR_VEHICLE_SPRAY", group: "Motor Vehicle Spray Painting" },
  { value: "PAINTING", group: "Painting" },
  { value: "PLUMBING", group: "Plumbing" },
  { value: "POOL_MAINTENANCE", group: "Pool Maintenance" },
  { value: "ROOFING", group: "Roofing" },
  { value: "SEWAGE_UNBLOCKING", group: "Sewage Unblocking" },
  { value: "SOLAR_BATTERIES", group: "Solar & Batteries" },
  { value: "TAILORING", group: "Tailoring" },
  { value: "TILING", group: "Tiling" },
  { value: "WELDING", group: "Welding" },
]

const specialtiesService = [
  { value: "AC_SERVICING", group: "AC Servicing" },
  { value: "BEAUTIFICATION_LANDSCAPING", group: "Beautification & Landscaping" },
  { value: "BIKE_SALES_REPAIR", group: "Bike Sales & Repair" },
  { value: "BOOKSHOP", group: "Bookshop" },
  { value: "BOUNCER", group: "Bouncer" },
  { value: "BOUNCING_CASTLE", group: "Bouncing Castle" },
  { value: "BUTCHERY", group: "Butchery" },
  { value: "CAKES_PASTERIES", group: "Cakes & Pasteries" },
  { value: "CAR_ACCESSORIES", group: "Car Accessories" },
  { value: "CATERING_SERVICES", group: "Catering Services" },
  { value: "CCTV_INSTALLATION", group: "CCTV Installation" },
  { value: "CHEMIST", group: "Chemist" },
  { value: "CLEANING", group: "Cleaning" },
  { value: "CLOTHING_FOOTWEAR", group: "Clothing & Footwear" },
  { value: "DJ", group: "DJ" },
  { value: "ELECTRICAL_INSTALLATION", group: "Electrical Installation" },
  { value: "EVENT_SETUP", group: "Event Setup" },
  { value: "EXECUTIVE_BARBER", group: "Executive Barber" },
  { value: "FINANCIAL_CONSULTANT", group: "Financial Consultant" },
  { value: "FLORIST", group: "Florist" },
  { value: "FURNITURE_ASSEMBLY", group: "Furniture Assembly" },
  { value: "GARDENING", group: "Gardening" },
  { value: "GOODS_TRANSPORT", group: "Goods Transport Services" },
  { value: "GRAPHIC_DESIGN", group: "Graphic Design" },
  { value: "GUIDANCE_COUNSELLING", group: "Guidance & Counselling" },
  { value: "GYM_FITNESS", group: "Gym & Fitness" },
  { value: "HARDWARE", group: "Hardware" },
  { value: "HERBALIST", group: "Herbalist" },
  { value: "HOME_DECOR", group: "Home Decor" },
  { value: "HOLIDAY_TUITION", group: "Holiday Tuition" },
  { value: "HOUSE_GIRLS_BUREAU", group: "House Girls Bureau" },
  { value: "INTERIOR_DESIGN", group: "Interior Design" },
  { value: "IT_NETWORKING", group: "IT & Networking" },
  { value: "LAUNDRY_SERVICES", group: "Laundry Services" },
  { value: "LOG_BOOK_LOANS", group: "Log Book Loans" },
  { value: "MAMA_FUA", group: "Mama Fua" },
  { value: "MOVING", group: "Moving" },
  { value: "MC", group: "MC - Master of Ceremony" },
  { value: "ONLINE_PAYMENT", group: "Online Payment Systems" },
  { value: "PERFUMES_SCENTS", group: "Perfumes & Scents" },
  { value: "PEST_CONTROL", group: "Pest Control" },
  { value: "PHOTOGRAPHY", group: "Photography" },
  { value: "POOL_SERVICES", group: "Pool Services" },
  { value: "PLUMBING_SERVICES", group: "Plumbing Services" },
  { value: "RENOVATION_CONTRACTOR", group: "Renovation Contractor" },
  { value: "SECURITY", group: "Security" },
  { value: "TUTOR", group: "Tutor" },
  { value: "VIDEOGRAPHY", group: "Videography" },
  { value: "WASTE_COLLECTION", group: "Waste Collection" },
  { value: "WATER_TREATMENT", group: "Water Treatment" },
  { value: "WEBSITE_DESIGN", group: "Website Design & Development" },
  { value: "WEB_HOSTING", group: "Web Hosting" },
  { value: "WEIGHTS_MEASURES", group: "Weights & Measures" },
  { value: "WINES_SPIRITS", group: "Wines & Spirits" },
]

function BusinessProfilePageInner() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    category: "",
    specialties: [] as string[],
    website: "",
    location: "",
    estateSubLocation: "",
  })
  const [initialForm, setInitialForm] = useState<typeof form | null>(null)

  const [businessProfilePhotoUrl, setBusinessProfilePhotoUrl] = useState("")
  const [businessLogoUrl, setBusinessLogoUrl] = useState("")
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)

  useEffect(() => {
    ;(async () => {
      const res = await api.get<{
        user: {
          companyName: string | null
          contactPerson: string | null
          category: string | null
          specialties: string[]
          website: string | null
          location: string | null
          estateSubLocation: string | null
          avatar: string | null
          businessLogo: string | null
          businessProfilePhoto: string | null
        }
      }>("/api/user/profile")
      if (res.data?.user) {
        const u = res.data.user
        const next = {
          companyName: u.companyName || "",
          contactPerson: u.contactPerson || "",
          category: u.category || "",
          specialties: u.specialties || [],
          website: u.website || "",
          location: u.location || "",
          estateSubLocation: u.estateSubLocation || "",
        }
        setForm(next)
        setInitialForm(next)
        setBusinessProfilePhotoUrl(u.businessProfilePhoto || "")
        setBusinessLogoUrl(u.businessLogo || "")
      }
      setFetching(false)
    })()
  }, [])

  async function uploadFile(file: File, folder: string): Promise<string> {
    const preset = folder.includes("logo") ? IMAGE_PRESETS.logo : IMAGE_PRESETS.avatar;
    return uploadImage(file, folder, preset)
  }

  async function handleBusinessProfilePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (isHeicFile(file)) { setError(HEIC_HINT); return }
    if (!file.type.startsWith("image/")) { setError("Only image files are allowed"); return }
    if (file.size > 10 * 1024 * 1024) { setError("File must be under 10MB"); return }
    setAvatarUploading(true)
    setError("")
    try {
      const url = await uploadFile(file, "business-profiles")
      setBusinessProfilePhotoUrl(url)
      const res = await api.patch("/api/user/profile", { businessProfilePhoto: url })
      if (res.error) throw new Error(res.error)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setAvatarUploading(false)
    }
  }

  async function handleRotatePhoto() {
    if (!businessProfilePhotoUrl) return
    const src = resolveImageUrl(businessProfilePhotoUrl)
    if (!src) return
    setAvatarUploading(true)
    setError("")
    try {
      const res = await fetch(src)
      if (!res.ok) throw new Error("Failed to fetch image")
      const blob = await res.blob()
      const bitmap = await createImageBitmap(blob)
      const canvas = document.createElement("canvas")
      canvas.width = bitmap.height
      canvas.height = bitmap.width
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas unavailable")
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((90 * Math.PI) / 180)
      ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2)
      const outBlob = await new Promise<Blob | null>((r) => canvas.toBlob((b) => r(b), "image/jpeg", 0.92))
      if (!outBlob) throw new Error("Rotate failed")
      const file = new File([outBlob], "rotated.jpg", { type: "image/jpeg" })
      const url = await uploadFile(file, "business-profiles")
      setBusinessProfilePhotoUrl(url)
      const patch = await api.patch("/api/user/profile", { businessProfilePhoto: url })
      if (patch.error) throw new Error(patch.error)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rotate failed")
    } finally {
      setAvatarUploading(false)
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (isHeicFile(file)) { setError(HEIC_HINT); return }
    if (!file.type.startsWith("image/")) { setError("Only image files are allowed"); return }
    if (file.size > 10 * 1024 * 1024) { setError("File must be under 10MB"); return }
    setLogoUploading(true)
    setError("")
    try {
      const url = await uploadFile(file, "allpropertylink/logos")
      setBusinessLogoUrl(url)
      const res = await api.patch("/api/user/profile", { businessLogo: url })
      if (res.error) throw new Error(res.error)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setLogoUploading(false)
    }
  }

  function toggleSpecialty(value: string) {
    setForm((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(value)
        ? prev.specialties.filter((s) => s !== value)
        : [...prev.specialties, value],
    }))
  }

  // Agents list properties on behalf of owners (like Property Owners) — no specialties.
  // Only Fundis (trade skills) and Service Providers (services) select specialties.
  const selectedSpecialties =
    form.category === "FUNDI"
      ? specialtiesAgent
      : form.category === "SERVICE_PROVIDER"
        ? specialtiesService
        : []

  const isDirty = initialForm ? JSON.stringify(form) !== JSON.stringify(initialForm) : false

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true)
    setError("")
    setSuccess(false)
    try {
      const res = await api.patch("/api/user/profile", form)
      if (res.error) throw new Error(res.error)
      setInitialForm({ ...form })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section aria-labelledby="business-profile-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
          Service business
        </p>
        <h1 id="business-profile-heading" className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">Business Profile</h1>
        <p className="mt-1 text-sm text-text-secondary">
          View and update your business information.
        </p>
      </section>

      <div className="rounded-xl border border-primary-200 bg-primary-50/50 px-4 py-3 text-sm text-primary-800">
        <p className="font-medium">Public Information</p>
        <p className="mt-1 text-primary-600">
          Information entered here will be visible to all All Property Link users viewing your profile, listings, and services.
        </p>
      </div>

{error && (
        <div>
          <FormBanner variant="error">{error}</FormBanner>
        </div>
      )}

      {success && (
        <div>
          <FormBanner variant="success">
            Business profile updated successfully
          </FormBanner>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSave} aria-label="Business profile">
        {/* Stitch section: profile identity */}
        <section aria-labelledby="biz-identity-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 id="biz-identity-heading" className="font-heading text-base font-semibold text-text-primary">
            Profile Identity
          </h2>
          <p className="mb-4 mt-0.5 text-sm text-text-secondary">Logo and photo clients see first.</p>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary" htmlFor="bizCompanyName">
              Full name / Company Name <span className="text-error-500">*</span>
            </label>
            <input
              id="bizCompanyName"
              type="text"
              value={form.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              placeholder="Your full name or company name"
              className="min-h-[44px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                {businessLogoUrl ? (
                  <img src={resolveImageUrl(businessLogoUrl) ?? undefined} alt="Business logo" className="h-20 w-20 rounded-xl object-cover ring-2 ring-primary-600/20" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-primary-50 ring-2 ring-primary-600/10">
                    <Building2 size={32} className="text-primary-400" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-sm font-semibold text-text-primary">Business Logo</h3>
                <p className="text-xs text-text-secondary">Appears on your listings & services</p>
                <label className="touch-target mt-2 inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700">
                  {logoUploading ? (
                    <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                  ) : (
                    <><Camera size={14} /> {businessLogoUrl ? "Change" : "Upload"}</>
                  )}
                  <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleLogoUpload} className="hidden" disabled={logoUploading} aria-label="Upload business logo" />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="shrink-0">
                {businessProfilePhotoUrl ? (
                  <img src={resolveImageUrl(businessProfilePhotoUrl) ?? undefined} alt="Profile" className="h-20 w-20 rounded-full object-cover ring-2 ring-primary-600/20" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 text-2xl font-bold text-primary-600">
                    <User size={28} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-sm font-semibold text-text-primary">Profile Photo</h3>
                <p className="text-xs text-text-secondary">This photo appears on your public profile</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <label className="touch-target inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700">
                    {avatarUploading ? (
                      <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                    ) : (
                      <><Camera size={14} /> {businessProfilePhotoUrl ? "Change" : "Upload"}</>
                    )}
                    <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleBusinessProfilePhotoUpload} className="hidden" disabled={avatarUploading} aria-label="Upload profile photo" />
                  </label>
                  {businessProfilePhotoUrl && (
                    <button
                      type="button"
                      onClick={handleRotatePhoto}
                      disabled={avatarUploading}
                      className="touch-target inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary disabled:opacity-50"
                      title="Rotate 90° clockwise"
                    >
                      <RotateCw size={14} /> Rotate
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stitch section: business details */}
        <section aria-labelledby="biz-details-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 id="biz-details-heading" className="font-heading text-base font-semibold text-text-primary">
            Business Details
          </h2>
          <p className="mb-4 mt-0.5 text-sm text-text-secondary">Contact person, category, and specialties.</p>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary" htmlFor="bizContactPerson">
                Contact Person <span className="text-error-500">*</span>
              </label>
              <input
                id="bizContactPerson"
                type="text"
                value={form.contactPerson}
                onChange={(e) => updateField("contactPerson", e.target.value)}
                placeholder="Contact person name"
                className="min-h-[44px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary" htmlFor="bizWebsite">Website (optional)</label>
              <input
                id="bizWebsite"
                type="url"
                value={form.website}
                onChange={(e) => updateField("website", e.target.value)}
                placeholder="https://your-website.com"
                className="min-h-[44px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <span className="block text-sm font-medium text-text-primary" id="bizCategoryLabel">
              Category <span className="text-error-500">*</span>
            </span>
            <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2" role="group" aria-labelledby="bizCategoryLabel">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  aria-pressed={form.category === cat.value}
                  onClick={() => {
                    updateField("category", cat.value)
                    setForm((prev) => ({ ...prev, specialties: [] }))
                  }}
                  className={cn(
                    "touch-target rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
                    form.category === cat.value
                      ? "border-primary-500 bg-primary-50 text-primary-600"
                      : "border-border text-text-secondary hover:border-primary-300"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {selectedSpecialties.length > 0 && (
            <div className="mt-6 space-y-2">
              <span className="block text-sm font-medium text-text-primary" id="bizSpecialtiesLabel">
                Select your specialties <span className="text-error-500">*</span>
                <span className="ml-2 text-xs font-normal text-text-secondary">(tap to select multiple)</span>
              </span>
              <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:grid-cols-3" role="group" aria-labelledby="bizSpecialtiesLabel">
                {selectedSpecialties.map((spec) => {
                  const isSelected = form.specialties.includes(spec.value);
                  return (
                    <button
                      key={spec.value}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => toggleSpecialty(spec.value)}
                      className={cn(
                        "touch-target relative flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all",
                        isSelected
                          ? "border-accent-500 bg-accent-50 text-accent-700 shadow-sm"
                          : "border-border bg-surface text-text-secondary hover:border-accent-500 hover:bg-accent-50/50"
                      )}
                    >
                      <span className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                        isSelected
                          ? "border-accent-500 bg-accent-500 text-white"
                          : "border-border bg-surface"
                      )} aria-hidden="true">
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span className="text-left leading-tight">{spec.group}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Stitch section: operating locations */}
        <section aria-labelledby="biz-location-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 id="biz-location-heading" className="font-heading text-base font-semibold text-text-primary">
            Operating Locations
          </h2>
          <p className="mb-4 mt-0.5 text-sm text-text-secondary">Where clients can find and hire you.</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary" htmlFor="bizLocation">Location</label>
              <input
                id="bizLocation"
                type="text"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="e.g., Nairobi"
                className="min-h-[44px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary" htmlFor="bizEstate">Estate / Sub-location</label>
              <input
                id="bizEstate"
                type="text"
                value={form.estateSubLocation}
                onChange={(e) => updateField("estateSubLocation", e.target.value)}
                placeholder="e.g., Westlands"
                className="min-h-[44px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-border pt-6">
            <button
              type="submit"
              disabled={loading || !isDirty}
              aria-busy={loading}
              title={!isDirty ? "No changes to save" : undefined}
              className="touch-target flex min-h-[44px] items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save changes
                </>
              )}
            </button>
          </div>
        </section>
      </form>
    </div>
  )
}

export default function BusinessProfilePage() {
  return (
    <PersonaGate>
      <BusinessProfilePageInner />
    </PersonaGate>
  );
}
