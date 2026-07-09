'use client';

import { useState, useCallback, ChangeEvent } from "react";
import { uploadImage } from "@/lib/actions/upload";
import { Upload, Loader2, X } from "lucide-react";

interface PropertyImageUploaderProps {
  onUploadComplete: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
}

export default function PropertyImageUploader({
  onUploadComplete,
  onUploadError,
  multiple = true,
  maxFiles = 10,
  accept = "image/*",
}: PropertyImageUploaderProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      if (!multiple && files.length > 1) {
        setError("Please select only one file");
        return;
      }
      if (previews.length + files.length > maxFiles) {
        setError(`Maximum ${maxFiles} images allowed`);
        return;
      }

      for (const file of files) {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
          setError(`Invalid file type: ${file.name}. Only JPEG, PNG, and WebP are allowed.`);
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError(`File ${file.name} is too large. Maximum size is 5MB.`);
          return;
        }
      }

      setError(null);
      setUploading(true);

      const newPreviews = files.map((f) => URL.createObjectURL(f));
      setPreviews((prev) => [...prev, ...newPreviews]);

      const uploadPromises = files.map((file) => {
        const fd = new FormData();
        fd.append("file", file);
        return uploadImage(fd);
      });

      try {
        const results = await Promise.all(uploadPromises);
        const urls: string[] = [];
        const errors: string[] = [];

        results.forEach((result, index) => {
          if (result.success && result.url) {
            urls.push(result.url);
          } else {
            errors.push(result.error || `Failed to upload image ${index + 1}`);
          }
        });

        if (errors.length > 0) {
          setError(errors.join(" "));
          onUploadError?.(errors.join(" "));
        }

        if (urls.length > 0) {
          onUploadComplete(urls);
        }
      } catch {
        setError("Upload failed. Please try again.");
        onUploadError?.("Upload failed. Please try again.");
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    [multiple, maxFiles, previews.length, onUploadComplete, onUploadError]
  );

  const handleRemoveImage = useCallback(
    (index: number) => {
      setPreviews((prev) => {
        const updated = [...prev];
        URL.revokeObjectURL(updated[index]);
        updated.splice(index, 1);
        return updated;
      });
    },
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Upload up to {maxFiles} images (JPEG, PNG, WebP). Max size 5MB each.
        </p>
      </div>

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

      {previews.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {previews.map((preview, index) => (
            <div key={preview} className="relative group">
              <img
                src={preview}
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
