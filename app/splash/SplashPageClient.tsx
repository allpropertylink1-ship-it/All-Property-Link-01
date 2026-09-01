"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "@/components/ui/icons";

const AUTO_DISMISS_MS = 20000;

export function SplashPageClient() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  const dismiss = useCallback(() => {
    router.push("/");
    router.refresh();
  }, [router]);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);

    const timer = setTimeout(() => dismiss(), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [dismiss]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dismiss]);

  const handleVideoEnd = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  if (!mounted) return null;

  if (prefersReducedMotion) {
    return (
      <div
        className="fixed inset-0 z-[60] overflow-hidden bg-cover bg-center max-h-[100dvh]"
        style={{ backgroundImage: "url(/splash/all-property-link-poster.jpg)", height: "100dvh", filter: "blur(20px)" }}
        onClick={dismiss}
        onKeyDown={(e) => e.key === "Enter" && dismiss()}
        role="button"
        tabIndex={0}
        aria-label="Welcome to All Property Link"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <button
          onClick={dismiss}
          className="absolute top-[calc(56px+16px)] right-4 z-[70] touch-target flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white transition-colors hover:bg-white/20"
          aria-label="Close splash screen"
        >
          <X size={24} />
        </button>
        <div className="absolute bottom-[calc(72px+env(safe-area-inset-bottom)+16px)] left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
          Tap to explore
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[60] overflow-hidden max-h-[100dvh]"
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to All Property Link"
      style={{ height: "100dvh" }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
        poster="/splash/all-property-link-poster.jpg"
        onEnded={handleVideoEnd}
      >
        <source src="/splash/all-property-link.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/70" />

      <button
        onClick={dismiss}
        className="absolute top-[calc(56px+16px)] right-4 z-[70] touch-target flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white transition-colors hover:bg-white/20"
        aria-label="Close splash screen"
      >
        <X size={24} />
      </button>

      <div className="absolute bottom-[calc(72px+env(safe-area-inset-bottom)+16px)] left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
        Tap to explore
      </div>
    </div>
  );
}