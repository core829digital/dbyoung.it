import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ChatWidget } from "@/components/chat-widget";

export const metadata: Metadata = {
  title: "DBYoung · Dimitri Bouturline — Jazz, Blues & Classica | Beat, Sample Pack, Eventi",
  description:
    "DBYoung (Dimitri Bouturline): compositore di jazz, blues e musica classica dal suono moderno. Compra beat e sample pack con strumenti veri, organizza eventi e collabora con l'artista.",
  metadataBase: new URL("https://dbyoung.it"),
  openGraph: {
    title: "DBYoung · Dimitri Bouturline",
    description: "Jazz, Blues & Classica · Beat · Sample Pack · Eventi live",
    url: "https://dbyoung.it",
    siteName: "DBYoung",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="bg-obsidian text-bone">
        <SmoothScroll />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
