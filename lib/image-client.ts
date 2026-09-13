/**
 * Client-side image pipeline: downscale in-browser (canvas) then upload to the
 * API's local-storage endpoint (/api/upload/public). Server has no native
 * image lib, so compression happens here before the bytes ever leave the device.
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

const API_BACKEND =
  (typeof process !== "undefined" && (process.env.NEXT_PUBLIC_API_URL as string | undefined)) ||
  "https://api.allpropertylink.co.ke";

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

  const tryPost = async (url: string): Promise<Response> =>
    fetch(url, {
      method: "POST",
      body: (() => {
        const fd = new FormData();
        fd.append("file", processed, processed instanceof File ? processed.name : undefined);
        fd.append("folder", folder);
        return fd;
      })(),
      signal: opts?.signal,
    });

  let res: Response | null = null;
  let lastText = "";

  // Attempt 1: Vercel proxy (/api/upload/public)
  try {
    res = await tryPost("/api/upload/public");
    if (res.ok) {
      const data = (await res.json()) as { url: string };
      if (!data.url) throw new Error("Upload returned no URL");
      return data.url;
    }
    lastText = await res.text().catch(() => "");
    // 502/503/504 are retriable via direct origin; other 4xx are terminal
    if (![502, 503, 504].includes(res.status)) {
      throw new Error(`Upload failed (${res.status}): ${lastText.slice(0, 160)}`);
    }
  } catch (e) {
    if (e instanceof Error && !e.message.startsWith("Upload failed") && e.message !== "__FALLBACK_DIRECT__") {
      // network error — retriable
      lastText = e.message;
    } else if (e instanceof Error && e.message.startsWith("Upload failed")) {
      throw e;
    }
    // else fall through to direct retry
  }

  // Attempt 2: Direct to origin (bypass Vercel edge)
  try {
    res = await tryPost(`${API_BACKEND}/api/upload/public`);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Upload failed (${res.status}): ${text.slice(0, 160)}`);
    }
    const data = (await res.json()) as { url: string };
    if (!data.url) throw new Error("Upload returned no URL");
    return data.url;
  } catch (e) {
    if (lastText) {
      throw new Error(`Upload failed (proxy 502, direct retry failed): ${e instanceof Error ? e.message : String(e)} | proxy: ${lastText.slice(0, 120)}`);
    }
    throw e;
  }
}

export async function uploadPdf(file: File, opts?: { signal?: AbortSignal }): Promise<string> {
  const tryPost = async (url: string): Promise<Response> => {
    const fd = new FormData();
    fd.append("file", file);
    return fetch(url, { method: "POST", credentials: "include", body: fd, signal: opts?.signal });
  };

  let res: Response | null = null;
  let lastText = "";
  try {
    res = await tryPost("/api/upload/pdf");
    if (res.ok) {
      const data = (await res.json()) as { url: string; id: string };
      return data.url;
    }
    lastText = await res.text().catch(() => "");
    if (![502, 503, 504].includes(res.status)) {
      const j = await res.json().catch(() => ({} as Record<string, string>));
      throw new Error((j as Record<string,string>).error || `Upload failed (${res.status}): ${lastText.slice(0,160)}`);
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes("Upload failed (") && !e.message.includes("proxy")) throw e;
    lastText = e instanceof Error ? e.message : String(e);
  }
  // direct retry
  res = await tryPost(`${API_BACKEND}/api/upload/pdf`);
  if (!res.ok) {
    const j = await res.json().catch(() => ({} as Record<string,string>));
    const text = await res.text().catch(() => "");
    throw new Error(j.error || `Upload failed (${res.status}): ${text.slice(0,160)} | proxy: ${lastText.slice(0,120)}`);
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}
