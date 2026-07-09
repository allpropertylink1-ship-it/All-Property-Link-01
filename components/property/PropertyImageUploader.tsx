'use client';

import { useState, useCallback, ChangeEvent, useRef } from "react";
import { Upload, Loader2, X } from "lucide-react";

interface PropertyImageUploaderProps {
  onUploadComplete: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  onRemoveImage?: (url: string) => void;
  maxFiles?: number;
}

export default function PropertyImageUploader({
  onUploadComplete,
  onUploadError,
  onRemoveImage,
  maxFiles = 10,
}: PropertyImageUploaderProps) {
  const [entries, setEntries] = useState<Array<{ preview: string; url: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      if (entries.length + files.length > maxFiles) {
        setError(`Maximum ${maxFiles} images allowed`); return;
      }

      for (const file of files) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          setError(`Invalid type: ${file.name}. Only JPEG, PNG, WebP.`); return;
        }
        if (file.size > 10 * 1024 * 1024) {
          setError(`${file.name} is too large. Max 10MB.`); return;
        }
      }

      setError(null);
      setUploading(true);

      const urls: string[] = [];

      for (const file of files) {
        try {
          const preview = URL.createObjectURL(file);

          const body = new FormData();
          body.append("file", file);
          body.append("upload_preset", "allpropertylink_unsigned");

          const res = await fetch("https://api.cloudinary.com/v1_1/oxdzvktu/image/upload", {
            method: "POST",
            body,
          });

          if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
          }

          const data = await res.json();
          if (!data.secure_url) throw new Error("No URL in response");

          urls.push(data.secure_url);
          setEntries((prev) => [...prev, { preview, url: data.secure_url }]);
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
    [maxFiles, entries.length, onUploadComplete, onUploadError]
  );

  const handleRemove = useCallback(
    (url: string) => {
      setEntries((prev) => {
        const entry = prev.find((e) => e.url === url);
        if (entry) URL.revokeObjectURL(entry.preview);
        return prev.filter((e) => e.url !== url);
      });
      onRemoveImage?.(url);
    },
    [onRemoveImage]
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        Upload up to {maxFiles} images (JPEG, PNG, WebP). Max size 10MB each.
      </p>

      {error && (
        <div className="rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">{error}</div>
      )}

      <input
        ref={inputRef}
        id="image-upload-input"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />

      <div
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer border-2 border-dashed rounded-lg bg-surface-secondary p-6 text-center hover:border-primary-500 transition-border"
      >
        <div className="flex flex-col items-center gap-3 pointer-events-none">
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          ) : (
            <Upload className="h-8 w-8 text-primary-500" />
          )}
          <span className="text-sm text-text-primary">
            {uploading ? "Uploading..." : "Click to upload"}
          </span>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {entries.map((entry) => (
            <div key={entry.url} className="relative group">
              <img
                src={entry.preview}
                alt="Property image"
                className="rounded-lg w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(entry.url)}
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
  );
}
