import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "SLABOK — Verifica carte rubate",
  description: "Controlla in pochi secondi se una carta graduta risulta rubata prima di acquistarla.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-lg px-4 pb-8 pt-4">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
