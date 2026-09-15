import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ChatWidget } from "@/components/chat-widget";
import { LanguageProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "DBYoung · Dimitri Bouturline — Jazz, Blues, Classica & Moderna | Beat, Sample Pack, Eventi",
  description:
    "DBYoung (Dimitri Bouturline): compositore a 360° di jazz, blues, musica classica e moderna. Compra beat e sample pack con strumenti veri, organizza eventi con Isola Events e collabora con l'artista.",
  metadataBase: new URL("https://dbyoung.it"),
  openGraph: {
    title: "DBYoung · Dimitri Bouturline",
    description: "Jazz, Blues, Classica & Moderna · Beat · Sample Pack · Eventi",
    url: "https://dbyoung.it",
    siteName: "DBYoung",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="bg-obsidian text-bone">
        <LanguageProvider>
          <SmoothScroll />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ChatWidget />
        </LanguageProvider>
      </body>
    </html>
  );
}
