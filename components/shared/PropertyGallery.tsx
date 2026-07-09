"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  if (images.length === 1) {
    return (
      <div className="mb-8 rounded-xl bg-surface-secondary p-4 sm:p-6">
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="group relative mx-auto block max-w-lg"
          aria-label="View image full-screen"
        >
          <Image
            src={images[0]}
            alt={title}
            width={600}
            height={400}
            className="h-auto w-full rounded-lg object-cover"
            priority
          />
          <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-lg bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
            <Expand size={16} />
          </span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className="mb-8 rounded-xl bg-surface-secondary p-4 sm:p-6"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {/* Main image */}
        <div className="relative mx-auto max-w-lg">
          <button
            type="button"
            onClick={() => openLightbox(current)}
            className="block w-full"
            aria-label="View image full-screen"
          >
            <Image
              src={images[current]}
              alt={`${title} — image ${current + 1} of ${images.length}`}
              width={600}
              height={400}
              className="h-auto w-full rounded-lg object-cover transition-opacity duration-300"
              priority={current === 0}
            />
          </button>

          {/* Counter */}
          <span className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-2.5 py-1 text-xs font-medium text-white">
            {current + 1} / {images.length}
          </span>

          {/* Expand button */}
          <button
            type="button"
            onClick={() => openLightbox(current)}
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-lg bg-black/40 text-white opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100"
            aria-label="View full-screen"
          >
            <Expand size={16} />
          </button>

          {/* Navigation arrows */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity hover:bg-black/60 hover:opacity-100 focus-visible:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity hover:bg-black/60 hover:opacity-100 focus-visible:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Thumbnails */}
        <div className="mt-4 flex justify-center gap-2 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`relative shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                i === current
                  ? "border-primary-500 ring-1 ring-primary-500"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={url}
                alt=""
                width={80}
                height={56}
                className="h-14 w-20 object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
        <DialogContent
          className="fixed inset-0 z-50 flex h-full w-full max-w-none items-center justify-center bg-black/90 p-0 sm:max-w-none"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">{title} — image {lightboxIndex + 1} of {images.length}</DialogTitle>

          {/* Close */}
          <button
            type="button"
            onClick={() => setShowLightbox(false)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
            aria-label="Close"
          >
            <X size={22} />
          </button>

          {/* Counter */}
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-black/50 px-3 py-1.5 text-sm font-medium text-white">
            {lightboxIndex + 1} / {images.length}
          </span>

          {/* Prev */}
          <button
            type="button"
            onClick={lbPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
            aria-label="Previous image"
          >
            <ChevronLeft size={28} />
          </button>

          {/* Next */}
          <button
            type="button"
            onClick={lbNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
            aria-label="Next image"
          >
            <ChevronRight size={28} />
          </button>

          {/* Image */}
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
