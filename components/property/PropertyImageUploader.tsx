'use client';

import { useState, useCallback, ChangeEvent, FormEvent } from "react";
import { uploadImage } from "@/lib/actions/upload";
import { Upload } from "lucide-react";

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
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (!multiple && files.length > 1) {
        setError("Please select only one file");
        return;
      }
      if (files.length > maxFiles) {
        setError(`Please select no more than ${maxFiles} files`);
        return;
      }

      // Validate each file
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

      setImages(files);
      // Create preview URLs
      const previews = await Promise.all(
        files.map(
          (file) => URL.createObjectURL(file)
        )
      );
      setPreviews(previews);
      setError(null);
    },
    [multiple, maxFiles]
  );

  const handleUpload = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (images.length === 0) {
        setError("Please select at least one image to upload");
        return;
      }
      setUploading(true);
      setError(null);
      setSuccess(null);

      const uploadPromises = images.map((image) => {
        const formData = new FormData();
        formData.append("file", image);
        return uploadImage(formData);
      });

      try {
        const results = await Promise.all(uploadPromises);
        const urls: string[] = [];
        const errors: string[] = [];

        results.forEach((result, index) => {
          if (result.success) {
            urls.push(result.url);
          } else {
            errors.push(result.error || `Failed to upload image ${index + 1}`);
          }
        });

        if (errors.length > 0) {
          setError(errors.join(" "));
          onUploadError?.(errors.join(" "));
        } else {
          setSuccess(`Successfully uploaded ${urls.length} image(s)`);
          onUploadComplete(urls);
        }
      } catch {
        setError("Upload failed. Please try again.");
        onUploadError?.("Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [images, onUploadComplete, onUploadError]
  );

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });
    setPreviews((prev) => {
      const newPreviews = [...prev];
      newPreviews.splice(index, 1);
      return newPreviews;
    });
    // Revoke the object URL to free memory
    URL.revokeObjectURL(previews[index]);
  }, [previews]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-text-primary">Property Images</h2>
        <p className="text-sm text-text-secondary">
          Upload up to {maxFiles} images (JPEG, PNG, WebP). Max size 5MB each.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-success-500/10 px-4 py-3 text-sm text-success-500">
          {success}
        </div>
      )}

      <div className="border-2 border-dashed rounded-lg bg-surface-secondary p-6 text-center hover:border-primary-500 transition-border">
        <div
          onClick={() => document.getElementById("image-upload-input")?.click()}
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          <Upload className="h-8 w-8 text-primary-500" />
          <span className="text-sm text-text-primary">Click to upload</span>
          <span className="text-xs text-text-secondary">
            or drag and drop images here
          </span>
        </div>
        <input
          id="image-upload-input"
          type="file"
          multiple={multiple}
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => document.getElementById("image-upload-input")?.click()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-text-on-primary hover:bg-primary-700"
        >
          Upload Images
        </button>
      </div>

      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-text-primary">Preview</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {previews.map((preview, index) => (
              <div key={preview} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt={`Property image ${index + 1}`}
                  className="rounded-lg w-full h-48 object-cover"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 rounded-full bg-error-500/20 p-1 text-xs font-medium text-error-500 hover:bg-error-500/30 transition-colors group-hover:bg-error-500/40"
                  aria-label={`Remove image ${index + 1}`}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleUpload}
            disabled={images.length === 0}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-text-on-primary hover:bg-primary-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload Images"}
          </button>
        </div>
      )}
    </div>
  );
}