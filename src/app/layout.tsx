import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/components/auth/Providers";
import { resolveServerLocale } from "@/lib/i18n/server-locale";
import { getSiteSettings } from "@/lib/site-settings";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Eyed.bio — Tu página link-in-bio moderna",
  description:
    "Crea páginas link-in-bio personalizables con Eyed.bio. Efectos visuales, analytics y diseño moderno. Gratis y sin anuncios.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [initialLocale, initialSiteSettings] = await Promise.all([
    resolveServerLocale(),
    getSiteSettings(),
  ]);

  return (
    <html lang={initialLocale} className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers initialLocale={initialLocale} initialSiteSettings={initialSiteSettings}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
