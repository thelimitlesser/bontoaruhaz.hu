export const dynamic = "force-dynamic"; // v1.0.1 - force redeploy
import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

import { CartProvider } from "@/context/cart-context";
import { CartDrawer } from "@/components/cart-drawer";
import NextTopLoader from 'nextjs-toploader';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CookieConsent } from "@/components/cookie-consent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bontoaruhaz.hu"),
  title: "BONTÓÁRUHÁZ - Minőségi Bontott Autóalkatrészek Garanciával",
  description: "Magyarország megbízható autóalkatrész piactere. 15 év tapasztalat, 14 napos pénzvisszafizetési garancia és gyors házhozszállítás.",
  icons: {
    icon: "/icon-tight.png",
    apple: "/icon-tight.png",
  },
  keywords: ["autóalkatrész", "bontott alkatrész", "autóbontó", "alkatrész rendelés", "garanciális alkatrész"],
  openGraph: {
    title: "BONTÓÁRUHÁZ - Megbízható Autóalkatrész Piactér",
    description: "Találd meg a tökéletes alkatrészt másodpercek alatt garanciával.",
    url: "https://bontoaruhaz.hu",
    siteName: "BONTÓÁRUHÁZ",
    images: [
      {
        url: "https://www.bontoaruhaz.hu/og-main.png",
        width: 1200,
        height: 630,
        alt: "BONTÓÁRUHÁZ - Minőségi bontott autóalkatrészek",
      },
    ],
    locale: "hu_HU",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BONTÓÁRUHÁZ",
    "url": "https://www.bontoaruhaz.hu",
    "logo": "https://www.bontoaruhaz.hu/og-main.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+36-70-612-1277",
      "contactType": "customer service",
      "areaServed": "HU",
      "availableLanguage": "Hungarian"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jánosmajor",
      "addressLocality": "Seregélyes",
      "postalCode": "8111",
      "addressCountry": "HU"
    }
  };

  const storeJsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    "name": "BONTÓÁRUHÁZ",
    "image": "https://www.bontoaruhaz.hu/og-main.png",
    "@id": "https://www.bontoaruhaz.hu",
    "url": "https://www.bontoaruhaz.hu",
    "telephone": "+36706121277",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jánosmajor",
      "addressLocality": "Seregélyes",
      "postalCode": "8111",
      "addressCountry": "HU"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "08:00",
      "closes": "17:00"
    }
  };

  return (
    <html lang="hu" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
        />
        <CartProvider>
          <NextTopLoader color="#db513c" showSpinner={false} />
          <Suspense fallback={<div className="h-16 bg-white border-b border-gray-100" />}>
            <Navbar />
          </Suspense>
          <Suspense fallback={null}>
            <CartDrawer />
          </Suspense>
          <main className="flex-1">
            {children}
          </main>
          <Suspense fallback={<div className="h-20 bg-foreground" />}>
            <Footer />
          </Suspense>
        </CartProvider>
        <Analytics />
        <SpeedInsights />
        <CookieConsent />
      </body>
    </html>
  );
}
