"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Upload, X, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type DocKey = "nationalIdFront" | "nationalIdBack" | "passportPhoto" | "businessPermit";

interface UploadedDocs {
  nationalIdFront: string;
  nationalIdBack: string;
  passportPhoto: string;
  businessPermit: string;
}

const categories = [
  { value: "AGENT", label: "Agent" },
  { value: "FUNDI", label: "Fundi" },
  { value: "SERVICE_PROVIDER", label: "Service Provider" },
  { value: "PROPERTY_OWNER", label: "Property Owner" },
];

const specialtiesAgent: { value: string; group: string }[] = [
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
];

const specialtiesService: { value: string; group: string }[] = [
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
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState<DocKey | null>(null);

  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    phone: "",
    category: "",
    specialties: [] as string[],
    website: "",
    email: "",
    location: "",
    estateSubLocation: "",
    aplRepName: "",
    aplRepPhone: "",
    refereeName: "",
    refereePhone: "",
    refereeLocation: "",
  });

  const [docs, setDocs] = useState<UploadedDocs>({
    nationalIdFront: "",
    nationalIdBack: "",
    passportPhoto: "",
    businessPermit: "",
  });

  async function handleFileUpload(field: DocKey, file: File) {
    setUploading(field);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setDocs((prev) => ({ ...prev, [field]: data.url }));
      }
    } catch {
      setError("Failed to upload file");
    } finally {
      setUploading(null);
    }
  }

  function handleFileChange(field: DocKey, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(field, file);
  }

  function toggleSpecialty(value: string) {
    setForm((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(value)
        ? prev.specialties.filter((s) => s !== value)
        : [...prev.specialties, value],
    }));
  }

  const docLabel: Record<DocKey, string> = {
    nationalIdFront: "National ID (Front)",
    nationalIdBack: "National ID (Back)",
    passportPhoto: "Passport Photo / Logo",
    businessPermit: "Business Permit",
  };

  const selectedSpecialties = form.category === "FUNDI" || form.category === "AGENT"
    ? specialtiesAgent
    : form.category === "SERVICE_PROVIDER"
      ? specialtiesService
      : [];

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          onboardingComplete: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      if (docs.nationalIdFront || docs.passportPhoto) {
        await fetch("/api/user/kyc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentType: "NATIONAL_ID",
            frontImage: docs.nationalIdFront,
            backImage: docs.nationalIdBack || undefined,
            documentNumber: "ONBOARDING",
          }),
        });
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success-500/10">
          <Check className="h-8 w-8 text-success-600" />
        </div>
        <h1 className="mb-2 font-heading text-2xl font-bold text-text-primary">Submitted for approval!</h1>
        <p className="text-text-secondary">An admin will review your information. You&apos;ll be notified once approved.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Complete Your Profile</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Step {step} of 2 &mdash; Approval required
        </p>
        <div className="mx-auto mt-4 flex h-2 w-full max-w-xs rounded-full bg-surface-secondary">
          <div
            className="rounded-full bg-primary-600 transition-all"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">{error}</div>
      )}

      {loading && (
        <div className="mb-6 rounded-lg bg-primary-50 px-4 py-3 text-sm text-primary-600">
          <Loader2 size={16} className="mr-2 inline animate-spin" />
          Submitting your information... Please wait.
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6 rounded-xl border border-border bg-surface p-6">
          <h2 className="font-heading text-lg font-semibold text-text-primary">Personal & Business Information</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              Full name / Company Name
            </label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              placeholder="Your full name or company name"
              className="w-full rounded-lg border border-border px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              Contact Person <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              value={form.contactPerson}
              onChange={(e) => updateField("contactPerson", e.target.value)}
              placeholder="Contact person name"
              className="w-full rounded-lg border border-border px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Phone Number <span className="text-error-500">*</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+254 7XX XXX XXX"
                className="w-full rounded-lg border border-border px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                required
              />
              <p className="text-xs text-text-secondary">Must be unique</p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Email Address <span className="text-error-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-lg border border-border px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                required
              />
              <p className="text-xs text-text-secondary">Agents must provide a valid, unique email</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              Category <span className="text-error-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => { updateField("category", cat.value); setForm((prev) => ({ ...prev, specialties: [] })); }}
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
                Specialties <span className="text-error-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {selectedSpecialties.map((spec) => (
                  <button
                    key={spec.value}
                    type="button"
                    onClick={() => toggleSpecialty(spec.value)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                      form.specialties.includes(spec.value)
                        ? "border-primary-500 bg-primary-50 text-primary-600"
                        : "border-border text-text-secondary hover:border-primary-300"
                    )}
                  >
                    {spec.group}
                  </button>
                ))}
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
              className="w-full rounded-lg border border-border px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Location <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="e.g., Nairobi"
                className="w-full rounded-lg border border-border px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Estate / Sub-location <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                value={form.estateSubLocation}
                onChange={(e) => updateField("estateSubLocation", e.target.value)}
                placeholder="e.g., Westlands"
                className="w-full rounded-lg border border-border px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                required
              />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface-secondary p-4">
            <p className="mb-3 text-sm font-medium text-text-primary">APL Representative (optional)</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <input
                  type="text"
                  value={form.aplRepName}
                  onChange={(e) => updateField("aplRepName", e.target.value)}
                  placeholder="APL Rep. Name"
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <input
                  type="tel"
                  value={form.aplRepPhone}
                  onChange={(e) => updateField("aplRepPhone", e.target.value)}
                  placeholder="APL Rep. Phone No."
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-warning-500/5 p-4">
            <p className="mb-3 text-sm font-medium text-text-primary">Referee Information</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <input
                  type="text"
                  value={form.refereeName}
                  onChange={(e) => updateField("refereeName", e.target.value)}
                  placeholder="Referee Name *"
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <input
                  type="tel"
                  value={form.refereePhone}
                  onChange={(e) => updateField("refereePhone", e.target.value)}
                  placeholder="Referee Phone *"
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={form.refereeLocation}
                  onChange={(e) => updateField("refereeLocation", e.target.value)}
                  placeholder="Referee Location"
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!form.contactPerson || !form.phone || !form.email || !form.category}
              className="touch-target rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue &mdash; Upload Documents
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 rounded-xl border border-border bg-surface p-6">
          <h2 className="font-heading text-lg font-semibold text-text-primary">Upload Documents</h2>
          <p className="text-sm text-text-secondary">
            Upload your documents for admin approval. Use either your National ID Card or Business Permit.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            {(Object.keys(docLabel) as DocKey[]).map((key) => (
              <div key={key} className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  {docLabel[key]}
                  {(key === "nationalIdFront" || key === "passportPhoto") && (
                    <span className="text-error-500"> *</span>
                  )}
                </label>
                {docs[key] ? (
                  <div className="relative rounded-lg border border-success-500/30 bg-success-500/5 p-3">
                    <div className="flex items-center gap-2">
                      <Check size={16} className="shrink-0 text-success-600" />
                      <span className="truncate text-sm text-success-700">Uploaded</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDocs((prev) => ({ ...prev, [key]: "" }))}
                      className="absolute right-2 top-2 text-text-secondary hover:text-error-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-4 py-6 transition-colors hover:border-primary-400 hover:bg-primary-50/30">
                    {uploading === key ? (
                      <Loader2 size={24} className="animate-spin text-primary-600" />
                    ) : (
                      <>
                        <Upload size={24} className="mb-2 text-text-secondary" />
                        <span className="text-xs text-text-secondary">Click to upload</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => handleFileChange(key, e)}
                      disabled={uploading === key}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="touch-target flex-1 rounded-lg border border-border px-6 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !docs.nationalIdFront || !docs.passportPhoto}
              className="touch-target flex-1 rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit for Approval"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
