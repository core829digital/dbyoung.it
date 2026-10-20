export type ProductType = "beat" | "sample-pack" | "soundtrack" | "offerta";

export interface Product {
  id: string;
  slug: string;
  title: string;
  type: ProductType;
  /** Prezzo € — se licenseOnly, il prezzo si concorda (licenza su misura) */
  price: number;
  licenseOnly?: boolean;
  oldPrice?: number;
  bpm?: number;
  key?: string;
  cover: string;
  /** Anteprima pubblica (mp3 breve, in public/audio/previews) */
  preview: string;
  /** Percorso privato del file/cartella originale (in private_audio/, MAI esposto: solo via /api/download con licenza) */
  file: string;
  stripeLink: string;
  tags: string[];
  featured?: boolean;
  description: string;
  descriptionEn: string;
}

/** Artwork ufficiale per prodotti digitali */
export const ARTWORK_PACKS = "/dimitri-potos/artwork-sample-packs.webp";

const ROOT = "AUDIO-UPLOADS-BEATS-SAMPLEPACKS-COLONNESONORE";

/**
 * Catalogo REALE — file di Dimitri (2 beat, 4 sample pack, 3 colonne sonore).
 * Prezzi di lancio da confermare con Dimitri (modifica diretta qui o da /admin).
 */
