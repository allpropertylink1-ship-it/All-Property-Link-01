/**
 * Shared crop pipeline utilities — single source of truth for every image
 * crop flow in the app (KYC, avatars, business photos, listings, services).
 *
 * Pipeline order (do not reorder):
 *   1. validateImageFile() — HEIC / allowlist / 10MB, one copy for all callers
 *   2. normalizeImageForCrop() — EXIF-bake via createImageBitmap(from-image)
 *      + cap at CROP_WORKING_MAX. The Cropper AND the output extractor both
 *      operate on this normalized blob, so croppedAreaPixels always maps
 *      exactly (this kills the whole EXIF-orientation mismatch class, including
 *      the old iPhone-rotation bug). Server thumbs/compression run downstream
 *      on the final bytes as before.
 *   3. extractCrop() — exact axis-aligned extract in normalized pixel space.
 *      Rotation is applied to the working copy (rotateNormalizedImage) with the
 *      Cropper locked at rotation 0, so croppedAreaPixels is always exact —
 *      no rotated-rect math anywhere.
 */

import { HEIC_HINT } from "@/lib/image-client";

export const CROP_WORKING_MAX = 2048;
export const CROP_JPEG_QUALITY = 0.92;
export const CROP_MAX_BYTES = 10 * 1024 * 1024;
/** Minimum shortest-side output pixels for identity documents (legibility guard). */
export const DOC_MIN_SIDE = 600;

export const ALLOWED_CROP_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
] as const;

export class CropError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CropError";
  }
}

export interface CropValidation {
  ok: boolean;
  error?: string;
}

/** Single validator for every crop entry point. Returns (never throws). */
export function validateImageFile(file: File): CropValidation {
  const name = file.name || "image";
  const type = (file.type || "").toLowerCase();
  const lowerName = (file.name || "").toLowerCase();
  if (
    type === "image/heic" ||
    type === "image/heif" ||
    lowerName.endsWith(".heic") ||
    lowerName.endsWith(".heif")
  ) {
    return { ok: false, error: HEIC_HINT };
  }
  if (!(ALLOWED_CROP_TYPES as readonly string[]).includes(type)) {
    return { ok: false, error: `${name}: Only JPEG, PNG and WebP are allowed.` };
  }
  if (file.size > CROP_MAX_BYTES) {
    return { ok: false, error: `${name} is too large. Max 10MB.` };
  }
  return { ok: true };
}

export interface NormalizedImage {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  /** True when the working copy kept PNG (real transparency). */
  isPng: boolean;
}

function hasAlpha(imageData: ImageData): boolean {
  const d = imageData.data;
  for (let i = 3; i < d.length; i += 4) if (d[i] < 250) return true;
  return false;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, quality));
}

async function decodeBitmap(
  source: Blob
): Promise<{ bitmap: ImageBitmap; close: () => void }> {
  const bitmap = await createImageBitmap(source, {
    imageOrientation: "from-image",
  } as ImageBitmapOptions);
  return { bitmap, close: () => bitmap.close?.() };
}

function pickOutputType(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sourceType: string
): string {
  if (sourceType === "image/png") {
    try {
      const sample = ctx.getImageData(0, 0, Math.min(w, 200), Math.min(h, 200));
      return hasAlpha(sample) ? "image/png" : "image/jpeg";
    } catch {
      return "image/png";
    }
  }
  if (sourceType === "image/webp") return "image/webp";
  return "image/jpeg";
}

/**
 * EXIF-bake + downscale-cap a selected file into the working copy the Cropper
 * displays. The returned object URL is owned by the caller — revoke with
 * revokeCropUrl() after upload / cancel / unmount.
 */
export async function normalizeImageForCrop(
  file: File | Blob
): Promise<NormalizedImage> {
  const sourceType = (file.type || "").toLowerCase();
  let bitmap: ImageBitmap;
  try {
    ({ bitmap } = await decodeBitmap(file));
  } catch {
    throw new CropError(
      "This image could not be read. Try a JPEG or PNG exported from your gallery."
    );
  }
  try {
    const scale =
      Math.min(1, CROP_WORKING_MAX / Math.max(bitmap.width, bitmap.height)) || 1;
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new CropError("Image processing is unavailable on this device.");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, w, h);

    const outType = pickOutputType(ctx, w, h, sourceType);
    const blob = await canvasToBlob(canvas, outType, CROP_JPEG_QUALITY);
    if (!blob) throw new CropError("Image processing failed. Please try again.");
    return {
      blob,
      url: URL.createObjectURL(blob),
      width: w,
      height: h,
      isPng: outType === "image/png",
    };
  } finally {
    bitmap.close?.();
  }
}

