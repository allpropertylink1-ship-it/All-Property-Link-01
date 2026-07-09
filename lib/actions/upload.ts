"use server";

export async function uploadImageToCloudinary(base64: string, mime: string, folder: string) {
  try {
    const signRes = await fetch("https://delightful-encouragement-production-878d.up.railway.app/api/uploadthing/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder }),
    });
    if (!signRes.ok) {
      const err = await signRes.json().catch(() => ({}));
      return { success: false, error: err.error || "Sign endpoint error" };
    }
    const { signature, timestamp, apiKey, cloudName } = await signRes.json();
    if (!cloudName) return { success: false, error: "Cloudinary not configured" };

    const buffer = Buffer.from(base64, "base64");
    const fd = new FormData();
    fd.append("file", new Blob([buffer], { type: mime }), "image." + mime.split("/")[1]);
    fd.append("api_key", apiKey);
    fd.append("timestamp", String(timestamp));
    fd.append("signature", signature);
    fd.append("folder", folder);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: fd,
    });
    if (!uploadRes.ok) {
      const text = await uploadRes.text().catch(() => "");
      return { success: false, error: `Cloudinary ${uploadRes.status}: ${text.slice(0, 200)}` };
    }
    const result = await uploadRes.json();
    return { success: true, url: result.secure_url };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Upload failed" };
  }
}
