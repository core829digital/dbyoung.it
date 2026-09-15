export type ProductType = "beat" | "sample-pack" | "offerta";

export interface Product {
  id: string;
  slug: string;
  title: string;
  type: ProductType;
  price: number;
  oldPrice?: number;
  bpm?: number;
  key?: string;
  cover: string;
  audioPreview?: string;
  stripeLink: string;
  tags: string[];
  featured?: boolean;
  description: string;
}

/** Artwork ufficiale per sample pack e composizioni */
export const ARTWORK_PACKS = "/dimitri-potos/dbyoung-sample-packs-compositions-artwork.png";
export const PRODUCTS: Product[] = [
  {
    id: "p1",
    slug: "midnight-brass",
    title: "Midnight Brass",
    type: "beat",
    price: 49,
    oldPrice: 79,
    bpm: 92,
    key: "D min",
    cover: ARTWORK_PACKS,
    stripeLink: "#",
    tags: ["jazz", "blues", "live horns"],
    featured: true,
    description:
      "Beat jazz-blues moderno con fiati veri, contrabbasso e batteria registrata live. Stems inclusi.",
  },
  {
    id: "p2",
    slug: "velvet-groove",
    title: "Velvet Groove",
    type: "beat",
    price: 39,
    bpm: 88,
    key: "G min",
    cover: ARTWORK_PACKS,
    stripeLink: "#",
    tags: ["neo-soul", "rhodes", "smooth"],
    featured: true,
    description:
      "Groove vellutato con Rhodes, chitarra live e basso caldo. Perfetto per voci soul e rap melodico.",
  },
  {
    id: "p3",
    slug: "fire-on-52nd",
    title: "Fire on 52nd",
    type: "beat",
    price: 59,
    bpm: 100,
    key: "A min",
    cover: ARTWORK_PACKS,
    stripeLink: "#",
    tags: ["energetic", "big band", "modern jazz"],
    featured: true,
    description:
      "Energia da club jazz di New York con sezione fiati, piano stride moderno e drop potente.",
  },
  {
    id: "p4",
    slug: "obsidian-keys-vol1",
    title: "Obsidian Keys Vol. 1 — Sample Pack",
    type: "sample-pack",
    price: 29,
    oldPrice: 45,
    cover: ARTWORK_PACKS,
    stripeLink: "#",
    tags: ["120+ samples", "piano", "rhodes", "royalty-free"],
    featured: true,
    description:
      "120+ loop e one-shot di piano, Rhodes e Wurlitzer registrati su strumenti veri. 100% royalty-free.",
  },
  {
    id: "p5",
    slug: "live-drums-blues",
    title: "Live Drums & Blues Guitars",
    type: "sample-pack",
    price: 25,
    cover: ARTWORK_PACKS,
    stripeLink: "#",
    tags: ["drums", "guitar", "live"],
    description:
      "Batterie live e chitarre blues registrate in studio: groove, fill, lick e riff pronti al mix.",
  },
  {
    id: "p6",
    slug: "bundle-fire-starter",
    title: "Fire Starter Bundle — 3 Beat + 1 Pack",
    type: "offerta",
    price: 99,
    oldPrice: 176,
    cover: ARTWORK_PACKS,
    stripeLink: "#",
    tags: ["bundle", "-44%", "best value"],
    featured: true,
    description:
      "Offerta lancio: 3 beat a scelta + Obsidian Keys Vol. 1. Licenza premium inclusa.",
  },
];

export const NAV = [
  { key: "home", href: "/" },
  { key: "artist", href: "/artista" },
  { key: "music", href: "/musica" },
  { key: "works", href: "/opere" },
  { key: "shop", href: "/shop" },
  { key: "events", href: "/eventi" },
  { key: "contact", href: "/contatti" },
] as const;

export type NavKey = (typeof NAV)[number]["key"];

/**
 * Opere / composizioni (curriculum).
 * file: URL in /public/opere/... oppure "#" se in arrivo.
 * Per pubblicare spartiti/audio reali, caricarli in /public/opere/ e aggiornare il campo file.
 */
export interface Work {
  id: string;
  title: { it: string; en: string };
  genre: { it: string; en: string };
  year: string;
  kind: "score" | "audio";
  file: string;
  description: { it: string; en: string };
}

export const WORKS: Work[] = [
  {
    id: "w1",
    title: { it: "Notturno per archi in Re minore", en: "Nocturne for Strings in D minor" },
    genre: { it: "Classica", en: "Classical" },
    year: "2024",
    kind: "score",
    file: "#",
    description: { it: "Composizione originale per quartetto d'archi.", en: "Original composition for string quartet." },
  },
  {
    id: "w2",
    title: { it: "Suite Moderna n.1 — Ossidiana", en: "Modern Suite No.1 — Obsidian" },
    genre: { it: "Moderna", en: "Modern" },
    year: "2024",
    kind: "audio",
    file: "#",
    description: { it: "Suite per piano, elettronica e fiati.", en: "Suite for piano, electronics and horns." },
  },
  {
    id: "w3",
    title: { it: "Blues per la 52ª Strada", en: "Blues for 52nd Street" },
    genre: { it: "Blues", en: "Blues" },
    year: "2023",
    kind: "audio",
    file: "#",
    description: { it: "Big-band moderna con sezione fiati live.", en: "Modern big-band with live horn section." },
  },
  {
    id: "w4",
    title: { it: "Preludio Jazz in Sol minore", en: "Jazz Prelude in G minor" },
    genre: { it: "Jazz", en: "Jazz" },
    year: "2023",
    kind: "score",
    file: "#",
    description: { it: "Preludio per piano solo, stile stride moderno.", en: "Solo piano prelude, modern stride style." },
  },
  {
    id: "w5",
    title: { it: "Fattoria Isola — Tema ufficiale eventi", en: "Fattoria Isola — Official Events Theme" },
    genre: { it: "Moderna / Eventi", en: "Modern / Events" },
    year: "2025",
    kind: "audio",
    file: "#",
    description: { it: "Tema composto per i format di Isola Events.", en: "Theme composed for the Isola Events formats." },
  },
  {
    id: "w6",
    title: { it: "Adagio per pianoforte e violoncello", en: "Adagio for Piano and Cello" },
    genre: { it: "Classica", en: "Classical" },
    year: "2025",
    kind: "score",
    file: "#",
    description: { it: "Duo lirico per piano e violoncello.", en: "Lyrical duo for piano and cello." },
  },
];
