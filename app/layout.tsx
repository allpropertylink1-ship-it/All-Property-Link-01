import type { Metadata, Viewport } from "next";
import { Sora, DM_Sans } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { CookieConsent } from "@/components/shared/CookieConsent";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/auth-context";
import { siteUrl } from "@/lib/seo";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
});

const dmSans = DM_Sans({
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/splash/all-property-link.mp4" as="video" type="video/mp4" />
        <link rel="preload" href="/splash/all-property-link-poster.jpg" as="image" type="image/jpeg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#286255" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="All Property Link" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${sora.variable} ${dmSans.variable} flex min-h-[100dvh] flex-col antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-6">{children}</main>
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
