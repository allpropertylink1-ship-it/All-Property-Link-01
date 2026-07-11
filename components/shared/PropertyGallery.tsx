"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  images: string[];
  title: string;
}

export function PropertyGallery({ images, title }: Props) {
  const [current, setCurrent] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((i: number) => {
    setCurrent(i);
  }, []);

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setCurrent((p) => (p - 1 + images.length) % images.length);
  }, [images.length]);

  const openLightbox = useCallback((i: number) => {
    setLightboxIndex(i);
    setShowLightbox(true);
    setPaused(true);
  }, []);

  const lbNext = useCallback(() => {
    setLightboxIndex((p) => (p + 1) % images.length);
  }, [images.length]);

  const lbPrev = useCallback(() => {
    setLightboxIndex((p) => (p - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1 || paused) return;
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [images.length, paused, next]);

  useEffect(() => {
    if (!showLightbox) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") lbNext();
      if (e.key === "ArrowLeft") lbPrev();
      if (e.key === "Escape") setShowLightbox(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showLightbox, lbNext, lbPrev]);

  if (images.length === 0) return null;

  return (
    <>
      <div
        className="rounded-xl bg-surface-secondary p-3 sm:p-4"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {/* Main image */}
        <div className="relative overflow-hidden rounded-lg" style={{ aspectRatio: "4 / 3" }}>
          <div className="relative h-full w-full">
            <button type="button" onClick={() => openLightbox(current)} className="relative block h-full w-full" aria-label="View image full-screen">
              <Image
                src={images[current]}
                alt={`${title} — image ${current + 1} of ${images.length}`}
                fill
                className="object-cover transition-opacity duration-300"
                priority={current === 0}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </button>
          </div>

          {/* Hover overlay with actions */}
          <div className="absolute inset-0 opacity-0 transition-opacity hover:opacity-100">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65"
              aria-label="Previous image"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65"
              aria-label="Next image"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Always-visible controls */}
          <span className="absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
            {current + 1} / {images.length}
          </span>
          <button
            type="button"
            onClick={() => openLightbox(current)}
            className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-md bg-black/55 text-white transition-colors hover:bg-black/75"
            aria-label="View full-screen"
          >
            <Expand size={14} />
          </button>

          {/* Always-visible arrows on mobile */}
          <div className="sm:hidden">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-1 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-1 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5">
            {images.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`relative shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                  i === current
                    ? "border-primary-500 ring-1 ring-primary-500"
                    : "border-transparent opacity-55 hover:opacity-100"
                }`}
                style={{ width: 72, height: 54 }}
                aria-label={`View image ${i + 1}`}
              >
                <Image src={url} alt="" fill className="object-cover" sizes="72px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
        <DialogContent
          className="fixed inset-0 z-50 flex h-full w-full max-w-none items-center justify-center bg-black/90 p-0 sm:max-w-none"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">{title} — image {lightboxIndex + 1} of {images.length}</DialogTitle>

          <button
            type="button"
            onClick={() => setShowLightbox(false)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
            aria-label="Close"
          >
            <X size={22} />
          </button>

          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 rounded-md bg-black/50 px-3 py-1.5 text-sm font-medium text-white">
            {lightboxIndex + 1} / {images.length}
          </span>

          <button
            type="button"
            onClick={lbPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
            aria-label="Previous image"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            type="button"
            onClick={lbNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
            aria-label="Next image"
          >
            <ChevronRight size={28} />
          </button>

          <div className="flex h-full w-full items-center justify-center p-4">
            <Image
              src={images[lightboxIndex]}
              alt={`${title} — image ${lightboxIndex + 1}`}
              width={1200}
              height={800}
              className="max-h-full max-w-full rounded-lg object-contain"
              priority
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
