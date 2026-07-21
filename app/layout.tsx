import type { Metadata, Viewport } from "next";
import { Sora, DM_Sans } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { CookieConsent } from "@/components/shared/CookieConsent";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/auth-context";
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
};

export const metadata: Metadata = {
  title: { default: "All Property Link — Kenya's Marketplace", template: "%s | All Property Link" },
  description: "Kenya's most reliable marketplace connecting you to properties, short-term stays, trusted fundis, and service providers across the country.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://allpropertylink.co.ke"),
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
    <html lang="en" className="overflow-x-hidden">
      <body className={`${sora.variable} ${dmSans.variable} flex min-h-screen flex-col antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1 pb-20 md:pb-0">{children}</main>
          <CookieConsent />
          <BottomNav />
          <Footer />
        </AuthProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "All Property Link",
              url: "https://allpropertylink.co.ke",
              logo: "https://allpropertylink.co.ke/favicon.ico",
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
      </body>
    </html>
  );
}
