import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Tracker } from "@/components/tracker";
import { CookieBanner } from "@/components/cookie-banner";
import { LanguageProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "DBYoung · Dimitri Bouturline — Jazz, Blues, Classica & Moderna | Beat, Sample Pack, Eventi",
  description:
    "DBYoung (Dimitri Bouturline): compositore a 360° di jazz, blues, musica classica e moderna. Compra beat e sample pack con strumenti veri, organizza eventi con Isola Events e collabora con l'artista.",
  metadataBase: new URL("https://dbyoung.it"),
  alternates: { canonical: "https://dbyoung.it" },
  robots: { index: true, follow: true },
  icons: { icon: "/dimitri-potos/DBYOUNG%20LOGO%20trasparent%20webp.webp", apple: "/dimitri-potos/DBYOUNG%20LOGO%20trasparent%20webp.webp" },
  openGraph: {
    title: "DBYoung · Dimitri Bouturline",
    description: "Jazz, Blues, Classica & Moderna · Beat · Sample Pack · Eventi",
    url: "https://dbyoung.it",
    siteName: "DBYoung",
    type: "website",
    locale: "it_IT",
    images: [{ url: "/dimitri-potos/DBYOUNG%20LOGO%20trasparent%20webp.webp", width: 1200, height: 1200, alt: "DBYoung logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DBYoung · Dimitri Bouturline",
    description: "Jazz, Blues, Classica & Moderna · Beat · Sample Pack · Eventi",
    images: ["/dimitri-potos/DBYOUNG%20LOGO%20trasparent%20webp.webp"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  name: "DBYoung",
  founder: { "@type": "Person", name: "Dimitri Bouturline" },
  url: "https://dbyoung.it",
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
          <SmoothScroll />
          <Tracker />
          <Navbar />
          <main id="contenuto" className="min-h-screen">{children}</main>
          <Footer />
          <CookieBanner />
        </LanguageProvider>
      </body>
    </html>
  );
}
