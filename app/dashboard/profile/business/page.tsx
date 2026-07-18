"use client"

import { useState, useEffect } from "react"
import { Check, Loader2, Save, Camera, User, Building2 } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api-client"

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

export default function BusinessProfilePage() {
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
        setForm({
          companyName: u.companyName || "",
          contactPerson: u.contactPerson || "",
          category: u.category || "",
          specialties: u.specialties || [],
          website: u.website || "",
          location: u.location || "",
          estateSubLocation: u.estateSubLocation || "",
        })
        setBusinessProfilePhotoUrl(u.businessProfilePhoto || "")
        setBusinessLogoUrl(u.businessLogo || "")
      }
      setFetching(false)
    })()
  }, [])

  async function uploadFile(file: File, folder: string): Promise<string> {
    const signRes = await api.post<{ signature: string; timestamp: number; apiKey: string; cloudName: string }>("/api/uploadthing/sign", { folder })
    if (signRes.error || !signRes.data) throw new Error(signRes.error || "Failed to get upload signature")
    const { signature, timestamp, apiKey, cloudName } = signRes.data
    const fd = new FormData()
    fd.append("file", file)
    fd.append("api_key", apiKey)
    fd.append("timestamp", String(timestamp))
    fd.append("signature", signature)
    fd.append("folder", folder)
    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: fd })
    if (!uploadRes.ok) throw new Error("Upload failed")
    const result = await uploadRes.json()
    return result.secure_url
  }

  async function handleBusinessProfilePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { setError("Only image files are allowed"); return }
    if (file.size > 10 * 1024 * 1024) { setError("File must be under 10MB"); return }
    setAvatarUploading(true)
    setError("")
    try {
      const url = await uploadFile(file, "allpropertylink/business-profiles")
      setBusinessProfilePhotoUrl(url)
      const res = await api.patch("/api/user/profile", { businessProfilePhoto: url })
      if (res.error) throw new Error(res.error)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setAvatarUploading(false)
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
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

  const selectedSpecialties =
    form.category === "FUNDI" || form.category === "AGENT"
      ? specialtiesAgent
      : form.category === "SERVICE_PROVIDER"
        ? specialtiesService
        : []

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true)
    setError("")
    setSuccess(false)
    try {
      const res = await api.patch("/api/user/profile", form)
      if (res.error) throw new Error(res.error)
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
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Business Profile</h1>
        <p className="mt-1 text-sm text-text-secondary">
          View and update your business information.
        </p>
      </div>

      <div className="mb-6 rounded-lg border border-primary-200 bg-primary-50/50 px-4 py-3 text-sm text-primary-800">
        <p className="font-medium">Public Information</p>
        <p className="mt-1 text-primary-600">
          Information entered here will be visible to all All Property Link users viewing your profile, listings, and services.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">{error}</div>
      )}

      {success && (
        <div className="mb-6 rounded-lg bg-success-500/10 px-4 py-3 text-sm text-success-700">
          <Check size={16} className="mr-2 inline" />
          Business profile updated successfully
        </div>
      )}

      <form className="space-y-6 rounded-xl border border-border bg-surface p-6" onSubmit={handleSave}>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              Full name / Company Name <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              placeholder="Your full name or company name"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="flex items-center gap-4 justify-self-end">
            <div className="text-right flex-1">
              <h3 className="font-heading text-sm font-semibold text-text-primary">Business Logo</h3>
              <p className="text-xs text-text-secondary">Appears on your listings & services</p>
              <label className="mt-2 touch-target inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700">
                {logoUploading ? (
                  <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                ) : (
                  <><Camera size={14} /> {businessLogoUrl ? "Change" : "Upload"}</>
                )}
                <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleLogoUpload} className="hidden" disabled={logoUploading} />
              </label>
            </div>
            <div className="shrink-0">
              {businessLogoUrl ? (
                <img src={businessLogoUrl} alt="Logo" className="h-28 w-28 rounded-xl object-cover ring-2 ring-primary/20" />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-primary-50 ring-2 ring-primary/10">
                  <Building2 size={40} className="text-primary-400" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              Contact Person <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              value={form.contactPerson}
              onChange={(e) => updateField("contactPerson", e.target.value)}
              placeholder="Contact person name"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="flex items-center gap-4 justify-self-end">
            <div className="text-right flex-1">
              <h3 className="font-heading text-sm font-semibold text-text-primary">Profile Photo</h3>
              <p className="text-xs text-text-secondary">This photo appears on your public profile</p>
              <label className="mt-2 touch-target inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700">
                {avatarUploading ? (
                  <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                ) : (
                  <><Camera size={14} /> {businessProfilePhotoUrl ? "Change" : "Upload"}</>
                )}
                <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleBusinessProfilePhotoUpload} className="hidden" disabled={avatarUploading} />
              </label>
            </div>
            <div className="shrink-0">
              {businessProfilePhotoUrl ? (
                <img src={businessProfilePhotoUrl} alt="" className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/20" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 text-2xl font-bold text-primary-600">
                  <User size={28} />
                </div>
              )}
            </div>
          </div>
        </div>

        <hr className="border-border" />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary">
            Category <span className="text-error-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  updateField("category", cat.value)
                  setForm((prev) => ({ ...prev, specialties: [] }))
                }}
                className={cn(
                  "rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
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
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              Select your specialties <span className="text-error-500">*</span>
              <span className="ml-2 text-xs font-normal text-text-secondary">(tap to select multiple)</span>
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {selectedSpecialties.map((spec) => {
                const isSelected = form.specialties.includes(spec.value);
                return (
                  <button
                    key={spec.value}
                    type="button"
                    onClick={() => toggleSpecialty(spec.value)}
                    className={cn(
                      "relative flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all",
                      isSelected
                        ? "border-accent-400 bg-accent-50 text-accent-700 shadow-sm"
                        : "border-border bg-surface text-text-secondary hover:border-accent-300 hover:bg-accent-50/50"
                    )}
                  >
                    <div className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                      isSelected
                        ? "border-accent-400 bg-accent-400 text-white"
                        : "border-border bg-surface"
                    )}>
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </div>
                    <span className="text-left leading-tight">{spec.group}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary">Website (optional)</label>
          <input
            type="url"
            value={form.website}
            onChange={(e) => updateField("website", e.target.value)}
            placeholder="https://your-website.com"
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="e.g., Nairobi"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">Estate / Sub-location</label>
            <input
              type="text"
              value={form.estateSubLocation}
              onChange={(e) => updateField("estateSubLocation", e.target.value)}
              placeholder="e.g., Westlands"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-border pt-6">
          <button
            type="submit"
            disabled={loading}
            className="touch-target flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
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
      </form>
    </div>
  )
}
