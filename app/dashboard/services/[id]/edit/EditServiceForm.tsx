"use client";

import { useState, useCallback, useRef, useId } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, X } from "lucide-react";
import { api } from "@/lib/api-client";

interface Category {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
}

interface ServiceData {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  price?: number | null;
  currency: string;
  pricePeriod: string;
  location?: string | null;
  city?: string | null;
  region?: string | null;
  images?: string[];
  category: { id: string; name: string; slug: string };
}

const CURRENCIES = ["KES", "USD"] as const;
const PRICE_PERIODS = ["TOTAL", "PER_MONTH", "PER_NIGHT", "PER_WEEK", "PER_SQM"] as const;

export function EditServiceForm({
  service,
  categories,
}: {
  service: ServiceData;
  categories: Category[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const initialImages: string[] = Array.isArray(service.images)
    ? service.images
    : [];
  const [imageUrls, setImageUrls] = useState<string[]>(initialImages);
  const [imagePreviews, setImagePreviews] =
    useState<string[]>(initialImages);

  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      if (imageUrls.length + files.length > 10) {
        setError("Maximum 10 images allowed");
        return;
      }

      for (const file of files) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          setError(`Invalid type: ${file.name}. Only JPEG, PNG, WebP.`);
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          setError(`${file.name} is too large. Max 10MB.`);
          return;
        }
      }

      setError("");
      setUploading(true);

      const urls: string[] = [];

      for (const file of files) {
        try {
          const preview = URL.createObjectURL(file);

          const signRes = await api.post<{
            signature: string;
            timestamp: number;
            apiKey: string;
            cloudName: string;
          }>("/api/uploadthing/sign", { folder: "allpropertylink/services" });
          if (signRes.error || !signRes.data)
            throw new Error(signRes.error || "Failed to get upload signature");

          const { signature, timestamp, apiKey, cloudName } = signRes.data;
          const fd = new FormData();
          fd.append("file", file);
          fd.append("api_key", apiKey);
          fd.append("timestamp", String(timestamp));
          fd.append("signature", signature);
          fd.append("folder", "allpropertylink/services");

          const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: "POST", body: fd }
          );
          if (!uploadRes.ok) {
            const text = await uploadRes.text().catch(() => "");
            throw new Error(
              `Cloudinary ${uploadRes.status}: ${text.slice(0, 200)}`
            );
          }
          const result = await uploadRes.json();
          if (!result.secure_url)
            throw new Error("No URL returned from Cloudinary");

          urls.push(result.secure_url);
          setImagePreviews((prev) => [...prev, preview]);
          setImageUrls((prev) => [...prev, result.secure_url]);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Upload failed";
          setError(`${file.name}: ${msg}`);
          setUploading(false);
          if (inputRef.current) inputRef.current.value = "";
          return;
        }
      }

      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    },
    [imageUrls.length]
  );

  const handleRemoveImage = useCallback((index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      const entry = prev[index];
      if (entry?.startsWith("blob:")) URL.revokeObjectURL(entry);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {
      categoryId: fd.get("categoryId") as string,
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      currency: fd.get("currency") as string,
      pricePeriod: fd.get("pricePeriod") as string,
      city: fd.get("city") as string,
    };

    const price = fd.get("price") as string;
    if (price) data.price = price;

    const region = fd.get("region") as string;
    if (region) data.region = region;

    const location = fd.get("location") as string;
    if (location) data.location = location;

    if (imageUrls.length > 0) data.images = imageUrls;

    try {
      const res = await api.patch<{ service: unknown }>(
        `/api/services/${service.id}`,
        data
      );
      if (res.error) {
        setError(res.error);
        setSubmitting(false);
        return;
      }
      router.push("/dashboard/services");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update service");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label
            htmlFor="categoryId"
            className="text-sm font-medium text-text-primary"
          >
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={service.categoryId}
            className="flex h-12 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <optgroup key={cat.id} label={cat.name}>
                {cat.children.length > 0
                  ? cat.children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name}
                      </option>
                    ))
                  : (
                    <option value={cat.id}>{cat.name}</option>
                  )}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label
            htmlFor="title"
            className="text-sm font-medium text-text-primary"
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            minLength={3}
            defaultValue={service.title}
            className="flex h-12 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label
            htmlFor="description"
            className="text-sm font-medium text-text-primary"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            minLength={10}
            defaultValue={service.description}
            className="flex w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="price"
            className="text-sm font-medium text-text-primary"
          >
            Price <span className="text-text-secondary">(optional)</span>
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={service.price ? Number(service.price) : ""}
            className="flex h-12 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="currency"
            className="text-sm font-medium text-text-primary"
          >
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            defaultValue={service.currency}
            className="flex h-12 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="pricePeriod"
            className="text-sm font-medium text-text-primary"
          >
            Price period
          </label>
          <select
            id="pricePeriod"
            name="pricePeriod"
            defaultValue={service.pricePeriod}
            className="flex h-12 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            {PRICE_PERIODS.map((p) => (
              <option key={p} value={p}>
                {p.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="city"
            className="text-sm font-medium text-text-primary"
          >
            City
          </label>
          <input
            id="city"
            name="city"
            type="text"
            required
            defaultValue={service.city || ""}
            className="flex h-12 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="region"
            className="text-sm font-medium text-text-primary"
          >
            Region <span className="text-text-secondary">(optional)</span>
          </label>
          <input
            id="region"
            name="region"
            type="text"
            defaultValue={service.region || ""}
            className="flex h-12 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label
            htmlFor="location"
            className="text-sm font-medium text-text-primary"
          >
            Location <span className="text-text-secondary">(optional)</span>
          </label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="e.g. Westlands, Nairobi"
            defaultValue={service.location || ""}
            className="flex h-12 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-text-primary">Service Images</h2>

        {imagePreviews.length < 10 && (
          <>
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <label
              htmlFor={inputId}
              className="block cursor-pointer border-2 border-dashed rounded-lg bg-surface-secondary p-6 text-center hover:border-primary-500 transition-border"
            >
              <div className="flex flex-col items-center gap-3 pointer-events-none">
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                ) : (
                  <Upload className="h-8 w-8 text-primary-500" />
                )}
                <span className="text-sm text-text-primary">
                  {uploading ? "Uploading..." : "Click to upload images"}
                </span>
              </div>
            </label>
          </>
        )}

        {imagePreviews.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-3">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt="Service image"
                  className="rounded-lg w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 rounded-full bg-error-500/80 p-1 text-white hover:bg-error-500 transition-colors"
                  aria-label="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-3 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Updating..." : "Update service"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="touch-target rounded-lg border border-border px-5 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
