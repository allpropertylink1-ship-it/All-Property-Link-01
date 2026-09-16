import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { CookieConsent } from "@/components/shared/CookieConsent";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/auth-context";
import { siteUrl } from "@/lib/seo";
import { getSiteStatus } from "@/lib/services/status";
import MaintenanceNotice from "@/components/shared/MaintenanceNotice";
import { headers } from "next/headers";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import "./globals.css";

const sora = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading",
});

const dmSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 0.5,
  maximumScale: 5,
  viewportFit: "cover",
  interactiveWidget: "resizes-visual",
};

export const metadata: Metadata = {
  title: { default: "All Property Link — Kenya's Marketplace", template: "%s | All Property Link" },
  description: "Kenya's most reliable marketplace connecting you to properties, short-term stays, trusted fundis, and service providers across the country.",
  metadataBase: new URL(siteUrl()),
  openGraph: {
    title: "All Property Link — Kenya's Marketplace",
    description: "Kenya's most reliable marketplace connecting you to properties, short-term stays, trusted fundis, and service providers across the country.",
    type: "website",
    locale: "en_KE",
    siteName: "All Property Link",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const status = await getSiteStatus();
  const pathname = headers().get("x-pathname") || ""
  const isAuthRoute = pathname.startsWith("/auth")
  const inMaintenance = status?.maintenanceMode === true && status?.preview !== true && !isAuthRoute;
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://api.allpropertylink.co.ke" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <meta name="theme-color" content="#1E3A40" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="All Property Link" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${sora.variable} ${dmSans.variable} flex min-h-[100dvh] flex-col antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-6">{inMaintenance ? <MaintenanceNotice title={status?.maintenanceTitle} message={status?.maintenanceMessage} /> : children}</main>
          <CookieConsent />
          <BottomNav />
          <Footer />
        </AuthProvider>
        <PWAInstallPrompt />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "All Property Link",
              url: siteUrl(),
              logo: `${siteUrl()}/favicon.ico`,
              description: "Kenya's most reliable marketplace connecting you to properties, short-term stays, trusted fundis, and service providers across the country.",
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                email: "info@allpropertylink.com",
              },
              sameAs: [
                "https://facebook.com/allpropertylink",
                "https://twitter.com/allpropertylink",
                "https://instagram.com/allpropertylink",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "All Property Link",
              url: siteUrl(),
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${siteUrl()}/properties/search?query={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
