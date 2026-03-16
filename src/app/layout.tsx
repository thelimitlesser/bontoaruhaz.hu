import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

import { CartProvider } from "@/context/cart-context";
import { CartDrawer } from "@/components/cart-drawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bontoaruhaz.hu"),
  title: "BONTÓÁRUHÁZ - Prémium Bontott Autóalkatrészek Garanciával",
  description: "Magyarország megbízható autóalkatrész piactere. 15 év tapasztalat, 14 napos pénzvisszafizetési garancia és gyors házhozszállítás.",
  keywords: ["autóalkatrész", "bontott alkatrész", "autóbontó", "alkatrész rendelés", "garanciális alkatrész"],
  openGraph: {
    title: "BONTÓÁRUHÁZ - Prémium Autóalkatrész Piactér",
    description: "Találd meg a tökéletes alkatrészt másodpercek alatt garanciával.",
    url: "https://bontoaruhaz.hu",
    siteName: "BONTÓÁRUHÁZ",
    images: [
      {
        url: "/logo_orange.png",
        width: 800,
        height: 600,
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
  return (
    <html lang="hu" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/hero-bg.png" as="image" />
        <link rel="preload" href="/grid.svg" as="image" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
