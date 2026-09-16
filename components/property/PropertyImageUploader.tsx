/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useCallback, useRef, useId } from "react";
import { uploadImage, HEIC_HINT, isHeicFile } from "@/lib/image-client";
import { Upload, Loader2, X } from "@/components/ui/icons";
import { FormBanner } from "@/components/shared/FormFeedback";

interface PropertyImageUploaderProps {
  onUploadComplete: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  onRemoveImage?: (url: string) => void;
  maxFiles?: number;
  initialUrls?: string[];
  coverUrl?: string | null;
  onCoverChange?: (url: string | null) => void;
}

const VALID_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;
const GALLERY_MAX = 9;

export default function PropertyImageUploader({
  onUploadComplete,
  onUploadError,
  onRemoveImage,
  maxFiles = 10,
  initialUrls,
  coverUrl = null,
  onCoverChange,
}: PropertyImageUploaderProps) {
  const [entries, setEntries] = useState<Array<{ preview: string; url: string }>>(
    () => initialUrls?.map((url) => ({ preview: url, url })) || []
  );
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const coverInputId = useId();

  const totalCount = (coverUrl ? 1 : 0) + entries.length;
  const galleryCount = entries.length;

  const validateFiles = (files: File[]): string | null => {
    for (const file of files) {
      if (isHeicFile(file)) return `${file.name}: ${HEIC_HINT}`;
      if (!VALID_TYPES.includes(file.type)) return `Invalid type: ${file.name}. Only JPEG, PNG, WebP.`;
      if (file.size > MAX_SIZE) return `${file.name} is too large. Max 10MB.`;
    }
    return null;
  };

  const handleCoverFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      const file = files[0];
      const validation = validateFiles([file]);
      if (validation) { setError(validation); if (coverInputRef.current) coverInputRef.current.value = ""; return; }
      setError(null);
      setCoverUploading(true);
      try {
        const preview = URL.createObjectURL(file);
        void preview;
        const url = await uploadImage(file, "properties");
        onCoverChange?.(url);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setError(`${file.name}: ${msg}`);
        onUploadError?.(msg);
      } finally {
        setCoverUploading(false);
        if (coverInputRef.current) coverInputRef.current.value = "";
      }
    },
    [onCoverChange, onUploadError]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      if (totalCount + files.length > maxFiles) {
        setError(`Maximum ${maxFiles} images allowed (1 cover + ${GALLERY_MAX} gallery)`);
        return;
      }
      if (galleryCount + files.length > GALLERY_MAX) {
        setError(`Gallery max ${GALLERY_MAX} images. Remove some to add more.`);
        return;
      }
      const validation = validateFiles(files);
      if (validation) { setError(validation); return; }
      setError(null);
      setUploading(true);
      const urls: string[] = [];
      for (const file of files) {
        try {
          const preview = URL.createObjectURL(file);
          const url = await uploadImage(file, "properties");
          urls.push(url);
          setEntries((prev) => [...prev, { preview, url }]);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Upload failed";
          setError(`${file.name}: ${msg}`);
          onUploadError?.(msg);
          setUploading(false);
          if (inputRef.current) inputRef.current.value = "";
          return;
        }
      }
      if (urls.length > 0) onUploadComplete(urls);
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    },
    [maxFiles, totalCount, galleryCount, onUploadComplete, onUploadError]
  );

  const handleRemove = useCallback(
    (url: string) => {
      setEntries((prev) => {
        const entry = prev.find((e) => e.url === url);
        if (entry && entry.preview.startsWith("blob:")) URL.revokeObjectURL(entry.preview);
        return prev.filter((e) => e.url !== url);
      });
      onRemoveImage?.(url);
    },
    [onRemoveImage]
  );

  const handleRemoveCover = useCallback(() => {
    // delete promotes next gallery image per contract
    if (entries.length > 0) {
      const next = entries[0];
      setEntries((prev) => {
        const remaining = prev.slice(1);
        return remaining;
      });
      onRemoveImage?.(next.url);
      onCoverChange?.(next.url);
    } else {
      onCoverChange?.(null);
    }
  }, [entries, onCoverChange, onRemoveImage]);

  const handleSetAsCover = useCallback(
    (url: string) => {
      const oldCover = coverUrl;
      // remove from gallery
      setEntries((prev) => {
        const entry = prev.find((e) => e.url === url);
        if (entry && entry.preview.startsWith("blob:")) URL.revokeObjectURL(entry.preview);
        return prev.filter((e) => e.url !== url);
      });
      onRemoveImage?.(url);
      onCoverChange?.(url);
      // old cover goes to gallery if present
      if (oldCover) {
        setEntries((prev) => [...prev, { preview: oldCover, url: oldCover }]);
        onUploadComplete([oldCover]);
      }
    },
    [coverUrl, onCoverChange, onRemoveImage, onUploadComplete]
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-text-secondary">
        Upload up to 10 images — 1 cover + up to 9 gallery (JPEG, PNG, WebP). Max 10MB each. iPhone: set Photos to Most Compatible.
      </p>

      {error && (
        <div role="alert"><FormBanner variant="error">{error}</FormBanner></div>
      )}

      {/* Section A: Cover photo */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-text-primary">Cover photo</h3>
        <input
          ref={coverInputRef}
          id={coverInputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleCoverFileChange}
          disabled={coverUploading}
        />
        {coverUrl ? (
          <div className="relative w-full max-w-sm">
            <img src={coverUrl} alt="Cover photo" className="rounded-lg w-full h-48 object-cover border border-border" />
            <span className="absolute left-2 top-2 rounded-full bg-primary-600 px-2 py-0.5 text-xs font-semibold text-white">Cover</span>
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={() => coverInputRef.current?.click()} disabled={coverUploading} className="min-h-[44px] rounded-lg border border-border bg-surface px-4 text-sm font-medium hover:bg-surface-secondary disabled:opacity-50">
                {coverUploading ? "Uploading..." : "Replace"}
              </button>
              <button type="button" onClick={handleRemoveCover} className="min-h-[44px] rounded-lg border border-error-500 px-4 text-sm font-medium text-error-600 hover:bg-error-50">
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label htmlFor={coverInputId} className="flex min-h-[44px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-surface-secondary p-6 text-center hover:border-primary-500">
            <div className="flex flex-col items-center gap-2 pointer-events-none">
              {coverUploading ? <Loader2 className="h-8 w-8 animate-spin text-primary-500" /> : <Upload className="h-8 w-8 text-primary-500" />}
              <span className="text-sm text-text-primary">{coverUploading ? "Uploading..." : "Click to upload cover photo"}</span>
              <span className="text-xs text-text-secondary">JPEG, PNG, WebP — Max 10MB</span>
            </div>
          </label>
        )}
      </div>

      {/* Section B: Gallery photos */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-text-primary">Gallery photos <span className="font-normal text-text-secondary">({galleryCount}/{GALLERY_MAX})</span></h3>
        {galleryCount < GALLERY_MAX && totalCount < maxFiles ? (
          <>
            <input ref={inputRef} id={inputId} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} disabled={uploading} />
            <label htmlFor={inputId} className="block cursor-pointer rounded-lg border-2 border-dashed bg-surface-secondary p-6 text-center hover:border-primary-500">
              <div className="flex flex-col items-center gap-3 pointer-events-none">
                {uploading ? <Loader2 className="h-8 w-8 animate-spin text-primary-500" /> : <Upload className="h-8 w-8 text-primary-500" />}
                <span className="text-sm text-text-primary">{uploading ? "Uploading..." : "Click to upload gallery photos"}</span>
              </div>
            </label>
          </>
        ) : (
          <div className="rounded-lg bg-surface-secondary px-4 py-3 text-sm text-text-secondary text-center">Gallery full ({GALLERY_MAX} max). Remove some to upload more.</div>
        )}

        {entries.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-3">
            {entries.map((entry) => (
              <div key={entry.url} className="relative group">
                <img src={entry.preview} alt="Gallery image" className="rounded-lg w-full h-48 object-cover" />
                <button type="button" onClick={() => handleRemove(entry.url)} className="absolute right-2 top-2 min-h-[44px] min-w-[44px] rounded-full bg-error-500/80 p-1 text-white hover:bg-error-500 flex items-center justify-center" aria-label="Remove image">
                  <X size={14} />
                </button>
                <button type="button" onClick={() => handleSetAsCover(entry.url)} className="absolute bottom-2 left-2 min-h-[44px] rounded-full bg-surface/90 px-3 text-xs font-medium text-text-primary hover:bg-surface border border-border">
                  Set as cover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
