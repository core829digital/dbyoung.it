import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Tracker } from "@/components/tracker";
import { CookieBanner } from "@/components/cookie-banner";
import { LanguageProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";

export const metadata: Metadata = {
  title: "DBYoung · Dimitri Boutourline — Jazz, Blues, Classica & Moderna | Beat, Sample Pack, Eventi",
  description:
    "DBYoung (Dimitri Boutourline): compositore a 360° di jazz, blues, musica classica e moderna. Compra beat e sample pack con strumenti veri, organizza eventi con Isola Events e collabora con l'artista.",
  metadataBase: new URL("https://www.dbyoung.it"),
  alternates: { canonical: "https://www.dbyoung.it" },
  robots: { index: true, follow: true },
  icons: { icon: "/dimitri-potos/dbyoung-logo.webp", apple: "/dimitri-potos/dbyoung-logo.webp" },
  openGraph: {
    title: "DBYoung · Dimitri Boutourline",
    description: "Jazz, Blues, Classica & Moderna · Beat · Sample Pack · Eventi",
    url: "https://www.dbyoung.it",
    siteName: "DBYoung",
    type: "website",
    locale: "it_IT",
    images: [{ url: "/dimitri-potos/dbyoung-logo.webp", width: 1200, height: 1200, alt: "DBYoung logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DBYoung · Dimitri Boutourline",
    description: "Jazz, Blues, Classica & Moderna · Beat · Sample Pack · Eventi",
    images: ["/dimitri-potos/dbyoung-logo.webp"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  name: "DBYoung",
  founder: { "@type": "Person", name: "Dimitri Boutourline" },
  url: "https://www.dbyoung.it",
  genre: ["Jazz", "Blues", "Classical", "Modern"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="bg-obsidian text-bone">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a href="#contenuto" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-fire focus:px-5 focus:py-2 focus:text-sm focus:text-white">
          Salta al contenuto
        </a>
        <LanguageProvider>
          <CartProvider>
          <SmoothScroll />
          <Tracker />
          <Navbar />
          <main id="contenuto" className="min-h-screen">{children}</main>
          <Footer />
          <CookieBanner />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
