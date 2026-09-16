"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProperty } from "@/app/actions/properties";
import { subTypeOptionsFor } from "@/lib/property-subtypes";
import PropertyImageUploader from "@/components/property/PropertyImageUploader";
import dynamic from "next/dynamic";
// Leaflet touches `window` at import time — never SSR the map.
const LocationPicker = dynamic(
  () => import("@/components/shared/LocationPicker").then((m) => m.LocationPicker),
  { ssr: false, loading: () => <p className="text-sm text-text-secondary">Loading map…</p> }
);
import { FormBanner } from "@/components/shared/FormFeedback";

const listingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  propertyType: z.enum(["APARTMENT", "HOUSE", "LAND", "COMMERCIAL"]),
  listingPurpose: z.enum(["FOR_SALE", "FOR_RENT_LONG_TERM", "FOR_RENT_SHORT_TERM"]).optional(),
  subType: z.string().optional(),
  city: z.string().min(1, "City is required"),
  region: z.string().min(1, "Region is required"),
  address: z.string().min(1, "Address is required"),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  area: z.coerce.number().int().min(0).optional(),
  features: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

/**
 * Optional override for non-owner submits (e.g. APL reps posting on behalf
 * of a referral). Receives the validated JSON payload; return success=false
 * with an error message to surface a failure. Default path is unchanged.
 */
export type ListingSubmitOverride = (
  payload: Record<string, unknown>
) => Promise<{ success: boolean; error?: string }>

const WIZARD_STEPS = [
  { n: 1, title: "Category & Intent", hint: "What are you listing, and why" },
  { n: 2, title: "Location & Specs", hint: "Where it is and what it offers" },
  { n: 3, title: "Photos & Amenities", hint: "Cover photo plus gallery" },
  { n: 4, title: "Review & Publish", hint: "Confirm details and go live" },
] as const;

const selectClass =
  "flex min-h-[44px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20";
const textareaClass =
  "flex w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20";

function StepHeader({ n, title, hint }: { n: number; title: string; hint: string }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 font-heading text-sm font-bold text-white"
        aria-hidden="true"
      >
        {n}
      </span>
      <div>
        <h2 className="font-heading text-base font-semibold text-text-primary">
          Step {n} of 4 &middot; {title}
        </h2>
        <p className="text-sm text-text-secondary">{hint}</p>
      </div>
    </div>
  );
}

