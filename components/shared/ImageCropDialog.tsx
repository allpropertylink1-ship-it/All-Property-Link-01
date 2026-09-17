/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactCrop, {
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
  type PercentCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useImageCrop } from "@/lib/use-image-crop";
import {
  CropError,
  DOC_MIN_SIDE,
  cropOutputTooSmall,
  emitCropEvent,
  extractCrop,
  type CropRect,
} from "@/lib/crop-utils";
import { FormBanner } from "@/components/shared/FormFeedback";
import {
  Check,
  Loader2,
  RefreshCw,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from "@/components/ui/icons";

interface ImageCropDialogProps {
  /** Original user-selected file (validated + EXIF-normalized internally). */
  sourceFile: File;
  /** e.g. "Front", "Cover photo", "Profile picture". */
  label: string;
  /** Reviewer-oriented helper shown under the title. */
  guidance?: string;
  /** Enforce the document legibility guard (min output pixels). */
  docGuard?: boolean;
  /** Show the "make sure it's readable" nudge next to Use original. */
  warnOnSkip?: boolean;
  /** Telemetry context, e.g. "kyc-front", "property-cover". */
  context?: string;
  onComplete: (blob: Blob) => void | Promise<void>;
  onSkip: () => void;
  onCancel: () => void;
}

type Ratio = "free" | number;

/** Initial selection: 90% centered — the user grabs handles to freely refine. */
function defaultCrop(aspect?: number): PercentCrop {
  const base: PercentCrop = { unit: "%", x: 5, y: 5, width: 90, height: 90 };
  if (aspect === undefined) return base;
  return makeAspectCrop(centerCrop(base, 100, 100), aspect, 100, 100);
}

export default function ImageCropDialog({
  sourceFile,
  label,
  guidance,
  docGuard = false,
  warnOnSkip = false,
  context,
  onComplete,
  onSkip,
  onCancel,
}: ImageCropDialogProps) {
  const { status, working, error, rotating, prepare, rotate, release } =
    useImageCrop();
  // Percent-space selection — survives display zoom, maps exactly to the
  // normalized working copy at apply time.
  const [crop, setCrop] = useState<PercentCrop>();
  const [completed, setCompleted] = useState<PercentCrop | null>(null);
  // Display zoom (image render scale, 1–3). Output resolution is unaffected:
  // pixels are always computed against the normalized working copy.
  const [zoom, setZoom] = useState(1);
  const [ratio, setRatio] = useState<Ratio>("free");
  const [saving, setSaving] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousFocus = useRef<Element | null>(null);

  // Prepare once per source file. release() on unmount revokes the working URL.
  useEffect(() => {
    previousFocus.current = document.activeElement;
    emitCropEvent("crop_opened", context);
    void (async () => {
      const ok = await prepare(sourceFile);
      if (ok) {
        setCrop(defaultCrop());
        setCompleted(null);
        headingRef.current?.focus();
      }
    })();
    return () => {
      release();
      if (previousFocus.current instanceof HTMLElement) {
        previousFocus.current.focus();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFile]);

  // Escape cancels (unless mid-save).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) {
        e.stopPropagation();
        emitCropEvent("crop_cancelled", context);
        onCancel();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [saving, onCancel, context]);

  const handleRotate = useCallback(async () => {
    setApplyError(null);
    const ok = await rotate();
    if (ok) {
      // Working copy swapped: reset the selection on the new orientation.
      // Predictable rule — rotation is an orientation fix, done first.
      setCrop(defaultCrop(ratio === "free" ? undefined : ratio));
      setCompleted(null);
      setZoom(1);
    }
  }, [rotate, ratio]);

  const handleReset = useCallback(() => {
    setCrop(defaultCrop(ratio === "free" ? undefined : ratio));
    setCompleted(null);
    setZoom(1);
  }, [ratio]);

  const handleRatio = useCallback((next: Ratio) => {
    setRatio(next);
    setCrop(defaultCrop(next === "free" ? undefined : next));
    setCompleted(null);
    setApplyError(null);
  }, []);

  const handleSkip = useCallback(() => {
    emitCropEvent("crop_skipped", context);
    onSkip();
  }, [onSkip, context]);

  const handleCancel = useCallback(() => {
    emitCropEvent("crop_cancelled", context);
    onCancel();
  }, [onCancel, context]);

  // Live selection preferred (updates while dragging); last-released as fallback.
  const activeCrop = crop ?? completed;
  const outputRect: CropRect | null =
    working && activeCrop
      ? (() => {
          const px = convertToPixelCrop(activeCrop, working.width, working.height);
          return { x: px.x, y: px.y, width: px.width, height: px.height };
        })()
      : null;

  const handleApply = useCallback(async () => {
    if (!working || !outputRect || saving) return;
    if (docGuard && cropOutputTooSmall(outputRect)) {
      setApplyError(
        `This crop is too small to stay readable (min ${DOC_MIN_SIDE}px on the short side). Widen the selection to include the whole document.`
      );
      return;
    }
    setApplyError(null);
    setSaving(true);
    try {
      const blob = await extractCrop(working, outputRect);
      emitCropEvent("crop_applied", context);
      await onComplete(blob);
    } catch (err) {
      emitCropEvent("crop_failed", context);
      setApplyError(
        err instanceof CropError
          ? err.message
          : "Could not process this crop. Please try again."
      );
      setSaving(false);
    }
  }, [working, outputRect, saving, docGuard, onComplete, context]);

  const tooSmall = docGuard && outputRect !== null && cropOutputTooSmall(outputRect);
  const preparing = status === "preparing" || (status === "idle" && !error);
  const ratios: Array<{ key: Ratio; label: string }> = [
    { key: "free", label: "Free" },
    { key: 1, label: "1:1" },
    { key: 4 / 3, label: "4:3" },
    { key: 16 / 9, label: "16:9" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-dialog-title"
    >
      {/* Enlarged grab handles: the old 12px dots were near-untappable on
          phones. 22px corners keep true freeform without the fat-finger pain. */}
      <style>{`.crop-free .ReactCrop__drag-handle{width:22px;height:22px}.crop-free .ReactCrop__drag-handle::after{inset:0}`}</style>
      <div className="mx-4 flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <div>
            <h3
              id="crop-dialog-title"
              ref={headingRef}
              tabIndex={-1}
              className="font-heading text-lg font-semibold text-text-primary focus:outline-none"
            >
              Crop {label}
            </h3>
            <p className="text-sm text-text-secondary">
              {guidance ??
                "Drag the box to move it, pull any corner or edge to resize freely. Cropping is optional — use the original if it already looks right."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            aria-label="Cancel cropping"
            className="touch-target shrink-0 rounded-full p-2.5 text-text-secondary hover:bg-surface-secondary hover:text-text-primary disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="crop-free relative max-h-[52dvh] w-full overflow-auto bg-text-primary">
          {preparing ? (
            <div
              className="flex h-72 items-center justify-center gap-2 text-sm text-white"
              role="status"
              aria-label="Preparing image"
            >
              <Loader2 size={20} className="animate-spin" />
              Preparing image…
            </div>
          ) : working ? (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(_, percentCrop) => setCompleted(percentCrop)}
              aspect={ratio === "free" ? undefined : ratio}
              minWidth={30}
              minHeight={30}
              ruleOfThirds
              keepSelection
            >
              <img
                key={working.url}
                src={working.url}
                alt={`Crop ${label}`}
                draggable={false}
                style={{ width: `${zoom * 100}%`, maxWidth: "none" }}
              />
            </ReactCrop>
          ) : null}
          {rotating && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-text-primary/50"
              role="status"
              aria-label="Rotating"
            >
              <Loader2 size={24} className="animate-spin text-white" />
            </div>
          )}
        </div>

        {(error || applyError) && (
          <div className="border-t border-border px-4 pt-4 sm:px-6">
            <FormBanner variant="error">{error ?? applyError}</FormBanner>
            {error && !working && (
              <p className="mt-2 text-sm text-text-secondary">
                You can still continue with the original file.
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-4 border-t border-border px-4 py-4 sm:px-6">
          <div
            className="flex items-center gap-2"
            role="group"
            aria-label="Crop shape"
          >
            {ratios.map((r) => {
              const active =
                r.key === "free" ? ratio === "free" : ratio === r.key;
              return (
                <button
                  key={String(r.key)}
                  type="button"
                  onClick={() => handleRatio(r.key)}
                  disabled={!working || saving}
                  aria-pressed={active}
                  title={
                    r.key === "free"
                      ? "Free selection — any size or shape"
                      : `Lock selection to ${r.label}`
                  }
                  className={`touch-target min-h-[44px] rounded-lg border px-3 text-xs font-medium transition-colors disabled:opacity-50 ${
                    active
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-border text-text-secondary hover:border-primary-500/50"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
            <span
              className="ml-auto shrink-0 text-xs font-medium tabular-nums text-text-secondary"
              aria-live="polite"
            >
              {outputRect
                ? `${Math.round(outputRect.width)} × ${Math.round(outputRect.height)} px${
                    tooSmall ? " — too small" : ""
                  }`
                : "Adjust the selection"}
            </span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRotate}
                disabled={!working || rotating || saving}
                aria-label="Rotate 90 degrees clockwise"
                title="Rotate 90° (resets selection)"
                className="touch-target rounded-lg border border-border p-2.5 text-text-secondary hover:bg-surface-secondary hover:text-text-primary disabled:opacity-50"
              >
                <RotateCw size={16} />
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={!working || saving}
                aria-label="Reset selection"
                title="Reset selection and zoom"
                className="touch-target rounded-lg border border-border p-2.5 text-text-secondary hover:bg-surface-secondary hover:text-text-primary disabled:opacity-50"
              >
                <RefreshCw size={16} />
              </button>
              <ZoomOut size={18} className="shrink-0 text-text-secondary" aria-hidden="true" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                aria-label="Image zoom"
                disabled={!working || saving}
                className="h-2 w-28 cursor-pointer appearance-none rounded-full bg-border accent-primary-600 sm:w-32 disabled:opacity-50"
              />
              <ZoomIn size={18} className="shrink-0 text-text-secondary" aria-hidden="true" />
            </div>

            <div className="flex flex-col gap-2 sm:ml-auto sm:flex-row sm:items-center sm:gap-3">
              {warnOnSkip && (
                <p className="text-xs text-text-secondary sm:max-w-[180px]">
                  Skip only if all corners and the number are clearly readable.
                </p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="touch-target flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-secondary disabled:opacity-50 sm:flex-initial"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={saving || (!working && !error)}
                  title="Continue with the original, uncropped image"
                  className="touch-target flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-secondary disabled:opacity-50 sm:flex-initial"
                >
                  Use original
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={saving || !working || !outputRect}
                  aria-busy={saving}
                  className="touch-target flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 sm:flex-initial"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  {saving ? "Saving…" : "Apply crop"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