/** Revoke a working-copy object URL (safe on null/undefined/non-blob). */
export function revokeCropUrl(url: string | null | undefined): void {
  if (typeof url === "string" && url.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      /* already revoked — harmless */
    }
  }
}

/** Rotate the working copy 90° clockwise. Returns the new copy; caller revokes the old. */
export async function rotateNormalizedImage(
  src: NormalizedImage
): Promise<NormalizedImage> {
  let bitmap: ImageBitmap;
  try {
    ({ bitmap } = await decodeBitmap(src.blob));
  } catch {
    throw new CropError("Rotation failed. Please try again.");
  }
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.height;
    canvas.height = bitmap.width;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new CropError("Image processing is unavailable on this device.");
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
    const outType = src.isPng ? "image/png" : "image/jpeg";
    const blob = await canvasToBlob(canvas, outType, CROP_JPEG_QUALITY);
    if (!blob) throw new CropError("Rotation failed. Please try again.");
    return {
      blob,
      url: URL.createObjectURL(blob),
      width: canvas.width,
      height: canvas.height,
      isPng: src.isPng,
    };
  } finally {
    bitmap.close?.();
  }
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Exact axis-aligned extract from the normalized working copy.
 * `rect` is in normalized pixel space (= croppedAreaPixels from the Cropper).
 * Throws CropError (never returns null) so callers always show a message.
 */
export async function extractCrop(
  src: NormalizedImage,
  rect: CropRect
): Promise<Blob> {
  const sx = Math.max(0, Math.round(rect.x));
  const sy = Math.max(0, Math.round(rect.y));
  const sw = Math.min(
    Math.round(rect.width),
    src.width - sx
  );
  const sh = Math.min(
    Math.round(rect.height),
    src.height - sy
  );
  if (sw < 1 || sh < 1) {
    throw new CropError("The crop area is empty. Adjust the crop and try again.");
  }
  let bitmap: ImageBitmap;
  try {
    ({ bitmap } = await decodeBitmap(src.blob));
  } catch {
    throw new CropError("Could not process this crop. Please try again.");
  }
  try {
    const canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new CropError("Image processing is unavailable on this device.");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, sw, sh);
    const outType = src.isPng ? "image/png" : "image/jpeg";
    const blob = await canvasToBlob(canvas, outType, CROP_JPEG_QUALITY);
    if (!blob) throw new CropError("Could not process this crop. Please try again.");
    return blob;
  } finally {
    bitmap.close?.();
  }
}

/** Document legibility guard: shortest output side must clear DOC_MIN_SIDE. */
export function cropOutputTooSmall(rect: CropRect): boolean {
  return Math.min(rect.width, rect.height) < DOC_MIN_SIDE;
}

/** Wrap a crop blob as an uploadable File (feeds existing uploadImage()). */
export function cropBlobToFile(blob: Blob, baseName = "crop"): File {
  const type = blob.type || "image/jpeg";
  const ext = type === "image/png" ? ".png" : type === "image/webp" ? ".webp" : ".jpg";
  const base = baseName.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}${ext}`, { type });
}

// ---------------------------------------------------------------------------
// Telemetry — proves "seamless". Console + CustomEvent today; analytics
// dashboards can subscribe to `apl:crop-event` without touching callers.
// ---------------------------------------------------------------------------

export type CropEvent =
  | "crop_opened"
  | "crop_applied"
  | "crop_skipped"
  | "crop_recropped"
  | "crop_cancelled"
  | "crop_failed";

export function emitCropEvent(event: CropEvent, context?: string): void {
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("apl:crop-event", { detail: { event, context } })
      );
    }
  } catch {
    /* telemetry must never break the flow */
  }
  if (process.env.NODE_ENV === "development") {
    console.debug(`[crop] ${event}${context ? ` (${context})` : ""}`);
  }
}
