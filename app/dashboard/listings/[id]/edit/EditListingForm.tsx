'use client';

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateProperty } from "@/app/actions/properties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PropertyImageUploader from "@/components/property/PropertyImageUploader";
import dynamic from "next/dynamic";
// Leaflet touches `window` at import time — never SSR the map.
const LocationPicker = dynamic(
  () => import("@/components/shared/LocationPicker").then((m) => m.LocationPicker),
  { ssr: false, loading: () => <p className="text-sm text-text-secondary">Loading map…</p> }
);
import { FormBanner } from "@/components/shared/FormFeedback";
import { SuggestSeoPanel } from "@/components/property/SuggestSeoPanel";
import type { ListingSubmitOverride } from "@/components/dashboard/ListingForm";
import { subTypeOptionsFor } from "@/lib/property-subtypes";

interface EditUnit {
  id?: string;
  configuration: string;
  label?: string | null;
  floor?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  areaUnit?: string | null;
  price?: number | string | null;
  pricePeriod?: string | null;
  listingPurpose?: "FOR_SALE" | "FOR_RENT_LONG_TERM" | "FOR_RENT_SHORT_TERM" | null;
  totalUnits?: number | null;
  availableUnits?: number | null;
  status?: string | null;
}

interface PropertyData {
  title: string;
  description: string;
  price: number | null;
  propertyType: "APARTMENT" | "HOUSE" | "LAND" | "COMMERCIAL";
  listingPurpose?: "FOR_SALE" | "FOR_RENT_LONG_TERM" | "FOR_RENT_SHORT_TERM" | null;
  subType?: string | null;
  city: string;
  region: string;
  address: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  plotSize?: number | null;
  plotSizeUnit?: "SQFT" | "SQM" | "ACRE" | "HECTARE" | null;
  features?: string[];
  images?: string[];
  coverImage?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  hasMultipleUnits?: boolean;
  unitMixDescription?: string | null;
  units?: EditUnit[];
}

interface UnitRow {
  configuration: string;
  label: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  price: string;
  listingPurpose: string;
  totalUnits: string;
  availableUnits: string;
}

const EMPTY_UNIT: UnitRow = {
  configuration: "", label: "", bedrooms: "", bathrooms: "",
  area: "", price: "", listingPurpose: "", totalUnits: "", availableUnits: "",
};

function toUnitRow(u: EditUnit): UnitRow {
  return {
    configuration: u.configuration ?? "",
    label: u.label ?? "",
    bedrooms: u.bedrooms != null ? String(u.bedrooms) : "",
    bathrooms: u.bathrooms != null ? String(u.bathrooms) : "",
    area: u.area != null ? String(u.area) : "",
    price: u.price != null ? String(u.price) : "",
    listingPurpose: u.listingPurpose ?? "",
    totalUnits: u.totalUnits != null ? String(u.totalUnits) : "",
    availableUnits: u.availableUnits != null ? String(u.availableUnits) : "",
  };
}

const listingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().positive("Price must be positive").optional()
  ).nullable(),
  propertyType: z.enum(["APARTMENT", "HOUSE", "LAND", "COMMERCIAL"]),
  listingPurpose: z.enum(["FOR_SALE", "FOR_RENT_LONG_TERM", "FOR_RENT_SHORT_TERM"]).optional(),
  subType: z.string().optional(),
  city: z.string().min(1, "City is required"),
  region: z.string().min(1, "Region is required"),
  address: z.string().min(1, "Address is required"),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  area: z.coerce.number().int().min(0).optional(),
  plotSize: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().positive("Plot size must be positive").optional()
  ).nullable(),
  plotSizeUnit: z.enum(["SQFT", "SQM", "ACRE", "HECTARE"]).optional(),
  features: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  hasMultipleUnits: z.boolean().optional(),
  unitMixDescription: z.string().optional(),
  units: z.array(z.object({
    configuration: z.string().min(1),
    label: z.string().optional(),
    bedrooms: z.coerce.number().int().min(0).optional(),
    bathrooms: z.coerce.number().int().min(0).optional(),
    area: z.coerce.number().int().min(0).optional(),
    price: z.coerce.number().positive().optional(),
    listingPurpose: z.enum(["FOR_SALE", "FOR_RENT_LONG_TERM", "FOR_RENT_SHORT_TERM"]).optional(),
    totalUnits: z.coerce.number().int().min(1).optional(),
    availableUnits: z.coerce.number().int().min(0).optional(),
  })).max(20).optional(),
});
// NOTE: unit rows live in component state (RHF never populates `units`), so
// the "at least one unit" gate runs in onSubmit with visible UI instead of
// a superRefine that would block every multi-unit submit.

