"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "it" | "en";

/* Foto reali di Dimitri (public/dimitri-potos) */
const P = "/dimitri-potos/ChatGPT%20Image%2028%20ago%202026,";
export const PHOTOS = {
  logo: "/dimitri-potos/DBYOUNG%20LOGO%20trasparent%20webp.webp",
  heroProfile: `${P}%2017_03_29.png`,
  homeArtist: `${P}%2016_32_34.png`,
  artistPortrait: `${P}%2017_28_57.png`,
  eventsMood: `${P}%2017_15_42.png`,
  gallery: [`${P}%2016_44_51.png`, `${P}%2016_53_22.png`, `${P}%2017_07_52.png`],
};

/* Link Isola Events / Location (il portale completo vivrà su events.dbyoung.it) */
export const ISOLA = {
  name: "Isola Events",
  location: "Fattoria Isola",
  instagramLocation: "https://www.instagram.com/fattoria_isola_?stkn=NjI1bTEzZnFjY2Fz",
  instagramEvents: "https://www.instagram.com/isola_events_?stkn=MTRkbXdidXRxOHYyOQ==",
};

const it = {
  nav: {
    home: "Home",
    artist: "Chi è DBYoung",
    music: "Musica",
    works: "Opere",
    shop: "Shop",
    events: "Eventi",
    contact: "Contatti",
    shopCta: "Shop",
    toShop: "Vai allo Shop",
  },
  hero: {
    badge: "Jazz · Blues · Classica · Moderna",
    name: "Dimitri Bouturline",
    desc: "Compositore a 360°: jazz, blues, musica classica e moderna con un tono attivo ed energetico — strumenti veri ed eventi organizzati che muovono club e festival. Compra beat, sample pack o affidagli il tuo evento.",
    ctaShop: "Compra i Beat",
    ctaEvent: "Organizza il tuo Evento",
  },
  home: {
    stats: [
      ["100%", "Strumenti veri"],
      ["360°", "Compositore"],
      ["4", "Generi: jazz, blues, classica, moderna"],
      ["24h", "Consegna file"],
    ] as [string, string][],
    artistKicker: "L'artista",
    artistTitleA: "Jazz, blues, classica e moderna con un",
    artistTitleB: "tono moderno",
    artistTitleC: ", attivo ed energetico.",
    artistText:
      "Dimitri Bouturline, in arte DBYoung, è un compositore a 360 gradi: spazia dal jazz al blues fino alla musica classica e moderna, scrivendo, arrangiando e producendo con strumenti vivi e reali — dal piano ai fiati, dalla chitarra alla batteria. Un ponte tra tradizione jazz, blues e classica e il suono di oggi.",
    artistCta1: "Scopri la storia",
    artistCta2: "Ascolta",
    artistBadge: "Eventi · Studio · Collab",
    artistBadgeLink: "Organizza →",
    shopKicker: "Shop",
    shopTitleA: "Beat & Sample Pack",
    shopTitleB: "in evidenza",
    shopSub: "File pronti al mix, registrati con strumenti veri. Pagamento sicuro con Stripe.",
    shopCta: "Vai allo Shop completo",
    eventsKicker: "Eventi & Organizzazione",
    eventsTitleA: "Organizza il tuo evento",
    eventsTitleB: "con DBYoung.",
    eventsText:
      "Club, festival, eventi privati e collaborazioni: Dimitri li organizza e li produce con Isola Events. Prenota una call conoscitiva: raccontaci la tua idea, al resto pensiamo noi — scaletta, artisti, band e produzione.",
    eventsCta: "Organizza ora",
    eventsCards: [
      ["Club & Serate", "Set su misura"],
      ["Festival", "Grandi palchi"],
      ["Privati", "Eleganza sartoriale"],
      ["Collaborazioni", "Artisti & brand"],
    ] as [string, string][],
    newsKicker: "Newsletter",
    newsTitle: "Beat gratis ogni mese.",
    newsSub: "Iscriviti: un beat free, sconti sugli sample pack e prevendite eventi. Zero spam.",
    newsPlaceholder: "la-tua-email@esempio.it",
    newsButton: "Iscriviti",
    newsPrivacy: "Iscrivendoti accetti la",
    newsPrivacyLink: "Privacy Policy",
  },
  artist: {
    kicker: "Dimitri Bouturline",
    p1: "Artista e compositore a 360 gradi: jazz, blues, musica classica e moderna con un tono attivo ed energetico.",
    p2: "Lavora con strumenti vivi e reali — piano, chitarra, basso, batteria e fiati — tra studio, composizione e organizzazione di eventi. Il suo suono unisce la tradizione jazz, blues e classica alla produzione contemporanea: perfetto per artisti che cercano beat con carattere, sample pack registrati live ed eventi organizzati e prodotti ad alta energia.",
    ctaShop: "Compra i Beat",
    ctaCollab: "Collabora",
    ctaWorks: "Vedi le opere",
    soundKicker: "Il suono",
    soundTitle: "Strumenti veri, energia moderna",
    soundSub: "Ogni produzione nasce da take live, poi rifinite con produzione contemporanea.",
    cards: [
      ["Keys & Piano", "Rhodes, Wurlitzer, piano acustico"],
      ["Chitarre Blues", "Riff, lick e ritmiche live"],
      ["Batteria Live", "Groove e fill registrati in studio"],
      ["Fiati & Classica", "Ottoni, archi e arrangiamenti"],
    ] as [string, string][],
    galleryKicker: "Galleria",
    galleryTitle: "Dimitri in bianco e nero",
  },
  works: {
    kicker: "Curriculum · Composizioni",
    titleA: "Opere &",
    titleB: "lavori svolti",
    sub: "Selezione di composizioni originali tra classica, moderna, jazz e blues. Spartiti e file audio completi disponibili su richiesta — il catalogo è in continuo aggiornamento.",
    headers: ["Opera", "Genere", "Anno", "File"],
    fileSoon: "File in arrivo",
    download: "Scarica",
    ctaTitle: "Cerchi uno spartito o una commissione?",
    ctaText: "Scrivici: inviamo spartiti, stems e preventivi per opere su misura.",
    ctaButton: "Richiedi un'opera",
  },
  music: {
    kicker: "Musica",
    titleA: "Ascolta",
    titleB: "DBYoung",
    sub: "Seguici per nuove uscite, beat tape e session in studio.",
    descs: ["Streaming ufficiale", "Backstage & reel", "Video & session", "Eventi & community", "Clip & trend", "Catalogo completo"] as string[],
  },
  shop: {
    kicker: "Shop · shop.dbyoung.it",
    titleA: "Beat &",
    titleB: "Sample Pack",
    sub: "Strumenti veri, mix pronti, licenze chiare. Paghi in sicurezza con Stripe (Payment Link) e ricevi i file via email. Anteprime audio complete in arrivo.",
    filters: ["Tutti", "Beats", "Sample Packs", "Offerte"] as string[],
    types: { beat: "Beat", "sample-pack": "Sample Pack", offerta: "Offerta" } as Record<string, string>,
    buy: "Compra",
    listen: "Ascolta",
    customTitleA: "Vuoi un beat",
    customTitleB: "su misura?",
    customText: "Commissiona una produzione esclusiva: raccontaci riferimenti, BPM e mood — consegna con stems e licenza esclusiva.",
    customCta: "Richiedi produzione custom",
  },
  events: {
    kicker: "Eventi · Isola Events",
    titleA: "Organizza il tuo evento",
    titleB: "con DBYoung",
    sub: "Club, festival, eventi privati e collaborazioni: Dimitri Bouturline li organizza e li produce con Isola Events — non si esibisce come cantante. Scegli un orario dal calendario per una call conoscitiva gratuita, oppure scrivici direttamente.",
    isolaBadge: "A cura di Isola Events · Fattoria Isola",
    isolaText:
      "Isola Events è l'organizzazione di Dimitri per eventi eleganti e memorabili: standard alto, clientela esigente, cura sartoriale di ogni dettaglio — dalla direzione artistica alla produzione. Il portale dedicato con i due format e la storia della location è in arrivo su events.dbyoung.it.",
    isolaInsta1: "Location: Fattoria Isola",
    isolaInsta2: "Format: Isola Events",
    isolaSoon: "Calendario completo dei format in arrivo sul portale eventi.",
    calTitle: "Calendario — call conoscitiva (30 min, gratis)",
    contactsTitle: "Contatti diretti",
    contactRows: ["booking@dbyoung.it", "+39 000 000 0000", "Risposta entro 24–48h"] as string[],
    formTitle: "Richiedi preventivo evento",
    name: "Nome e cognome",
    email: "Email",
    date: "Data",
    city: "Città / Venue",
    message: "Tipo di evento, ospiti attesi, budget indicativo…",
    submit: "Invia richiesta",
    privacyNote: "Inviando accetti la",
    privacyLink: "Privacy Policy",
  },
  contact: {
    kicker: "Contatti",
    titleA: "Parliamone",
    titleB: "direttamente",
    sub: "Beat custom, eventi, collaborazioni e stampa. Rispondiamo entro 24–48h.",
    card1T: "Organizzazione eventi",
    card1D: "Raccontaci la tua idea o prenota una call dal calendario.",
    card2T: "Email generale",
    card2D: "info@dbyoung.it",
    name: "Nome",
    email: "Email",
    subject: "Oggetto (es. Beat custom, Evento 12/07, Collab)",
    message: "Il tuo messaggio…",
    submit: "Invia messaggio",
  },
  chat: {
    title: "Chat con DBYoung",
    hello:
      "Ciao! Sono l'assistente di DBYoung. Scrivimi per beat, sample pack o eventi — ti risponde il team (chat live in arrivo).",
    reply: "Grazie! Ti abbiamo letto — per urgenze scrivi a info@dbyoung.it o vai alla pagina eventi.",
    placeholder: "Scrivi un messaggio…",
  },
  consent: {
    text: "Usiamo cookie tecnici e — solo con il tuo consenso — contenuti di terze parti (Calendly, Spotify, Stripe).",
    accept: "Accetta",
    reject: "Solo tecnici",
    policy: "Cookie Policy",
    gateTitle: "Contenuto di terzi",
    gateText: "Accetta i cookie per caricare questo contenuto (Calendly / Spotify).",
    gateButton: "Accetta e carica",
  },
  forms: {
    sending: "Invio…",
    okNews: "Iscrizione registrata! Ti scriveremo presto.",
    okBooking: "Richiesta inviata! Ti ricontattiamo entro 24–48h.",
    okContact: "Messaggio inviato! Ti risponderemo presto.",
    err: "Qualcosa non ha funzionato. Riprova o scrivici via email.",
  },
  footer: {
    tag: "Dimitri Bouturline — compositore a 360° (jazz, blues, classica, moderna) e organizzatore di eventi con Isola Events.",
    explore: "Esplora",
    shop: "Shop",
    legal: "Legale",
    exploreLinks: ["Chi è DBYoung", "Musica", "Opere", "Shop", "Eventi", "Contatti"] as string[],
    shopLinks: ["Beats", "Sample Packs", "Offerte", "Licenze"] as string[],
    legalLinks: ["Privacy Policy", "Termini di utilizzo", "Cookie Policy", "GDPR & Trattamento dati"] as string[],
    rights: "Tutti i diritti riservati.",
  },
  legal: {
    enNote: "English summary — the full legally binding text below is in Italian.",
    privacyEn: "We collect only what we need (contact details, orders via Stripe, newsletter with consent). No card data stored. Rights (access, deletion, portability): privacy@dbyoung.it.",
    terminiEn: "Buying a file grants a usage license (not copyright). Digital goods: withdrawal ends when download starts. Live contracts are agreed separately in writing.",
    cookieEn: "Only technical cookies by default. Third-party cookies (Calendly, Stripe, Spotify) load only after your consent.",
    gdprEn: "Data controller: Dimitri Bouturline (DBYoung). Processors: Vercel, Convex, Stripe, Resend, Calendly. Exercise your rights: privacy@dbyoung.it (reply within 30 days).",
  },
};

