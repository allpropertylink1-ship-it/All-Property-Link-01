"use client";

import Image from "next/image";

export default function PWASplashDemo() {
  const splashSizes = [
    { w: 390, h: 844, label: "iPhone 12/13/14/15 Pro (9:19.5)" },
    { w: 414, h: 896, label: "iPhone 11/XR/12/13/14/15 (9:19.5)" },
    { w: 393, h: 852, label: "iPhone 15/16 Pro (9:19.5)" },
    { w: 820, h: 1180, label: "iPad (3:4)" },
  ];

  return (
    <div className="min-h-[100dvh] bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">PWA Splash Screen Fit Comparison</h1>
      <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
        Source: 9:16 image (720x1280). Device screens have different aspect ratios.
      </p>

      <div className="space-y-12 max-w-5xl mx-auto">
        {splashSizes.map(({ w, h, label }) => (
          <div key={`${w}x${h}`} className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">{label} ({w}×{h})</h2>
            <div className="grid grid-cols-3 gap-4">
              {/* fit: cover */}
              <div className="space-y-2">
                <h3 className="font-medium text-green-700 text-center">fit: cover (current)</h3>
                <div className="relative bg-gray-200 rounded overflow-hidden" style={{ width: w/2, height: h/2 }}>
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/icons/splash-1125x2436.png)" }} />
                </div>
                <p className="text-xs text-center text-gray-500">Fills screen, crops excess</p>
              </div>

              {/* fit: contain */}
              <div className="space-y-2">
                <h3 className="font-medium text-blue-700 text-center">fit: contain</h3>
                <div className="relative bg-gray-200 rounded overflow-hidden" style={{ width: w/2, height: h/2 }}>
                  <div className="absolute inset-0 bg-contain bg-center bg-no-repeat bg-gray-100" style={{ backgroundImage: "url(/icons/splash-1125x2436.png)" }} />
                </div>
                <p className="text-xs text-center text-gray-500">Shows full image, letterboxes</p>
              </div>

              {/* fill/stretch */}
              <div className="space-y-2">
                <h3 className="font-medium text-red-700 text-center">stretch (distorted)</h3>
                <div className="relative bg-gray-200 rounded overflow-hidden" style={{ width: w/2, height: h/2 }}>
                  <img
                    src="/icons/splash-1125x2436.png"
                    alt="stretched"
                    className="absolute inset-0 w-full h-full"
                    style={{ objectFit: "fill" }}
                  />
                </div>
                <p className="text-xs text-center text-gray-500">Distorts to fill exactly</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}