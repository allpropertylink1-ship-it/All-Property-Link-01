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
import { LocationPicker } from "@/components/shared/LocationPicker";

interface PropertyData {
  title: string;
  description: string;
  price: number;
  propertyType: "APARTMENT" | "HOUSE" | "LAND" | "COMMERCIAL";
  city: string;
  region: string;
  address: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  features?: string[];
  images?: string[];
  latitude?: number | null;
  longitude?: number | null;
}

const listingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  propertyType: z.enum(["APARTMENT", "HOUSE", "LAND", "COMMERCIAL"]),
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

export default function EditListingForm({ propertyId, property }: { propertyId: string; property: PropertyData }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>(property.images || []);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<z.infer<typeof listingSchema>>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: property.title,
      description: property.description,
      price: property.price,
      propertyType: property.propertyType,
      city: property.city,
      region: property.region,
      address: property.address,
      bedrooms: property.bedrooms ?? undefined,
      bathrooms: property.bathrooms ?? undefined,
      area: property.area ?? undefined,
      features: property.features?.join(", ") || "",
      latitude: property.latitude ?? undefined,
      longitude: property.longitude ?? undefined,
    },
  });

  const handleLocationChange = useCallback((loc: { lat: number; lng: number; address: string; city: string; region: string }) => {
    setValue("address", loc.address)
    setValue("city", loc.city)
    setValue("region", loc.region)
    setValue("latitude", loc.lat)
    setValue("longitude", loc.lng)
  }, [setValue])

  async function onSubmit(data: z.infer<typeof listingSchema>) {
    setError("");
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });
    formData.append("images", JSON.stringify(imageUrls));
    try {
      const result = await updateProperty(propertyId, formData);
      if (result && !result.success) { setError(result.error); return }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update listing");
      return;
    }
    router.push("/dashboard/listings");
  }

  const handleImageUploadComplete = (urls: string[]) => {
    setImageUrls((prev) => [...prev, ...urls]);
  };

  const handleImageUploadError = (error: string) => {
    setError(error);
  };

  const handleRemoveImage = (url: string) => {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <div className="rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">{error}</div>}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register("title")} />
          {errors.title && <p className="text-xs text-error-500">{errors.title.message}</p>}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea id="description" rows={4} className="flex w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" {...register("description")} />
          {errors.description && <p className="text-xs text-error-500">{errors.description.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input id="price" type="number" step="0.01" {...register("price")} />
          {errors.price && <p className="text-xs text-error-500">{errors.price.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="propertyType">Property type</Label>
          <select id="propertyType" className="flex h-12 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" {...register("propertyType")}>
            <option value="APARTMENT">Apartment</option>
            <option value="HOUSE">House</option>
            <option value="LAND">Land</option>
            <option value="COMMERCIAL">Commercial</option>
          </select>
          {errors.propertyType && <p className="text-xs text-error-500">{errors.propertyType.message}</p>}
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
        <div className="space-y-2">
          <Label htmlFor="area">Area (sq ft)</Label>
          <Input id="area" type="number" {...register("area")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="features">Features <span className="text-text-secondary">(comma separated)</span></Label>
        <Input id="features" placeholder="Parking, Pool, Garden" {...register("features")} />
      </div>
      <div className="space-y-6">
        <h2 className="font-semibold text-text-primary">Property Images</h2>
        <PropertyImageUploader 
          onUploadComplete={handleImageUploadComplete}
          onUploadError={handleImageUploadError}
          onRemoveImage={handleRemoveImage}
          maxFiles={10}
          initialUrls={property.images}
        />
      </div>
      <div className="flex items-center gap-4 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update listing"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}