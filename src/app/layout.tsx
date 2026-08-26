import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";

const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "";

export const metadata: Metadata = {
  title: "SLABOK — Verifica carte rubate",
  description: "Controlla in pochi secondi se una carta graduta risulta rubata prima di acquistarla.",
  // Verifica proprietà del sito per Google AdSense: un meta tag statico, a differenza
  // dello snippet di script AdSense, non carica nulla e non richiede consenso cookie.
  other: adsenseClientId ? { "google-adsense-account": adsenseClientId } : {},
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SLABOK",
  },
};

export const viewport: Viewport = {
  themeColor: "#00308C",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-lg px-4 pb-8 pt-4">{children}</main>
          <Footer />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