export const PRODUCTS: Product[] = [
  {
    id: "beat-give-a-start",
    slug: "give-a-start",
    title: "Give a Start (prod. D.B Young)",
    type: "beat",
    price: 150,
    cover: ARTWORK_PACKS,
    preview: "/audio/previews/give-a-start.mp3",
    file: `${ROOT}/BEATS/Give a Start prod D.B Young .wav`,
    stripeLink: "#",
    tags: ["beat", "wav", "royalty-free"],
    featured: true,
    description: "Beat originale prodotto da D.B Young, file WAV full-quality. Licenza base inclusa, stems e licenze superiori su richiesta.",
    descriptionEn: "Original beat produced by D.B Young, full-quality WAV file. Basic license included, stems and higher licenses on request.",
  },
  {
    id: "beat-sacred-voices",
    slug: "sacred-voices",
    title: "Sacred Voices (prod. D.B Young)",
    type: "beat",
    price: 120,
    cover: ARTWORK_PACKS,
    preview: "/audio/previews/sacred-voices.mp3",
    file: `${ROOT}/BEATS/SACRED VOICES Prod D.B Young.wav`,
    stripeLink: "#",
    tags: ["beat", "wav", "voci", "royalty-free"],
    featured: true,
    description: "Beat originale con voci, prodotto da D.B Young, file WAV full-quality. Licenza base inclusa, stems e licenze superiori su richiesta.",
    descriptionEn: "Original beat with vocals, produced by D.B Young, full-quality WAV file. Basic license included, stems and higher licenses on request.",
  },
  {
    id: "pack-velvet-tape",
    slug: "velvet-tape-neo-soul-chillhop",
    title: "Velvet & Tape — Neo-Soul & Chillhop Melodies",
    type: "sample-pack",
    price: 25,
    bpm: 110,
    key: "E min",
    cover: ARTWORK_PACKS,
    preview: "/audio/previews/pack-velvet-tape.mp3",
    file: `${ROOT}/SAMPLE PACKS/_Velvet & Tape Neo-Soul & Chillhop Melodies_ 110 BPM E minor`,
    stripeLink: "#",
    tags: ["5 loop", "neo-soul", "chillhop", "royalty-free"],
    featured: true,
    description: "5 melodie neo-soul & chillhop, 110 BPM in Mi minore. Loop WAV pronti al mix, 100% royalty-free.",
    descriptionEn: "5 neo-soul & chillhop melodies, 110 BPM in E minor. Mix-ready WAV loops, 100% royalty-free.",
  },
  {
    id: "pack-melancholic",
    slug: "melancholic-neo-soul-piano",
    title: "Melancholic Neo-Soul Piano & Ambient Soundscape",
    type: "sample-pack",
    price: 30,
    bpm: 101,
    key: "Ab Maj",
    cover: ARTWORK_PACKS,
    preview: "/audio/previews/pack-melancholic.mp3",
    file: `${ROOT}/SAMPLE PACKS/Melancholic Neo-Soul Piano with Ambient Soundscape_ 101 BPM Ab Major`,
    stripeLink: "#",
    tags: ["5 loop", "piano", "ambient", "royalty-free"],
    description: "5 loop di piano neo-soul malinconico con soundscape ambient, 101 BPM in Lab maggiore. WAV, 100% royalty-free.",
    descriptionEn: "5 melancholic neo-soul piano loops with ambient soundscape, 101 BPM in Ab major. WAV, 100% royalty-free.",
  },
  {
    id: "pack-opera",
    slug: "opera-cinematic-orchestral-trap",
    title: "Opera Cinematic — Orchestral Trap",
    type: "sample-pack",
    price: 27,
    bpm: 73,
    key: "G min",
    cover: ARTWORK_PACKS,
    preview: "/audio/previews/pack-opera.mp3",
    file: `${ROOT}/SAMPLE PACKS/Opera Cinematic_Orchestral Trap  G Minor 73 BPM`,
    stripeLink: "#",
    tags: ["6 loop", "cinematic", "orchestral", "trap", "royalty-free"],
    description: "6 loop orchestral-trap cinematografici, 73 BPM in Sol minore. Cori, archi e atmosfera da colonna sonora. WAV, 100% royalty-free.",
    descriptionEn: "6 cinematic orchestral-trap loops, 73 BPM in G minor. Choirs, strings and soundtrack atmosphere. WAV, 100% royalty-free.",
  },
  {
    id: "pack-nostalgia",
    slug: "velvet-nostalgia-cinematic",
    title: "Velvet Nostalgia — Cinematic Emotional",
    type: "sample-pack",
    price: 35,
    bpm: 100,
    key: "D min",
    cover: ARTWORK_PACKS,
    preview: "/audio/previews/pack-nostalgia.mp3",
    file: `${ROOT}/SAMPLE PACKS/Velvet Nostalgia – Cinematic_emotional 100 BPM Dminor`,
    stripeLink: "#",
    tags: ["8 loop", "cinematic", "emotional", "royalty-free"],
    description: "8 loop cinematic-emotional, 100 BPM in Re minore. Il pack più ricco della collezione. WAV, 100% royalty-free.",
    descriptionEn: "8 cinematic-emotional loops, 100 BPM in D minor. The richest pack in the collection. WAV, 100% royalty-free.",
  },
  {
    id: "bundle-completo",
    slug: "bundle-completo",
    title: "Bundle completo Sample Packs",
    type: "offerta",
    price: 95,
    cover: ARTWORK_PACKS,
    preview: "/audio/previews/pack-velvet-tape.mp3",
    file: `${ROOT}/SAMPLE PACKS`,
    stripeLink: "#",
    tags: ["4 pack", "tutti gli stem", "offerta"],
    featured: true,
    description: "Tutti e 4 i sample pack DBYoung (Velvet & Tape, Melancholic Piano, Opera Cinematic, Velvet Nostalgia) con melodie e stem separati. Prezzo pieno 117 €, bundle a 95 €.",
    descriptionEn: "All 4 DBYoung sample packs (Velvet & Tape, Melancholic Piano, Opera Cinematic, Velvet Nostalgia) with melodies and separate stems. 117 € full price, 95 € bundle.",
  },
  {
    id: "produzione-personalizzata",
    slug: "produzione-personalizzata",
    title: "Produzione personalizzata",
    type: "offerta",
    price: 350,
    licenseOnly: true,
    cover: ARTWORK_PACKS,
    preview: "",
    file: "",
    stripeLink: "#",
    tags: ["su misura", "da 350 €", "consegna 1 settimana"],
    description: "Composizione, beat o produzione su misura. Call conoscitiva e consegna del file entro 1 settimana. Prezzo da 350 € a 1K+ in base alla complessità del progetto.",
    descriptionEn: "Custom composition, beat or production. Discovery call and file delivery within 1 week. Price from 350 € up to 1K+ depending on project complexity.",
  },
  {
    id: "ost-birds",
    slug: "birds-composition",
    title: "Birds — Composition",
    type: "soundtrack",
    price: 0,
    licenseOnly: true,
    cover: ARTWORK_PACKS,
    preview: "/audio/previews/birds.mp3",
    file: `${ROOT}/COLONNE SONORE/Birds Composition .mp3`,
    stripeLink: "#",
    tags: ["colonna sonora", "licenza su misura"],
    description: "Composizione originale per colonne sonore. Licenza d'uso su misura per film, spot, eventi e contenuti.",
    descriptionEn: "Original composition for soundtracks. Tailored license for films, ads, events and content.",
  },
  {
    id: "ost-tempo-fugit",
    slug: "tempo-fugit-composition",
    title: "Tempo Fugit — Composition",
    type: "soundtrack",
    price: 0,
    licenseOnly: true,
    cover: ARTWORK_PACKS,
    preview: "/audio/previews/tempo-fugit.mp3",
    file: `${ROOT}/COLONNE SONORE/Tempo Fugit Compostion.mp3`,
    stripeLink: "#",
    tags: ["colonna sonora", "licenza su misura"],
    description: "Composizione originale per colonne sonore. Licenza d'uso su misura per film, spot, eventi e contenuti.",
    descriptionEn: "Original composition for soundtracks. Tailored license for films, ads, events and content.",
  },
  {
    id: "ost-water",
    slug: "water-composition",
    title: "Water — Composition",
    type: "soundtrack",
    price: 0,
    licenseOnly: true,
    cover: ARTWORK_PACKS,
    preview: "/audio/previews/water.mp3",
    file: `${ROOT}/COLONNE SONORE/Water Composition.mp3`,
    stripeLink: "#",
    tags: ["colonna sonora", "licenza su misura"],
    description: "Composizione originale per colonne sonore. Licenza d'uso su misura per film, spot, eventi e contenuti.",
    descriptionEn: "Original composition for soundtracks. Tailored license for films, ads, events and content.",
  },
];

