/**
 * Client-side image pipeline: downscale in-browser (canvas) then upload to the
 * API's local-storage endpoint (/api/upload/public). Replaces the retired
 * direct-to-Cloudinary flow — server has no native image lib, so compression
 * happens here before the bytes ever leave the device.
 */

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

/** Downscale to fit maxW/maxH and re-encode. Keeps PNG when small/transparent-ish, else JPEG. */
export async function downscaleImage(
  input: File | Blob,
  maxDimension = MAX_DIMENSION,
  quality = JPEG_QUALITY
): Promise<File> {
  const sourceName =
    input instanceof File ? input.name : `upload-${Date.now()}.jpg`;

  // SVG / GIF: pass through untouched (canvas raster would lose fidelity)
  const type = input.type || "";
  if (type === "image/gif" || type === "image/svg+xml") {
    return input instanceof File ? input : new File([input], sourceName, { type });
  }

  try {
    const bitmap = await createImageBitmap(input, { imageOrientation: "from-image" } as ImageBitmapOptions);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    const outType = type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, outType, quality)
    );
    if (!blob) throw new Error("toBlob failed");

    const ext = outType === "image/png" ? ".png" : ".jpg";
    const base = sourceName.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${base}${ext}`, { type: outType });
  } catch {
    // Decode failure: send original rather than blocking the user
    return input instanceof File ? input : new File([input], sourceName, { type: type || undefined });
  }
}

/**
 * Downscale then upload to local storage.
 * Returns the served URL (e.g. "/uploads/properties/<uuid>-name.jpg").
 */
export async function uploadImage(
  file: File | Blob,
  folder: string,
  opts?: { maxDimension?: number; quality?: number; signal?: AbortSignal }
): Promise<string> {
  const processed = await downscaleImage(
    file,
    opts?.maxDimension ?? MAX_DIMENSION,
    opts?.quality ?? JPEG_QUALITY
  );

  const fd = new FormData();
  fd.append("file", processed, processed instanceof File ? processed.name : undefined);
  fd.append("folder", folder);

  const res = await fetch("/api/upload/public", {
    method: "POST",
    body: fd,
    signal: opts?.signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Upload failed (${res.status}): ${text.slice(0, 160)}`);
  }
  const data = (await res.json()) as { url: string };
  if (!data.url) throw new Error("Upload returned no URL");
  return data.url;
}
