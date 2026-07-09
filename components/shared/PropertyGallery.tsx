"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";

interface Props {
  images: string[];
  title: string;
}

export function PropertyGallery({ images, title }: Props) {
  const [current, setCurrent] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = images.length;
  if (total === 0) return null;

  const startAuto = useCallback(() => {
    stopAuto();
    intervalRef.current = setInterval(() => {
      setCurrent((p) => (p + 1) % total);
    }, 4000);
  }, [total]);

  const stopAuto = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAuto();
    return stopAuto;
  }, [startAuto, stopAuto]);

  function goTo(idx: number) {
    setCurrent(idx);
    startAuto();
  }

  function prev() {
    goTo((current - 1 + total) % total);
  }

  function next() {
    goTo((current + 1) % total);
  }

  function openLightbox(idx: number) {
    stopAuto();
    setLightboxIdx(idx);
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
    startAuto();
  }

  function lbPrev() {
    setLightboxIdx((p) => (p - 1 + total) % total);
  }

  function lbNext() {
    setLightboxIdx((p) => (p + 1) % total);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") lbPrev();
    if (e.key === "ArrowRight") lbNext();
  }

  return (
    <div
      ref={containerRef}
      className="group relative mb-8 overflow-hidden rounded-xl bg-surface-secondary"
      onMouseEnter={stopAuto}
      onMouseLeave={startAuto}
      onFocus={stopAuto}
      onBlur={startAuto}
    >
      {/* Main image */}
      <button
        type="button"
        className="relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden focus-visible:outline-none"
        onClick={() => openLightbox(current)}
        aria-label="View full size"
      >
        <Image
          src={images[current]}
          alt={`${title} — image ${current + 1} of ${total}`}
          fill
          className="object-cover transition-opacity duration-300"
          priority={current === 0}
          sizes="(max-width: 1024px) 100vw, 800px"
        />

        {/* Expand hint */}
        <span className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Expand size={16} />
        </span>
      </button>

      {/* Prev / Next arrows */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute top-1/2 left-3 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-foreground shadow-sm opacity-0 transition-all duration-200 hover:bg-white hover:scale-105 focus-visible:opacity-100 group-hover:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute top-1/2 right-3 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-foreground shadow-sm opacity-0 transition-all duration-200 hover:bg-white hover:scale-105 focus-visible:opacity-100 group-hover:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-200 ${
                i === current
                  ? "w-5 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Image ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail strip */}
      {total > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-4 pt-3 scrollbar-none">
          {images.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 focus-visible:outline-none ${
                i === current
                  ? "border-primary-600 opacity-100 ring-1 ring-primary-600"
                  : "border-transparent opacity-60 hover:opacity-90"
              }`}
              aria-label={`Thumbnail ${i + 1}`}
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={(open) => { if (!open) closeLightbox(); }}>
        <DialogContent
          className="fixed inset-0 z-50 flex max-w-none items-center justify-center bg-black/95 p-0 sm:max-w-none"
          showCloseButton={false}
          onKeyDown={onKeyDown}
        >
          <DialogClose
            render={
              <button
                type="button"
                className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                aria-label="Close"
              />
            }
          >
            <X size={22} />
          </DialogClose>

          <div className="relative flex h-full w-full items-center justify-center p-4 sm:p-12">
            <Image
              src={images[lightboxIdx]}
              alt={`${title} — image ${lightboxIdx + 1} of ${total}`}
              fill
              className="object-contain"
              priority
              sizes="100vw"
            />
          </div>

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={lbPrev}
                className="absolute top-1/2 left-4 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={lbNext}
                className="absolute top-1/2 right-4 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                aria-label="Next"
              >
                <ChevronRight size={24} />
              </button>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightboxIdx(i)}
                    className={`h-2 rounded-full transition-all duration-200 ${
                      i === lightboxIdx
                        ? "w-5 bg-white"
                        : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                    aria-label={`View image ${i + 1}`}
                  />
                ))}
              </div>

              <span className="absolute bottom-6 right-6 text-sm text-white/60">
                {lightboxIdx + 1} / {total}
              </span>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
