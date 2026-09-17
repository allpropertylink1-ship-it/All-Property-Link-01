"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { FormBanner } from "@/components/shared/FormFeedback";
import { PersonaGate } from "@/components/dashboard/PersonaGate";
import { useAuth } from "@/lib/auth-context";
import { personaHomeTarget } from "@/lib/persona";

const categories = [
  { value: "CUSTOMER", label: "Customer" },
  { value: "PROPERTY_OWNER", label: "Property Owner" },
  { value: "AGENT", label: "Agent" },
  { value: "FUNDI", label: "Fundi" },
  { value: "SERVICE_PROVIDER", label: "Service Provider" },
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

function OnboardingPageInner() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
  });

  function toggleSpecialty(value: string) {
    setForm((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(value)
        ? prev.specialties.filter((s) => s !== value)
        : [...prev.specialties, value],
    }));
  }

  // Only Fundis (trade skills) and Service Providers (services) select specialties.
  // AGENT, PROPERTY_OWNER, and CUSTOMER never select specialties.
  const selectedSpecialties = form.category === "FUNDI"
    ? specialtiesAgent
    : form.category === "SERVICE_PROVIDER"
      ? specialtiesService
      : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate specialties per type
    if ((form.category === "FUNDI" || form.category === "SERVICE_PROVIDER") && form.specialties.length === 0) {
      setError("Please select at least one specialty for your category")
      setLoading(false)
      return
    }

    try {
      // AGENT, PROPERTY_OWNER, CUSTOMER have no specialties — never submit stale values.
      const payload =
        form.category === "AGENT" || form.category === "PROPERTY_OWNER" || form.category === "CUSTOMER"
          ? { ...form, specialties: [] as string[] }
          : form;
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          onboardingComplete: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      setSuccess(true);
      // Hydrate (onboarding sets primaryUserType) then route by persona —
      // customers land on home, businesses on the dashboard.
      const u = await refreshUser().catch(() => null);
      setTimeout(() => router.push(personaHomeTarget(u ?? null)), 2000);
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
        <h1 className="mb-2 font-heading text-2xl font-bold text-text-primary">Profile submitted!</h1>
        <p className="text-text-secondary">An admin will review your information. You&apos;ll be notified once approved.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section aria-labelledby="onboarding-heading" className="rounded-xl border border-border bg-surface p-5 text-center sm:p-6">
        <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
          Get started
        </p>
          <h1 id="onboarding-heading" className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">Choose Your Account Type</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Select how you'll use All Property Link. {form.category === "CUSTOMER" ? "Customers can browse and review — no business setup needed." : "Business profiles require approval."}
        </p>
      </section>

      {error && (
        <div>
          <FormBanner variant="error">{error}</FormBanner>
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-700" role="status">
          <Loader2 size={16} className="mr-2 inline animate-spin" />
          Submitting your information... Please wait.
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit} aria-label="Business onboarding">
        <section aria-labelledby="onboarding-identity-heading" className="space-y-6 rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div>
            <h2 id="onboarding-identity-heading" className="font-heading text-base font-semibold text-text-primary">Personal & Business Information</h2>
            <p className="mt-0.5 text-sm text-text-secondary">How clients reach you.</p>
          </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary" htmlFor="obCompany">
            Full name / Company Name
          </label>
          <input
            id="obCompany"
            type="text"
            value={form.companyName}
            onChange={(e) => updateField("companyName", e.target.value)}
            placeholder="Your full name or company name"
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary" htmlFor="obContact">
            Contact Person <span className="text-error-500">*</span>
          </label>
          <input
            id="obContact"
            type="text"
            value={form.contactPerson}
            onChange={(e) => updateField("contactPerson", e.target.value)}
            placeholder="Contact person name"
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary" htmlFor="obPhone">
              Phone Number <span className="text-error-500">*</span>
            </label>
            <input
              id="obPhone"
              type="tel"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+254 7XX XXX XXX"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              required
            />
            <p className="text-xs text-text-secondary">Must be unique</p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary" htmlFor="obEmail">
              Email Address <span className="text-error-500">*</span>
            </label>
            <input
              id="obEmail"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              required
            />
            <p className="text-xs text-text-secondary">Agents must provide a valid, unique email</p>
          </div>
        </div>

        <div className="space-y-2">
          <span className="block text-sm font-medium text-text-primary" id="onboarding-category-label">
            Category <span className="text-error-500">*</span>
          </span>
          <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2" role="group" aria-labelledby="onboarding-category-label">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                aria-pressed={form.category === cat.value}
                onClick={() => { updateField("category", cat.value); setForm((prev) => ({ ...prev, specialties: [] })); }}
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
          <div className="space-y-2">
            <span className="block text-sm font-medium text-text-primary" id="onboarding-specialties-label">
              Select your specialties <span className="text-error-500">*</span>
              <span className="ml-2 text-xs font-normal text-text-secondary">(tap to select multiple)</span>
            </span>
            <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:grid-cols-3" role="group" aria-labelledby="onboarding-specialties-label">
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

        <section aria-labelledby="onboarding-location-heading" className="space-y-6 rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div>
            <h2 id="onboarding-location-heading" className="font-heading text-base font-semibold text-text-primary">Online & Location Presence</h2>
            <p className="mt-0.5 text-sm text-text-secondary">Website and where you operate.</p>
          </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary" htmlFor="obWebsite">Website (optional)</label>
          <input
            id="obWebsite"
            type="url"
            value={form.website}
            onChange={(e) => updateField("website", e.target.value)}
            placeholder="https://your-website.com"
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary" htmlFor="obLocation">
              Location {form.category !== "CUSTOMER" && <span className="text-error-500">*</span>}
            </label>
            <input
              id="obLocation"
              type="text"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="e.g., Nairobi"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              required={form.category !== "CUSTOMER"}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary" htmlFor="obEstate">
              Estate / Sub-location {form.category !== "CUSTOMER" && <span className="text-error-500">*</span>}
            </label>
            <input
              id="obEstate"
              type="text"
              value={form.estateSubLocation}
              onChange={(e) => updateField("estateSubLocation", e.target.value)}
              placeholder="e.g., Westlands"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              required={form.category !== "CUSTOMER"}
            />
          </div>
        </div>


        <div className="flex justify-end border-t border-border pt-6">
          <button
            type="submit"
            disabled={loading || !form.contactPerson || !form.phone || !form.email || !form.category || ((form.category === "FUNDI" || form.category === "SERVICE_PROVIDER") && form.specialties.length === 0)}
            aria-busy={loading}
            className="touch-target min-h-[44px] rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Submitting..." : form.category === "CUSTOMER" ? "Continue as Customer" : "Submit for Approval"}
          </button>
        </div>
        </section>
      </form>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <PersonaGate>
      <OnboardingPageInner />
    </PersonaGate>
  );
}
