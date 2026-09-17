"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CropError,
  NormalizedImage,
  normalizeImageForCrop,
  revokeCropUrl,
  rotateNormalizedImage,
  validateImageFile,
} from "@/lib/crop-utils";

export type CropPrepareStatus = "idle" | "preparing" | "ready";

/**
 * Owns the normalized working copy lifecycle for one crop session:
 * prepare(file) → rotate* → release(). The object URL is revoked exactly
 * once on release/unmount/re-prepare — callers never touch blob URLs.
 */
export function useImageCrop() {
  const [status, setStatus] = useState<CropPrepareStatus>("idle");
  const [working, setWorking] = useState<NormalizedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rotating, setRotating] = useState(false);
  const workingRef = useRef<NormalizedImage | null>(null);
  workingRef.current = working;

  const release = useCallback(() => {
    const current = workingRef.current;
    if (current) revokeCropUrl(current.url);
    workingRef.current = null;
    setWorking(null);
    setStatus("idle");
    setError(null);
  }, []);

  // Safety net: never leak the working URL if the dialog unmounts mid-flow.
  useEffect(() => {
    return () => {
      const current = workingRef.current;
      if (current) revokeCropUrl(current.url);
      workingRef.current = null;
    };
  }, []);

  const prepare = useCallback(async (file: File): Promise<boolean> => {
    const validation = validateImageFile(file);
    if (!validation.ok) {
      setError(validation.error ?? "Invalid image.");
      return false;
    }
    // Revoke any previous working copy before replacing it.
    const previous = workingRef.current;
    if (previous) revokeCropUrl(previous.url);
    workingRef.current = null;
    setWorking(null);
    setError(null);
    setStatus("preparing");
    try {
      const next = await normalizeImageForCrop(file);
      workingRef.current = next;
      setWorking(next);
      setStatus("ready");
      return true;
    } catch (err) {
      setStatus("idle");
      setError(
        err instanceof CropError ? err.message : "This image could not be read."
      );
      return false;
    }
  }, []);

  const rotate = useCallback(async (): Promise<boolean> => {
    const current = workingRef.current;
    if (!current || rotating) return false;
    setRotating(true);
    setError(null);
    try {
      const next = await rotateNormalizedImage(current);
      revokeCropUrl(current.url);
      workingRef.current = next;
      setWorking(next);
      return true;
    } catch (err) {
      setError(
        err instanceof CropError ? err.message : "Rotation failed. Please try again."
      );
      return false;
    } finally {
      setRotating(false);
    }
  }, [rotating]);

  return { status, working, error, rotating, prepare, rotate, release, setError };
}