export function ListingForm({ submitOverride, redirectTo }: {
  submitOverride?: ListingSubmitOverride
  redirectTo?: string
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [imagesDirty, setImagesDirty] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting, isDirty } } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
  });
  const selectedType = watch("propertyType");
  const subTypeOptions = subTypeOptionsFor(selectedType);

  const handleLocationChange = useCallback((loc: { lat: number; lng: number; address: string; city: string; region: string }) => {
    setValue("address", loc.address, { shouldDirty: true })
    setValue("city", loc.city, { shouldDirty: true })
    setValue("region", loc.region, { shouldDirty: true })
    setValue("latitude", loc.lat, { shouldDirty: true })
    setValue("longitude", loc.lng, { shouldDirty: true })
  }, [setValue])

  const buildImagesPayload = useCallback(() => {
    if (!coverUrl) return imageUrls;
    const deduped = [coverUrl, ...imageUrls.filter((u) => u !== coverUrl)];
    return deduped;
  }, [coverUrl, imageUrls]);

  async function onSubmit(data: ListingFormData) {
    setError("");
    if (!coverUrl) {
      setError("Please add a cover photo");
      return;
    }
    const images = buildImagesPayload();
    if (submitOverride) {
      try {
        const payload: Record<string, unknown> = {};
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) payload[key] = value;
        });
        if (typeof payload.features === "string") {
          payload.features = payload.features.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
        payload.images = images;
        payload.coverImage = coverUrl;
        const result = await submitOverride(payload);
        if (!result.success) { setError(result.error || "Failed to create listing"); return }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create listing");
        return;
      }
      router.push(redirectTo || "/dashboard/listings");
      return;
    }
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });
    formData.append("images", JSON.stringify(images));
    formData.append("coverImage", coverUrl);
    try {
      const result = await createProperty(formData);
      if (result && !result.success) { setError(result.error); return }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing");
      return;
    }
    router.push(redirectTo || "/dashboard/listings");
  }

  const handleImageUploadComplete = (urls: string[]) => {
    setImageUrls((prev) => [...prev, ...urls]);
    setImagesDirty(true);
  };

  const handleImageUploadError = (error: string) => {
    setError(error);
  };

  const handleRemoveImage = (url: string) => {
    setImageUrls((prev) => prev.filter((u) => u !== url));
    setImagesDirty(true);
  };

  const handleCoverChange = (url: string | null) => {
    setCoverUrl(url);
    setImagesDirty(true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-label="Create property listing">
      {/* Stitch wizard progress — visual map of the four sections below */}
      <ol aria-label="Listing steps" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {WIZARD_STEPS.map((s) => (
          <li key={s.n} className="rounded-xl border border-border bg-surface px-3 py-2.5">
            <p className="font-heading text-[11px] font-bold uppercase tracking-widest text-primary-600">Step {s.n}</p>
            <p className="truncate text-sm font-semibold text-text-primary">{s.title}</p>
            <p className="truncate text-xs text-text-secondary">{s.hint}</p>
          </li>
        ))}
      </ol>

      {error && <FormBanner variant="error">{error}</FormBanner>}

      {/* Step 1 — Category & Intent */}
      <section aria-labelledby="listing-step-1" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <StepHeader n={1} title="Category & Intent" hint="What are you listing, and why" />
        <div id="listing-step-1" className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="propertyType">Property type</Label>
            <select id="propertyType" className={selectClass} {...register("propertyType", { onChange: () => setValue("subType", "") })}>
              <option value="APARTMENT">Apartment</option>
              <option value="HOUSE">House</option>
              <option value="LAND">Land</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
            {errors.propertyType && <p className="text-xs text-error-500">{errors.propertyType.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="listingPurpose">Listing purpose</Label>
            <select id="listingPurpose" className={selectClass} {...register("listingPurpose")}>
              <option value="">Select purpose</option>
              <option value="FOR_SALE">For Sale</option>
              <option value="FOR_RENT_LONG_TERM">For Rent (long-term)</option>
              <option value="FOR_RENT_SHORT_TERM">For Rent (short-term / Airbnb)</option>
            </select>
            {errors.listingPurpose && <p className="text-xs text-error-500">{errors.listingPurpose.message}</p>}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="subType">Sub-type <span className="font-normal text-text-secondary">(optional)</span></Label>
            <select id="subType" className={selectClass} {...register("subType")}>
              <option value="">Select sub-type</option>
              {subTypeOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Step 2 — Location & Specs */}
      <section aria-labelledby="listing-step-2" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <StepHeader n={2} title="Location & Specs" hint="Where it is and what it offers" />
        <div id="listing-step-2" className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-xs text-error-500">{errors.title.message}</p>}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea id="description" rows={4} className={textareaClass} {...register("description")} />
            {errors.description && <p className="text-xs text-error-500">{errors.description.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input id="price" type="number" step="0.01" {...register("price")} />
            {errors.price && <p className="text-xs text-error-500">{errors.price.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="area">Area (sq ft)</Label>
            <Input id="area" type="number" {...register("area")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Location</Label>
            <LocationPicker onLocationChange={handleLocationChange} />
            <input type="hidden" {...register("city")} />
            <input type="hidden" {...register("region")} />
            <input type="hidden" {...register("address")} />
            <input type="hidden" {...register("latitude")} />
            <input type="hidden" {...register("longitude")} />
            {errors.address && <p className="text-xs text-error-500">{errors.address.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input id="bedrooms" type="number" {...register("bedrooms")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input id="bathrooms" type="number" {...register("bathrooms")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="features">Features <span className="font-normal text-text-secondary">(comma separated)</span></Label>
            <Input id="features" placeholder="Parking, Pool, Garden" {...register("features")} />
          </div>
        </div>
      </section>

      {/* Step 3 — Photos & Amenities */}
      <section aria-labelledby="listing-step-3" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <StepHeader n={3} title="Photos & Amenities" hint="Cover photo plus gallery — buyers see the cover first" />
        <div id="listing-step-3">
          <PropertyImageUploader
            onUploadComplete={handleImageUploadComplete}
            onUploadError={handleImageUploadError}
            onRemoveImage={handleRemoveImage}
            coverUrl={coverUrl}
            onCoverChange={handleCoverChange}
            maxFiles={10}
          />
        </div>
      </section>

      {/* Step 4 — Review & Publish */}
      <section aria-labelledby="listing-step-4" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <StepHeader n={4} title="Review & Publish" hint="Confirm details and go live" />
        <div id="listing-step-4" className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={isSubmitting || (!isDirty && !imagesDirty) || !coverUrl} aria-busy={isSubmitting} title={!coverUrl ? "Add a cover photo" : !isDirty && !imagesDirty ? "Make changes to create listing" : undefined}>
            {isSubmitting ? "Creating..." : "Create listing"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          {!coverUrl && (
            <p className="text-xs text-text-secondary">A cover photo is required before publishing.</p>
          )}
        </div>
      </section>
    </form>
  );
}
