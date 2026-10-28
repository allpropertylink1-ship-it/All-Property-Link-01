import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Sans_Display } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { CookieConsent } from "@/components/shared/CookieConsent";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/auth-context";
import { FavoritesProvider } from "@/lib/favorites-context";
import { siteUrl } from "@/lib/seo";
import { getSiteStatus } from "@/lib/services/status";
import MaintenanceNotice from "@/components/shared/MaintenanceNotice";
import { headers } from "next/headers";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { PWARegister } from "@/components/pwa/PWARegister";
import OfflineBadge from "@/components/shared/OfflineBadge";
import { AnalyticsProvider } from "@/components/shared/AnalyticsProvider";
import { FooterTracking } from "@/components/layout/FooterTracking";
import "./globals.css";

const heading = Noto_Sans_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--apl-heading",
});

const body = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--apl-body",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1E3A40",
};

export const metadata: Metadata = {
  title: { default: "All Property Link", template: "%s | All Property Link" },
  description: "Find properties, land, short-term stays, fundis, and service providers across Kenya. Verified listings, checked by APL representatives.",
  metadataBase: new URL(siteUrl()),
  openGraph: {
    title: "All Property Link",
    description: "Find properties, land, short-term stays, fundis, and service providers across Kenya. Verified listings, checked by APL representatives.",
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
  const isAppSurface = isAuthRoute || pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  const isChromeless =
    pathname.startsWith("/offline") ||
    pathname.startsWith("/maintenance") ||
    pathname.startsWith("/gantt") ||
    pathname.startsWith("/pwa-splash-demo") ||
    pathname.startsWith("/uploads");
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://api.allpropertylink.co.ke" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <meta name="theme-color" content="#1E3A40" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="All Property Link" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
      </head>
      <body className={`${heading.variable} ${body.variable} flex min-h-[100dvh] flex-col antialiased`}>
        <OfflineBadge />
        <PWARegister />
        <AnalyticsProvider />
        <AuthProvider>
          <FavoritesProvider>
            <Navbar />
            <main className="min-w-0 max-w-full flex-1 overflow-x-clip pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-6">{inMaintenance ? <MaintenanceNotice title={status?.maintenanceTitle} message={status?.maintenanceMessage} /> : children}</main>
            <CookieConsent />
            <BottomNav />
            {!isChromeless && (
            <>
              <Footer variant={isAppSurface ? "legal" : "full"} />
              <FooterTracking />
            </>
          )}
          </FavoritesProvider>
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
              description: "Find properties, land, short-term stays, fundis, and service providers across Kenya. Verified listings, checked by APL representatives.",
              email: "info@allpropertylink.com",
              telephone: "+254743634581",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Embassy House, 4th Floor, Harambee Avenue",
                addressLocality: "Nairobi",
                addressCountry: "KE",
              },
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                email: "info@allpropertylink.com",
                telephone: "+254743634581",
                areaServed: "KE",
              },
              sameAs: [
                "https://www.facebook.com/profile.php?id=61593598572272",
                "https://www.instagram.com/allproperty.link/",
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