export const NAV = [
  { key: "home", href: "/" },
  { key: "artist", href: "/artista" },
  { key: "music", href: "/musica" },
  { key: "works", href: "/opere" },
  { key: "shop", href: "/shop" },
  { key: "events", href: "https://events.dbyoung.it" },
  { key: "contact", href: "/contatti" },
] as const;

export type NavKey = (typeof NAV)[number]["key"];

/**
 * Opere / composizioni REALI (curriculum).
 * preview: anteprima pubblica · shopSlug: prodotto corrispondente nello shop
 */
export interface Work {
  id: string;
  title: { it: string; en: string };
  genre: { it: string; en: string };
  year: string;
  kind: "score" | "audio";
  preview?: string;
  shopSlug?: string;
  description: { it: string; en: string };
}

export const WORKS: Work[] = [
  {
    id: "w-birds",
    title: { it: "Birds — Colonna sonora", en: "Birds — Soundtrack" },
    genre: { it: "Colonna sonora", en: "Soundtrack" },
    year: "2025",
    kind: "audio",
    preview: "/audio/previews/birds.mp3",
    shopSlug: "birds-composition",
    description: { it: "Composizione originale, disponibile in licenza.", en: "Original composition, available for licensing." },
  },
  {
    id: "w-tempo",
    title: { it: "Tempo Fugit — Colonna sonora", en: "Tempo Fugit — Soundtrack" },
    genre: { it: "Colonna sonora", en: "Soundtrack" },
    year: "2025",
    kind: "audio",
    preview: "/audio/previews/tempo-fugit.mp3",
    shopSlug: "tempo-fugit-composition",
    description: { it: "Composizione originale, disponibile in licenza.", en: "Original composition, available for licensing." },
  },
  {
    id: "w-water",
    title: { it: "Water — Colonna sonora", en: "Water — Soundtrack" },
    genre: { it: "Colonna sonora", en: "Soundtrack" },
    year: "2025",
    kind: "audio",
    preview: "/audio/previews/water.mp3",
    shopSlug: "water-composition",
    description: { it: "Composizione originale, disponibile in licenza.", en: "Original composition, available for licensing." },
  },
  {
    id: "w-give",
    title: { it: "Give a Start (prod. D.B Young)", en: "Give a Start (prod. D.B Young)" },
    genre: { it: "Beat", en: "Beat" },
    year: "2025",
    kind: "audio",
    preview: "/audio/previews/give-a-start.mp3",
    shopSlug: "give-a-start",
    description: { it: "Beat originale in vendita nello shop.", en: "Original beat on sale in the shop." },
  },
  {
    id: "w-sacred",
    title: { it: "Sacred Voices (prod. D.B Young)", en: "Sacred Voices (prod. D.B Young)" },
    genre: { it: "Beat", en: "Beat" },
    year: "2025",
    kind: "audio",
    preview: "/audio/previews/sacred-voices.mp3",
    shopSlug: "sacred-voices",
    description: { it: "Beat originale in vendita nello shop.", en: "Original beat on sale in the shop." },
  },
];
