'use client';

import { useState, useCallback, useEffect, useRef } from "react";
import { Upload, Loader2, X } from "lucide-react";

interface ImageEntry {
  preview: string;
  url: string;
}

interface PropertyImageUploaderProps {
  onUploadComplete: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  onRemoveImage?: (url: string) => void;
  maxFiles?: number;
}

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (err: unknown, result: { event: string; info: { secure_url: string } }) => void
      ) => { open: () => void };
    };
  }
}

export default function PropertyImageUploader({
  onUploadComplete,
  onUploadError,
  onRemoveImage,
  maxFiles = 10,
}: PropertyImageUploaderProps) {
  const [entries, setEntries] = useState<ImageEntry[]>([]);
  const [uploading, setUploading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<{ open: () => void } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!window.cloudinary) {
      const s = document.createElement("script");
      s.src = "https://upload-widget.cloudinary.com/global/all.js";
      s.async = true;
      s.onload = () => setReady(true);
      document.head.appendChild(s);
      return;
    }
    setReady(true);
  }, []);

  const openWidget = useCallback(() => {
    if (widgetRef.current) return;
    if (!window.cloudinary) return;

    setError(null);

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: "oxdzvktu",
        uploadPreset: "allpropertylink_unsigned",
        folder: "allpropertylink/property-listings",
        maxFiles,
        maxFileSize: 10485760,
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        sources: ["local", "camera"],
        multiple: true,
      },
      (err: unknown, result: { event: string; info: { secure_url: string } }) => {
        if (err) {
          const msg = typeof err === "string" ? err : "Upload widget error";
          setError(msg);
          onUploadError?.(msg);
          widgetRef.current = null;
          return;
        }

        if (result.event === "queues-start") {
          setUploading(true);
        }

        if (result.event === "success") {
          const url = result.info.secure_url;
          const preview = url;
          setEntries((prev) => [...prev, { preview, url }]);
          onUploadComplete([url]);
        }

        if (result.event === "queue-end") {
          setUploading(false);
          widgetRef.current = null;
        }

        if (result.event === "close") {
          setUploading(false);
          widgetRef.current = null;
        }
      }
    );

    widgetRef.current.open();
  }, [maxFiles, onUploadComplete, onUploadError]);

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

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        Upload up to {maxFiles} images (JPEG, PNG, WebP). Max size 10MB each.
      </p>

      {error && (
        <div className="rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">{error}</div>
      )}

      {!ready ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
          <span className="ml-2 text-sm text-text-secondary">Loading uploader...</span>
        </div>
      ) : (
        <div
          onClick={uploading ? undefined : openWidget}
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
      )}

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
