"use client";

import { useEffect, useState } from "react";
import { X, Download } from "@/components/ui/icons";

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      const installed = localStorage.getItem("pwa-installed");
      if (!dismissed && !installed && !isIOS) {
        setTimeout(() => setShowPrompt(true), 10000);
      }
    };

    const handleAppInstalled = () => {
      localStorage.setItem("pwa-installed", "true");
      setShowPrompt(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isIOS]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        localStorage.setItem("pwa-installed", "true");
      }
      setDeferredPrompt(null);
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-install-dismissed", "true");
    setShowPrompt(false);
  };

  if (isIOS) {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Install All Property Link"
      >
        <div className="bg-surface border-t border-border rounded-t-2xl px-4 py-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-text-primary">Install App</h3>
            <button
              onClick={handleDismiss}
              className="touch-target p-1 text-text-secondary"
              aria-label="Dismiss"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-text-secondary mb-4">
            Tap the <Download size={16} className="inline" /> Share button, then <strong>Add to Home Screen</strong>
          </p>
          <button
            onClick={handleDismiss}
            className="touch-target w-full bg-primary-600 text-white py-2.5 rounded-xl font-medium"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Install All Property Link"
    >
      <div className="bg-surface border-t border-border rounded-t-2xl px-4 py-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-text-primary">Install All Property Link</h3>
          <button
            onClick={handleDismiss}
            className="touch-target p-1 text-text-secondary"
            aria-label="Dismiss"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-text-secondary mb-4">
          Get quick access to properties, fundis, and services. Works offline too!
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            className="touch-target flex-1 bg-primary-600 text-white py-2.5 rounded-xl font-medium"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="touch-target flex-1 border border-border bg-surface text-text-primary py-2.5 rounded-xl font-medium"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}