'use client';

import { useState, useCallback, useRef, ChangeEvent } from "react";
import { api } from "@/lib/api-client";
import { Upload, Loader2, X } from "lucide-react";

interface ImageEntry {
  preview: string;
  url: string | null;
}

interface PropertyImageUploaderProps {
  onUploadComplete: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  onRemoveImage?: (url: string) => void;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
}

export default function PropertyImageUploader({
  onUploadComplete,
  onUploadError,
  onRemoveImage,
  multiple = true,
  maxFiles = 10,
  accept = "image/*",
}: PropertyImageUploaderProps) {
  const [entries, setEntries] = useState<ImageEntry[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingRef = useRef<ImageEntry[]>([]);

  async function uploadFile(file: File, folder: string): Promise<string> {
    const signRes = await api.post<{ signature: string; timestamp: number; apiKey: string; cloudName: string }>("/api/uploadthing/sign", { folder });
    if (signRes.error || !signRes.data) throw new Error(signRes.error || "Failed to get upload signature");
    const { signature, timestamp, apiKey, cloudName } = signRes.data;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", apiKey);
    fd.append("timestamp", String(timestamp));
    fd.append("signature", signature);
    fd.append("folder", folder);
    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: fd });
    if (!uploadRes.ok) throw new Error("Upload failed");
    const result = await uploadRes.json();
    return result.secure_url;
  }

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      if (!multiple && files.length > 1) {
        setError("Please select only one file"); return;
      }
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

      const newEntries: ImageEntry[] = files.map((f) => ({ preview: URL.createObjectURL(f), url: null }));
      pendingRef.current = newEntries;
      setEntries((prev) => [...prev, ...newEntries]);

      try {
        const promises = files.map((f) => uploadFile(f, "allpropertylink/property-listings"));
        const results = await Promise.all(promises);
        setEntries((prev) => {
          const copy = [...prev];
          let resultIdx = 0;
          for (let i = copy.length - newEntries.length; i < copy.length && resultIdx < results.length; i++) {
            copy[i] = { ...copy[i], url: results[resultIdx++] };
          }
          return copy;
        });
        onUploadComplete(results);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setError(msg);
        onUploadError?.(msg);
        setEntries((prev) => prev.slice(0, -newEntries.length));
      } finally {
        setUploading(false);
        pendingRef.current = [];
        e.target.value = "";
      }
    },
    [multiple, maxFiles, entries.length, onUploadComplete, onUploadError]
  );

  const handleRemoveImage = useCallback(
    (index: number) => {
      const entry = entries[index];
      if (!entry) return;
      URL.revokeObjectURL(entry.preview);
      if (entry.url && onRemoveImage) onRemoveImage(entry.url);
      setEntries((prev) => prev.filter((_, i) => i !== index));
    },
    [entries, onRemoveImage]
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        Upload up to {maxFiles} images (JPEG, PNG, WebP). Max size 10MB each.
      </p>

      {error && (
        <div className="rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">{error}</div>
      )}

      <div className="border-2 border-dashed rounded-lg bg-surface-secondary p-6 text-center hover:border-primary-500 transition-border">
        <div
          onClick={() => document.getElementById("image-upload-input")?.click()}
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          ) : (
            <Upload className="h-8 w-8 text-primary-500" />
          )}
          <span className="text-sm text-text-primary">
            {uploading ? "Uploading..." : "Click to upload"}
          </span>
          <span className="text-xs text-text-secondary">
            Images upload automatically after selection
          </span>
        </div>
        <input
          id="image-upload-input"
          type="file"
          multiple={multiple}
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>

      {entries.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {entries.map((entry, index) => (
            <div key={entry.preview} className="relative group">
              <img
                src={entry.preview}
                alt={`Property image ${index + 1}`}
                className="rounded-lg w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 rounded-full bg-error-500/80 p-1 text-white hover:bg-error-500 transition-colors"
                aria-label={`Remove image ${index + 1}`}
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
