/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useCallback, useRef, useId } from "react";
import { uploadImage, HEIC_HINT, isHeicFile } from "@/lib/image-client";
import { useRouter } from "next/navigation";
import { Upload, Loader2, X } from "@/components/ui/icons";
import { api } from "@/lib/api-client";
import { FormBanner } from "@/components/shared/FormFeedback";
import ImageCropQueue from "@/components/shared/ImageCropQueue";
import ServiceShelfPicker from "@/components/dashboard/ServiceShelfPicker";

interface Category {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
}

interface ServiceData {
  id: string;
  categoryId: string;
  categories?: { id: string; name: string; slug: string }[];
  title: string;
  description: string;
  price?: number | null;
  pricePeriod: string;
  shelfPrices?: { categoryId: string; price: number }[] | null;
  coverImage?: string | null;
  location?: string | null;
  city?: string | null;
  region?: string | null;
  images?: string[];
  category: { id: string; name: string; slug: string };
}

const PRICE_PERIODS = ["TOTAL", "PER_MONTH", "PER_NIGHT", "PER_WEEK", "PER_SQM"] as const;

export function EditServiceForm({
  service,
  categories,
  endpoint,
  redirectTo,
}: {
  service: ServiceData;
  categories: Category[];
  /** Override for non-owner submits (e.g. APL reps editing for a referral). */
  endpoint?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const initialImages: string[] = Array.isArray(service.images)
    ? service.images
    : [];
  const [imageUrls, setImageUrls] = useState<string[]>(initialImages);
  const [imagePreviews, setImagePreviews] =
    useState<string[]>(initialImages);

  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const initialShelves =
    Array.isArray(service.categories) && service.categories.length > 0
      ? service.categories.map((c) => c.id)
      : [service.categoryId];
  const [shelfIds, setShelfIds] = useState<string[]>(initialShelves);
  const [shelfPrices, setShelfPrices] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (Array.isArray(service.shelfPrices)) {
      for (const row of service.shelfPrices) {
        if (row && typeof row.categoryId === "string") init[row.categoryId] = String(row.price ?? "");
      }
    }
    return init;
  });
  const [coverUrl, setCoverUrl] = useState<string | null>(service.coverImage || null);
  const [coverCleared, setCoverCleared] = useState(false);

  function shelfLabel(id: string): string {
    for (const c of categories) {
      if (c.id === id) return c.name;
      const hit = c.children.find((ch) => ch.id === id);
      if (hit) return `${c.name} — ${hit.name}`;
    }
    return "Shelf";
  }
  // Optional pre-upload crop step (see PropertyImageUploader for the pattern).
  const [queue, setQueue] = useState<File[] | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const coverInputId = useId();
  const [coverUploading, setCoverUploading] = useState(false);

  function validImageFile(file: File): string | null {
    if (isHeicFile(file)) return `${file.name}: ${HEIC_HINT}`;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return `Invalid type: ${file.name}. Only JPEG, PNG, WebP.`;
    }
    if (file.size > 10 * 1024 * 1024) return `${file.name} is too large. Max 10MB.`;
    return null;
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const problem = validImageFile(file);
    if (problem) {
      setError(problem);
      e.target.value = "";
      return;
    }
    setError("");
    setCoverUploading(true);
    try {
      const url = await uploadImage(file, "services");
      setCoverUrl(url);
      setCoverCleared(false);
      setIsDirty(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cover upload failed");
    } finally {
      setCoverUploading(false);
      e.target.value = "";
    }
  }

  function removeCover() {
    setCoverUrl(null);
    setCoverCleared(true);
    setIsDirty(true);
    if (coverInputRef.current) coverInputRef.current.value = "";
  }

  const uploadQueuedFiles = useCallback(
    async (files: File[]) => {
      setError("");
      setUploading(true);
      setIsDirty(true);

      const urls: string[] = [];

      for (const file of files) {
        try {
          const preview = URL.createObjectURL(file);

                    const url = await uploadImage(file, "services");
          urls.push(url);
          setImagePreviews((prev) => [...prev, preview]);
          setImageUrls((prev) => [...prev, url]);
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
    []
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      if (imageUrls.length + files.length > 10) {
        setError("Maximum 10 images allowed");
        return;
      }

      for (const file of files) {
        if (isHeicFile(file)) { setError(`${file.name}: ${HEIC_HINT}`); return; }
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
      setQueue(files);
    },
    [imageUrls.length]
  );

  const handleQueueDone = useCallback(
    (files: File[]) => {
      setQueue(null);
      if (files.length > 0) void uploadQueuedFiles(files);
      else if (inputRef.current) inputRef.current.value = "";
    },
    [uploadQueuedFiles]
  );

  const handleQueueCancel = useCallback(() => {
    setQueue(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setImageUrls((prev) => {
      const removed = prev[index];
      if (removed) {
        setCoverUrl((cur) => {
          if (cur === removed) {
            setCoverCleared(true);
            return null;
          }
          return cur;
        });
      }
      return prev.filter((_, i) => i !== index);
    });
    setImagePreviews((prev) => {
      const entry = prev[index];
      if (entry?.startsWith("blob:")) URL.revokeObjectURL(entry);
      return prev.filter((_, i) => i !== index);
    });
    setIsDirty(true);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    if (shelfIds.length === 0) {
      setError("Tick at least one sector shelf for this advert.");
      setSubmitting(false);
      return;
    }
    const data: Record<string, unknown> = {
      categoryId: shelfIds[0],
      categoryIds: shelfIds,
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      pricePeriod: fd.get("pricePeriod") as string,
      city: fd.get("city") as string,
    };

    // Price is optional: empty clears it. Always KES.
    const price = fd.get("price") as string;
    data.price = price || null;

    const shelfPriceEntries = Object.entries(shelfPrices)
      .filter(([, p]) => p.trim() !== "" && Number.isFinite(Number(p)) && Number(p) >= 0)
      .map(([categoryId, p]) => ({ categoryId, price: Number(p) }));
    data.shelfPrices = shelfPriceEntries;
    if (coverUrl) data.coverImage = coverUrl;
    else if (coverCleared) data.coverImage = null;

    const region = fd.get("region") as string;
    if (region) data.region = region;

    const location = fd.get("location") as string;
    if (location) data.location = location;

    if (imageUrls.length > 0) data.images = imageUrls;

    try {
      const res = await api.patch<{ service: unknown }>(
        endpoint ?? `/api/services/${service.id}`,
        data
      );
      if (res.error) {
        setError(res.error);
        setSubmitting(false);
        return;
      }
      router.push(redirectTo || "/dashboard/services");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update service");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} onChange={() => setIsDirty(true)} className="space-y-6" aria-label="Edit service listing">
{error && (
        <FormBanner variant="error">{error}</FormBanner>
      )}
      {queue && (
        <ImageCropQueue
          files={queue}
          label={(i, n) => `Photo ${i + 1} of ${n}`}
          guidance="Frame each shot. Cropping is optional — keep the original if it already looks right."
          context="service-images"
          onDone={handleQueueDone}
          onCancel={handleQueueCancel}
        />
      )}

      {/* Section 1 — Service details */}
      <section aria-labelledby="svc-edit-details" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 font-heading text-sm font-bold text-white">1</span>
          <div>
            <h2 id="svc-edit-details" className="font-heading text-base font-semibold text-text-primary">Step 1 of 4 &middot; Service Details</h2>
            <p className="text-sm text-text-secondary">Category, title, and description</p>
          </div>
        </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <ServiceShelfPicker
            categories={categories}
            value={shelfIds}
            onChange={(next) => {
              setShelfIds(next);
              setShelfPrices((prev) => {
                const kept: Record<string, string> = {};
                for (const id of next) if (prev[id] !== undefined) kept[id] = prev[id];
                return kept;
              });
              setIsDirty(true);
            }}
          />
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
            className="flex w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>
      </section>

      {/* Section 2 — Pricing & location */}
      <section aria-labelledby="svc-edit-pricing" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 font-heading text-sm font-bold text-white">2</span>
          <div>
            <h2 id="svc-edit-pricing" className="font-heading text-base font-semibold text-text-primary">Step 2 of 4 &middot; Pricing & Location</h2>
            <p className="text-sm text-text-secondary">What it costs and where it is offered</p>
          </div>
        </div>
      <div className="grid gap-6 sm:grid-cols-2">

        <div className="space-y-2">
          <label
            htmlFor="price"
            className="text-sm font-medium text-text-primary"
          >
            Overall price (KES) <span className="text-text-secondary">(optional)</span>
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="Leave empty for no price"
            defaultValue={service.price ? Number(service.price) : ""}
            className="flex h-12 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          <p className="text-xs text-text-secondary">All prices are in Kenya Shillings (KES). Applies to every ticked shelf unless overridden below.</p>
        </div>

        {shelfIds.length > 1 && (
          <div className="space-y-3 sm:col-span-2 rounded-xl border border-border bg-surface-secondary/40 p-4">
            <p className="text-sm font-medium text-text-primary">
              Price per shelf <span className="font-normal text-text-secondary">(optional — leave empty to use the overall price)</span>
            </p>
            {shelfIds.map((id) => (
              <div key={id} className="grid grid-cols-[1fr_140px] items-center gap-3">
                <label htmlFor={`shelf-price-${id}`} className="truncate text-sm text-text-secondary">
                  {shelfLabel(id)}
                </label>
                <input
                  id={`shelf-price-${id}`}
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  value={shelfPrices[id] || ""}
                  onChange={(e) => setShelfPrices((prev) => ({ ...prev, [id]: e.target.value }))}
                  placeholder="KES"
                  aria-label={`Price in KES for ${shelfLabel(id)}`}
                  className="flex h-12 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            ))}
          </div>
        )}

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
      </section>

      {/* Section 3 — Photos */}
      <section aria-labelledby="svc-edit-photos" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 font-heading text-sm font-bold text-white">3</span>
          <div>
            <h2 id="svc-edit-photos" className="font-heading text-base font-semibold text-text-primary">Step 3 of 4 &middot; Photos</h2>
            <p className="text-sm text-text-secondary">One cover photo customers see first, plus up to 10 gallery photos of your work</p>
          </div>
        </div>
      <div className="space-y-6">

        <div className="space-y-3">
          <p className="text-sm font-medium text-text-primary">
            Cover photo <span className="font-normal text-text-secondary">(optional — shown first to customers)</span>
          </p>
          <input
            ref={coverInputRef}
            id={coverInputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleCoverChange}
            disabled={coverUploading}
          />
          {coverUrl ? (
            <div className="relative w-full max-w-sm overflow-hidden rounded-xl border border-border bg-surface">
              <img src={coverUrl} alt="Cover photo" className="h-48 w-full object-cover" />
              <span className="absolute top-3 left-3 rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white">
                Cover
              </span>
              <div className="flex gap-2 p-3">
                <label
                  htmlFor={coverInputId}
                  className="touch-target inline-flex min-h-[44px] cursor-pointer items-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
                >
                  {coverUploading ? "Uploading..." : "Change"}
                </label>
                <button
                  type="button"
                  onClick={removeCover}
                  className="touch-target inline-flex min-h-[44px] items-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-error-500 transition-colors hover:bg-error-500/10"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label
              htmlFor={coverInputId}
              className="touch-target block w-full max-w-sm cursor-pointer rounded-xl border-2 border-dashed bg-surface-secondary p-6 text-center transition-colors hover:border-primary-500"
            >
              <div className="pointer-events-none flex flex-col items-center gap-2">
                {coverUploading ? (
                  <Loader2 className="h-7 w-7 animate-spin text-primary-500" />
                ) : (
                  <Upload className="h-7 w-7 text-primary-500" />
                )}
                <span className="text-sm font-medium text-text-primary">
                  {coverUploading ? "Uploading..." : "Click to upload cover photo"}
                </span>
                <span className="text-xs text-text-secondary">JPEG, PNG, WebP — Max 10MB</span>
              </div>
            </label>
          )}
        </div>

        <div className="space-y-3 border-t border-border pt-6">
          <p className="text-sm font-medium text-text-primary">
            Gallery photos <span className="font-normal text-text-secondary">(up to 10)</span>
          </p>
      <div className="space-y-4">

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
              className="touch-target block cursor-pointer border-2 border-dashed rounded-xl bg-surface-secondary p-6 text-center hover:border-primary-500 transition-colors"
            >
              <div className="flex flex-col items-center gap-3 pointer-events-none">
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                ) : (
                  <Upload className="h-8 w-8 text-primary-500" />
                )}
                <span className="text-sm font-medium text-text-primary">
                  {uploading ? "Uploading..." : "Click to upload gallery photos"}
                </span>
                <span className="text-xs text-text-secondary">JPEG, PNG, WebP — Max 10MB each</span>
              </div>
            </label>
          </>
        )}

        {imagePreviews.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-3" role="list" aria-label="Gallery photos">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group rounded-xl border border-border bg-surface p-2" role="listitem">
                <img
                  src={preview}
                  alt="Gallery photo"
                  className="rounded-lg w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="touch-target absolute top-3 right-3 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-error-500/80 text-white hover:bg-error-500 transition-colors"
                  aria-label="Remove gallery photo"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        </div>
        </div>
      </div>
      </section>

      {/* Section 4 — Review & save */}
      <section aria-labelledby="svc-edit-review" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 font-heading text-sm font-bold text-white">4</span>
          <div>
            <h2 id="svc-edit-review" className="font-heading text-base font-semibold text-text-primary">Step 4 of 4 &middot; Review & Save</h2>
            <p className="text-sm text-text-secondary">Confirm details and save changes</p>
          </div>
        </div>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="touch-target order-2 rounded-xl border-2 border-border bg-surface px-6 py-3 text-sm font-semibold text-text-primary shadow-sm transition-colors hover:border-primary-400 hover:bg-surface-secondary sm:order-1"
        >
          Cancel
        </button>
        <button
 type="submit"
          disabled={submitting || !isDirty}
          aria-busy={submitting}
          title={!isDirty ? "No changes to save" : undefined}
          className="touch-target order-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-8 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-primary-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:order-2"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Updating..." : "Update service"}
        </button>
      </div>
      </section>
    </form>
  );
}