export default function EditListingForm({ propertyId, property, redirectTo, submitOverride }: { propertyId: string; property: PropertyData; redirectTo?: string; submitOverride?: ListingSubmitOverride }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const initialCover = property.coverImage ?? property.images?.[0] ?? null;
  const [coverUrl, setCoverUrl] = useState<string | null>(initialCover);
  const [imageUrls, setImageUrls] = useState<string[]>(() => {
    const imgs = property.images || [];
    if (!initialCover) return imgs;
    return imgs.filter((u) => u !== initialCover);
  });

  const [imagesDirty, setImagesDirty] = useState(false)
  const [units, setUnits] = useState<UnitRow[]>(() => (property.units ?? []).map(toUnitRow));
  const [unitsError, setUnitsError] = useState("");
  const [unitsDirty, setUnitsDirty] = useState(false)
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting, isDirty } } = useForm<z.infer<typeof listingSchema>>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: property.title,
      description: property.description,
      price: property.price,
      propertyType: property.propertyType,
      listingPurpose: property.listingPurpose ?? undefined,
      subType: property.subType ?? undefined,
      city: property.city,
      region: property.region,
      address: property.address,
      bedrooms: property.bedrooms ?? undefined,
      bathrooms: property.bathrooms ?? undefined,
      area: property.area ?? undefined,
      plotSize: property.plotSize ?? undefined,
      plotSizeUnit: (["SQFT", "SQM", "ACRE", "HECTARE"] as const).includes(property.plotSizeUnit as "SQFT" | "SQM" | "ACRE" | "HECTARE")
        ? (property.plotSizeUnit as "SQFT" | "SQM" | "ACRE" | "HECTARE")
        : undefined,
      features: property.features?.join(", ") || "",
      latitude: property.latitude ?? undefined,
      longitude: property.longitude ?? undefined,
      hasMultipleUnits: property.hasMultipleUnits ?? false,
      unitMixDescription: property.unitMixDescription ?? undefined,
    },
  });
  const multiUnits = watch("hasMultipleUnits");
  const selectedEditType = watch("propertyType");
  const editSubTypeOptions = subTypeOptionsFor(selectedEditType);

  const handleLocationChange = useCallback((loc: { lat: number; lng: number; address: string; city: string; region: string }) => {
    setValue("address", loc.address, { shouldDirty: true })
    setValue("city", loc.city, { shouldDirty: true })
    setValue("region", loc.region, { shouldDirty: true })
    setValue("latitude", loc.lat, { shouldDirty: true })
    setValue("longitude", loc.lng, { shouldDirty: true })
  }, [setValue])

  const buildImagesPayload = useCallback(() => {
    if (!coverUrl) return imageUrls;
    return [coverUrl, ...imageUrls.filter((u) => u !== coverUrl)];
  }, [coverUrl, imageUrls]);

  const updateUnit = useCallback((index: number, patch: Partial<UnitRow>) => {
    setUnits((prev) => prev.map((u, i) => (i === index ? { ...u, ...patch } : u)));
    setUnitsDirty(true);
  }, []);

  const addUnit = useCallback(() => {
    setUnits((prev) => (prev.length >= 20 ? prev : [...prev, { ...EMPTY_UNIT }]));
    setUnitsDirty(true);
  }, []);

  const removeUnit = useCallback((index: number) => {
    setUnits((prev) => prev.filter((_, i) => i !== index));
    setUnitsDirty(true);
  }, []);

  const buildUnitsPayload = useCallback(() => {
    return units
      .filter((u) => u.configuration !== "")
      .map((u) => {
        const out: Record<string, unknown> = { configuration: u.configuration };
        if (u.label.trim()) out.label = u.label.trim();
        if (u.bedrooms !== "") out.bedrooms = Number(u.bedrooms);
        if (u.bathrooms !== "") out.bathrooms = Number(u.bathrooms);
        if (u.area !== "") out.area = Number(u.area);
        if (u.price !== "") out.price = Number(u.price);
        if (u.listingPurpose) out.listingPurpose = u.listingPurpose;
        if (u.totalUnits !== "") out.totalUnits = Number(u.totalUnits);
        if (u.availableUnits !== "") out.availableUnits = Number(u.availableUnits);
        return out;
      });
  }, [units]);

  async function onSubmit(data: z.infer<typeof listingSchema>) {
    setError("");
    setUnitsError("");
    if (!coverUrl) {
      setError("Please add a cover photo");
      return;
    }
    const unitsPayload = buildUnitsPayload();
    if (data.hasMultipleUnits && unitsPayload.length === 0) {
      setUnitsError("Add at least one unit configuration (e.g. Bedsitter, 1 Bedroom) with its price and specs.");
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
        if (data.hasMultipleUnits) {
          payload.units = unitsPayload;
          if (typeof payload.unitMixDescription === "string" && payload.unitMixDescription.trim() === "") {
            delete payload.unitMixDescription;
          }
        } else {
          payload.hasMultipleUnits = false;
          payload.units = [];
        }
        const result = await submitOverride(payload);
        if (!result.success) { setError(result.error || "Update failed"); return }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update listing");
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
    if (data.hasMultipleUnits) {
      formData.append("units", JSON.stringify(unitsPayload));
    } else if (unitsDirty && units.length === 0 && (property.units ?? []).length > 0) {
      // Toggle switched off after units existed: clear them server-side.
      formData.append("hasMultipleUnits", "false");
      formData.append("units", "[]");
    }
    try {
      const result = await updateProperty(propertyId, formData);
      if (result && !result.success) { setError(result.error || "Update failed"); return }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update listing");
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-label="Edit property listing">
      {error && <FormBanner variant="error">{error}</FormBanner>}

      {/* Step 1 — Category & Intent */}
      <section aria-labelledby="edit-step-1" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 font-heading text-sm font-bold text-white">1</span>
          <div>
            <h2 id="edit-step-1" className="font-heading text-base font-semibold text-text-primary">Step 1 of 4 &middot; Category & Intent</h2>
            <p className="text-sm text-text-secondary">What is listed, and why</p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="propertyType">Property type</Label>
            <select id="propertyType" className="flex min-h-[44px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" {...register("propertyType", { onChange: () => setValue("subType", "") })}>
              <option value="APARTMENT">Apartment</option>
              <option value="HOUSE">House</option>
              <option value="LAND">Land</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
            {errors.propertyType && <p className="text-xs text-error-500">{errors.propertyType.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="listingPurpose">Listing purpose</Label>
            <select id="listingPurpose" className="flex min-h-[44px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" {...register("listingPurpose")}>
              <option value="">Select purpose</option>
              <option value="FOR_SALE">For Sale</option>
              <option value="FOR_RENT_LONG_TERM">For Rent (long-term)</option>
              <option value="FOR_RENT_SHORT_TERM">For Rent (short-term / Airbnb)</option>
            </select>
            {errors.listingPurpose && <p className="text-xs text-error-500">{errors.listingPurpose.message}</p>}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="subType">Sub-type <span className="font-normal text-text-secondary">(optional)</span></Label>
            <select id="subType" className="flex min-h-[44px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" {...register("subType")}>
              <option value="">Select sub-type</option>
              {subTypeOptionsFor(watch("propertyType")).map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          {(watch("propertyType") === "APARTMENT" || watch("propertyType") === "HOUSE" || watch("propertyType") === "COMMERCIAL") && (
            <div className="space-y-2 sm:col-span-2">
              <div className="flex min-h-[44px] items-center gap-3">
                <input
                  id="hasMultipleUnits"
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-primary-600"
                  {...register("hasMultipleUnits")}
                />
                <Label htmlFor="hasMultipleUnits" className="cursor-pointer">
                  This building has multiple unit configurations
                  <span className="block text-xs font-normal text-text-secondary">
                    e.g. bedsitters, 1-bedrooms and penthouses in one block — each with its own price, beds, baths and size
                  </span>
                </Label>
              </div>
            </div>
          )}
          {multiUnits && (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="unitMixDescription">Unit mix summary <span className="font-normal text-text-secondary">(optional — shown to buyers)</span></Label>
              <Input id="unitMixDescription" placeholder="e.g. 4 bedsitters, 6 one-bedrooms, 2 penthouses" {...register("unitMixDescription")} />
            </div>
          )}
        </div>
      </section>

      {/* Step 2 — Location & Specs */}
      <section aria-labelledby="edit-step-2" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 font-heading text-sm font-bold text-white">2</span>
          <div>
            <h2 id="edit-step-2" className="font-heading text-base font-semibold text-text-primary">Step 2 of 4 &middot; Location & Specs</h2>
            <p className="text-sm text-text-secondary">Where it is and what it offers</p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-xs text-error-500">{errors.title.message}</p>}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea id="description" rows={4} className="flex w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" {...register("description")} />
            {errors.description && <p className="text-xs text-error-500">{errors.description.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <SuggestSeoPanel
              propertyId={propertyId}
              getInput={() => {
                const v = watch()
                return {
                  title: v.title || "",
                  propertyType: v.propertyType,
                  listingPurpose: v.listingPurpose || undefined,
                  city: v.city || "",
                  area: v.area != null ? `${v.area} sq ft` : "",
                  price: typeof v.price === "number" ? v.price : null,
                  description: v.description || "",
                  hasMultipleUnits: v.hasMultipleUnits || undefined,
                  unitMixDescription: v.unitMixDescription || undefined,
                }
              }}
            />
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
          <div className="space-y-2">
            <Label htmlFor="plotSize">Plot size <span className="font-normal text-text-secondary">(optional)</span></Label>
            <div className="flex gap-2">
              <Input id="plotSize" type="number" step="0.01" min="0" placeholder="e.g. 2.7" {...register("plotSize")} className="min-w-0 flex-1" />
              <select id="plotSizeUnit" aria-label="Plot size unit" {...register("plotSizeUnit")}
                className="flex min-h-[44px] w-[110px] shrink-0 rounded-lg border border-border bg-surface px-2 py-3 text-base text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                <option value="SQFT">Sq ft</option>
                <option value="SQM">Sq m</option>
                <option value="ACRE">Acres</option>
                <option value="HECTARE">Ha</option>
              </select>
            </div>
            {errors.plotSize && <p className="text-xs text-error-500">{errors.plotSize.message}</p>}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Location</Label>
            <LocationPicker
              initialAddress={property.address}
              initialLat={property.latitude}
              initialLng={property.longitude}
              onLocationChange={handleLocationChange}
            />
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

      {/* Unit configurations — one row per bedsitter / studio / bedroom type in the block */}
      {multiUnits && (
        <section aria-labelledby="edit-units" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 font-heading text-sm font-bold text-white">2</span>
            <div>
              <h2 id="edit-units" className="font-heading text-base font-semibold text-text-primary">Step 2 of 4 &middot; Unit configurations</h2>
              <p className="text-sm text-text-secondary">Each type gets its own beds, baths, size and price</p>
            </div>
          </div>
          <div className="space-y-4">
            {unitsError && <FormBanner variant="error">{unitsError}</FormBanner>}
            {units.map((unit, i) => (
              <fieldset key={i} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-3">
                <legend className="px-1 text-sm font-semibold text-text-primary">Unit {i + 1}</legend>
                <div className="space-y-2">
                  <Label htmlFor={`unit-${i}-configuration`}>Configuration</Label>
                  <select
                    id={`unit-${i}-configuration`}
                    className="flex min-h-[44px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    value={unit.configuration}
                    onChange={(e) => updateUnit(i, { configuration: e.target.value })}
                  >
                    <option value="">Select type</option>
                    {editSubTypeOptions.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`unit-${i}-label`}>Label <span className="font-normal text-text-secondary">(optional)</span></Label>
                  <Input
                    id={`unit-${i}-label`}
                    placeholder="e.g. Block A"
                    value={unit.label}
                    onChange={(e) => updateUnit(i, { label: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`unit-${i}-purpose`}>Purpose <span className="font-normal text-text-secondary">(optional)</span></Label>
                  <select
                    id={`unit-${i}-purpose`}
                    className="flex min-h-[44px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    value={unit.listingPurpose}
                    onChange={(e) => updateUnit(i, { listingPurpose: e.target.value })}
                  >
                    <option value="">Same as listing</option>
                    <option value="FOR_SALE">For Sale</option>
                    <option value="FOR_RENT_LONG_TERM">For Rent (long-term)</option>
                    <option value="FOR_RENT_SHORT_TERM">For Rent (short-term / Airbnb)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`unit-${i}-price`}>Price</Label>
                  <Input
                    id={`unit-${i}-price`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={unit.price}
                    onChange={(e) => updateUnit(i, { price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`unit-${i}-bedrooms`}>Bedrooms</Label>
                  <Input
                    id={`unit-${i}-bedrooms`}
                    type="number"
                    min="0"
                    value={unit.bedrooms}
                    onChange={(e) => updateUnit(i, { bedrooms: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`unit-${i}-bathrooms`}>Bathrooms</Label>
                  <Input
                    id={`unit-${i}-bathrooms`}
                    type="number"
                    min="0"
                    value={unit.bathrooms}
                    onChange={(e) => updateUnit(i, { bathrooms: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`unit-${i}-area`}>Size (sq m)</Label>
                  <Input
                    id={`unit-${i}-area`}
                    type="number"
                    min="0"
                    value={unit.area}
                    onChange={(e) => updateUnit(i, { area: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`unit-${i}-total`}>Total units <span className="font-normal text-text-secondary">(optional)</span></Label>
                  <Input
                    id={`unit-${i}-total`}
                    type="number"
                    min="1"
                    placeholder="e.g. 6"
                    value={unit.totalUnits}
                    onChange={(e) => updateUnit(i, { totalUnits: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`unit-${i}-available`}>Available <span className="font-normal text-text-secondary">(optional)</span></Label>
                  <Input
                    id={`unit-${i}-available`}
                    type="number"
                    min="0"
                    placeholder="e.g. 2"
                    value={unit.availableUnits}
                    onChange={(e) => updateUnit(i, { availableUnits: e.target.value })}
                  />
                </div>
                <div className="flex items-end sm:col-span-3">
                  <Button type="button" variant="outline" onClick={() => removeUnit(i)} aria-label={`Remove unit ${i + 1}`}>
                    Remove unit
                  </Button>
                </div>
              </fieldset>
            ))}
            {units.length < 20 && (
              <Button type="button" variant="outline" onClick={addUnit}>
                {units.length === 0 ? "Add first unit configuration" : "Add another configuration"}
              </Button>
            )}
          </div>
        </section>
      )}

      {/* Step 3 — Photos */}
      <section aria-labelledby="edit-step-3" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 font-heading text-sm font-bold text-white">3</span>
          <div>
            <h2 id="edit-step-3" className="font-heading text-base font-semibold text-text-primary">Step 3 of 4 &middot; Photos</h2>
            <p className="text-sm text-text-secondary">Cover photo plus gallery</p>
          </div>
        </div>
        <PropertyImageUploader
          onUploadComplete={handleImageUploadComplete}
          onUploadError={handleImageUploadError}
          onRemoveImage={handleRemoveImage}
          coverUrl={coverUrl}
          onCoverChange={handleCoverChange}
          maxFiles={10}
          initialUrls={imageUrls}
        />
      </section>

      {/* Step 4 — Review & Save */}
      <section aria-labelledby="edit-step-4" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 font-heading text-sm font-bold text-white">4</span>
          <div>
            <h2 id="edit-step-4" className="font-heading text-base font-semibold text-text-primary">Step 4 of 4 &middot; Review & Save</h2>
            <p className="text-sm text-text-secondary">Confirm details and save changes</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={isSubmitting || (!isDirty && !imagesDirty && !unitsDirty) || !coverUrl} aria-busy={isSubmitting} title={!coverUrl ? "Add a cover photo" : !isDirty && !imagesDirty && !unitsDirty ? "No changes to save" : undefined}>
            {isSubmitting ? "Updating..." : "Update listing"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </section>
    </form>
  );
}