export type Dict = typeof it;

const en: Dict = {
  nav: {
    home: "Home",
    artist: "About DBYoung",
    music: "Music",
    works: "Works",
    shop: "Shop",
    events: "Events",
    contact: "Contact",
    shopCta: "Shop",
    toShop: "Go to Shop",
  },
  hero: {
    badge: "Jazz · Blues · Classical · Modern",
    name: "Dimitri Bouturline",
    desc: "360° composer: jazz, blues, classical and modern music with an active, energetic tone — real instruments and curated events that move clubs and festivals. Shop beats, sample packs or trust him with your event.",
    ctaShop: "Shop Beats",
    ctaEvent: "Plan Your Event",
  },
  home: {
    stats: [
      ["100%", "Real instruments"],
      ["360°", "Composer"],
      ["4", "Genres: jazz, blues, classical, modern"],
      ["24h", "File delivery"],
    ] as [string, string][],
    artistKicker: "The artist",
    artistTitleA: "Jazz, blues, classical and modern with a",
    artistTitleB: "modern tone",
    artistTitleC: " — active and energetic.",
    artistText:
      "Dimitri Bouturline, aka DBYoung, is a 360-degree composer: from jazz to blues, classical and modern music — writing, arranging and producing with living, real instruments, from piano to horns, guitar to drums. A bridge between jazz, blues and classical tradition and today's sound.",
    artistCta1: "Discover the story",
    artistCta2: "Listen",
    artistBadge: "Events · Studio · Collabs",
    artistBadgeLink: "Organize →",
    shopKicker: "Shop",
    shopTitleA: "Featured Beats",
    shopTitleB: "& Sample Packs",
    shopSub: "Mix-ready files recorded with real instruments. Secure Stripe checkout.",
    shopCta: "Go to the full Shop",
    eventsKicker: "Events & Production",
    eventsTitleA: "Plan your event",
    eventsTitleB: "with DBYoung.",
    eventsText:
      "Clubs, festivals, private events and collaborations: Dimitri organizes and produces them with Isola Events. Book an intro call: tell us your idea — setlist, artists, band and production are on us.",
    eventsCta: "Start now",
    eventsCards: [
      ["Clubs & Nights", "Tailored sets"],
      ["Festivals", "Big stages"],
      ["Private", "Tailored elegance"],
      ["Collaborations", "Artists & brands"],
    ] as [string, string][],
    newsKicker: "Newsletter",
    newsTitle: "A free beat every month.",
    newsSub: "Subscribe: one free beat, sample-pack discounts and event pre-sales. Zero spam.",
    newsPlaceholder: "your-email@example.com",
    newsButton: "Subscribe",
    newsPrivacy: "By subscribing you accept the",
    newsPrivacyLink: "Privacy Policy",
  },
  artist: {
    kicker: "Dimitri Bouturline",
    p1: "360-degree artist and composer: jazz, blues, classical and modern music with an active, energetic tone.",
    p2: "He works with living, real instruments — piano, guitar, bass, drums and horns — across studio, composition and event production. His sound blends jazz, blues and classical tradition with contemporary production: perfect for artists seeking characterful beats, live-recorded sample packs and high-energy organized events.",
    ctaShop: "Shop Beats",
    ctaCollab: "Collaborate",
    ctaWorks: "See the works",
    soundKicker: "The sound",
    soundTitle: "Real instruments, modern energy",
    soundSub: "Every production starts from live takes, refined with contemporary production.",
    cards: [
      ["Keys & Piano", "Rhodes, Wurlitzer, acoustic piano"],
      ["Blues Guitars", "Live riffs, licks and rhythms"],
      ["Live Drums", "Studio-recorded grooves and fills"],
      ["Horns & Classical", "Brass, strings and arrangements"],
    ] as [string, string][],
    galleryKicker: "Gallery",
    galleryTitle: "Dimitri in black and white",
  },
  works: {
    kicker: "Résumé · Compositions",
    titleA: "Works &",
    titleB: "selected pieces",
    sub: "A selection of original compositions across classical, modern, jazz and blues. Full scores and audio files available on request — the catalogue is constantly growing.",
    headers: ["Work", "Genre", "Year", "File"],
    fileSoon: "File coming soon",
    download: "Download",
    ctaTitle: "Looking for a score or a commission?",
    ctaText: "Write to us: we send scores, stems and quotes for bespoke works.",
    ctaButton: "Request a work",
  },
  music: {
    kicker: "Music",
    titleA: "Listen to",
    titleB: "DBYoung",
    sub: "Follow for new releases, beat tapes and studio sessions.",
    descs: ["Official streaming", "Backstage & reels", "Videos & sessions", "Events & community", "Clips & trends", "Full catalogue"] as string[],
  },
  shop: {
    kicker: "Shop · shop.dbyoung.it",
    titleA: "Beats &",
    titleB: "Sample Packs",
    sub: "Real instruments, mix-ready files, clear licenses. Secure Stripe checkout (Payment Link) with email delivery. Full audio previews coming soon.",
    filters: ["All", "Beats", "Sample Packs", "Deals"] as string[],
    types: { beat: "Beat", "sample-pack": "Sample Pack", offerta: "Deal" } as Record<string, string>,
    buy: "Buy",
    listen: "Listen",
    customTitleA: "Want a bespoke",
    customTitleB: "beat?",
    customText: "Commission an exclusive production: tell us references, BPM and mood — delivered with stems and exclusive license.",
    customCta: "Request custom production",
  },
  events: {
    kicker: "Events · Isola Events",
    titleA: "Plan your event",
    titleB: "with DBYoung",
    sub: "Clubs, festivals, private events and collaborations: Dimitri Bouturline organizes and produces them with Isola Events — he does not perform as a singer. Pick a slot for a free intro call, or write to us directly.",
    isolaBadge: "Curated by Isola Events · Fattoria Isola",
    isolaText:
      "Isola Events is Dimitri's organization for elegant, memorable events: high standards, demanding clientele, tailored care of every detail — from artistic direction to production. The dedicated portal with the two formats and the location story is coming soon at events.dbyoung.it.",
    isolaInsta1: "Location: Fattoria Isola",
    isolaInsta2: "Formats: Isola Events",
    isolaSoon: "Full format calendar coming soon on the events portal.",
    calTitle: "Calendar — intro call (30 min, free)",
    contactsTitle: "Direct contacts",
    contactRows: ["booking@dbyoung.it", "+39 000 000 0000", "Reply within 24–48h"] as string[],
    formTitle: "Request an event quote",
    name: "Full name",
    email: "Email",
    date: "Date",
    city: "City / Venue",
    message: "Event type, expected guests, indicative budget…",
    submit: "Send request",
    privacyNote: "By sending you accept the",
    privacyLink: "Privacy Policy",
  },
  contact: {
    kicker: "Contact",
    titleA: "Let's talk",
    titleB: "directly",
    sub: "Custom beats, events, collaborations and press. We reply within 24–48h.",
    card1T: "Event production",
    card1D: "Tell us your idea or book a call from the calendar.",
    card2T: "General email",
    card2D: "info@dbyoung.it (general inquiries)",
    name: "Name",
    email: "Email",
    subject: "Subject (e.g. Custom beat, Event 12/07, Collab)",
    message: "Your message…",
    submit: "Send message",
  },
  chat: {
    title: "Chat with DBYoung",
    hello: "Hi! I'm DBYoung's assistant. Ask me about beats, sample packs or events — the team will reply (live chat coming).",
    reply: "Thanks! We've read you — for urgent matters write to info@dbyoung.it or visit the events page.",
    placeholder: "Write a message…",
  },
  consent: {
    text: "We use technical cookies and — only with your consent — third-party content (Calendly, Spotify, Stripe).",
    accept: "Accept",
    reject: "Essential only",
    policy: "Cookie Policy",
    gateTitle: "Third-party content",
    gateText: "Accept cookies to load this content (Calendly / Spotify).",
    gateButton: "Accept & load",
  },
  forms: {
    sending: "Sending…",
    okNews: "Subscribed! We'll write to you soon.",
    okBooking: "Request sent! We'll get back within 24–48h.",
    okContact: "Message sent! We'll reply soon.",
    err: "Something went wrong. Try again or email us.",
  },
  footer: {
    tag: "Dimitri Bouturline — 360° composer (jazz, blues, classical, modern) and event organizer with Isola Events.",
    explore: "Explore",
    shop: "Shop",
    legal: "Legal",
    exploreLinks: ["About DBYoung", "Music", "Works", "Shop", "Events", "Contact"] as string[],
    shopLinks: ["Beats", "Sample Packs", "Deals", "Licenses"] as string[],
    legalLinks: ["Privacy Policy", "Terms of use", "Cookie Policy", "GDPR & Data processing"] as string[],
    rights: "All rights reserved.",
  },
  legal: {
    enNote: "English summary — the full legally binding text below is in Italian.",
    privacyEn: "We collect only what we need (contact details, orders via Stripe, newsletter with consent). No card data stored. Rights (access, deletion, portability): privacy@dbyoung.it.",
    terminiEn: "Buying a file grants a usage license (not copyright). Digital goods: withdrawal ends when download starts. Live contracts are agreed separately in writing.",
    cookieEn: "Only technical cookies by default. Third-party cookies (Calendly, Stripe, Spotify) load only after your consent.",
    gdprEn: "Data controller: Dimitri Bouturline (DBYoung). Processors: Vercel, Convex, Stripe, Resend, Calendly. Exercise your rights: privacy@dbyoung.it (reply within 30 days).",
  },
};

export const STRINGS: Record<Lang, Dict> = { it, en };

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
}

const Ctx = createContext<LangCtx>({ lang: "it", setLang: () => {}, t: it });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("it");

  useEffect(() => {
    const saved = localStorage.getItem("dby-lang");
    if (saved === "en" || saved === "it") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("dby-lang", lang);
  }, [lang ]);

  return <Ctx.Provider value={{ lang, setLang: setLangState, t: STRINGS[lang] }}>{children}</Ctx.Provider>;
}

export function useLang() {
  return useContext(Ctx);
}

export function LangToggle({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <div className={`flex items-center rounded-full border border-white/15 bg-white/5 p-0.5 text-[11px] font-semibold ${compact ? "" : "md:text-xs"}`}>
      {(["it", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-label={l === "it" ? "Italiano" : "English"}
          className={`rounded-full px-2.5 py-1 uppercase transition-all ${lang === l ? "bg-fire text-white shadow-fire" : "text-white/55 hover:text-white"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
