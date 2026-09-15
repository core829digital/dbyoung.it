"use client";

import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { useLang, PHOTOS } from "@/lib/i18n";

/* ---------------- WordsPullUp ---------------- */
interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  style?: React.CSSProperties;
}

export const WordsPullUp = ({ text, className = "", showAsterisk = false, style }: WordsPullUpProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(" ");

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <motion.span
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative inline-block"
            style={{ marginRight: isLast ? 0 : "0.25em" }}
          >
            {word}
            {showAsterisk && isLast && (
              <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em] text-fire">*</span>
            )}
          </motion.span>
        );
      })}
    </div>
  );
};

/* ---------------- WordsPullUpMultiStyle ---------------- */
interface Segment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[];
  className?: string;
  style?: React.CSSProperties;
}

export const WordsPullUpMultiStyle = ({ segments, className = "", style }: WordsPullUpMultiStyleProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const words: { word: string; className?: string }[] = [];
  segments.forEach((seg) => {
    seg.text.split(" ").forEach((w) => {
      if (w) words.push({ word: w, className: seg.className });
    });
  });

  return (
    <div ref={ref} className={`inline-flex flex-wrap justify-center ${className}`} style={style}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className={`inline-block ${w.className ?? ""}`}
          style={{ marginRight: "0.25em" }}
        >
          {w.word}
        </motion.span>
      ))}
    </div>
  );
};

/* ---------------- DBYoung Hero ---------------- */
export const DBYoungHero = () => {
  const { t } = useLang();

  return (
    <section className="h-[100svh] w-full px-2 pt-2 md:px-3 md:pt-3">
      <div className="relative h-full w-full overflow-hidden rounded-2xl md:rounded-[2rem]">
        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600&q=80"
          className="absolute inset-0 h-full w-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
        />

        {/* Noise overlay */}
        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay" />

        {/* Gradient overlay brand: obsidian + fuoco */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#0A0A0B]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_100%,rgba(255,77,0,0.28),transparent_70%)]" />

        {/* Navbar globale: pill centrata in alto (components/navbar.tsx) — non duplicare qui */}

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 sm:px-6 md:px-10">
          <div className="grid grid-cols-12 items-end gap-6 lg:gap-8">
            {/* Foto profilo artista — grande, a sinistra, stile Spotify */}
            <div className="col-span-12 flex flex-row items-center gap-5 lg:col-span-4 lg:flex-col lg:items-start lg:gap-4 lg:pb-8">
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative shrink-0"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="absolute -inset-4 rounded-full bg-fire/30 blur-2xl" />
                  <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-fire via-fire-hot to-fire-deep" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={PHOTOS.heroProfile}
                    alt="Dimitri Bouturline — DBYoung"
                    className="relative h-32 w-32 rounded-full border-4 border-black object-cover shadow-fire sm:h-44 sm:w-44 lg:h-64 lg:w-64 xl:h-72 xl:w-72"
                  />
                  <span className="absolute bottom-2 right-2 h-5 w-5 rounded-full border-[3px] border-black bg-fire lg:bottom-4 lg:right-4 lg:h-6 lg:w-6" />
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                <p className="font-display text-2xl font-light tracking-tight text-fire-gradient sm:text-3xl lg:text-4xl">
                  {t.hero.name}
                </p>
                <p className="mt-1 inline-flex items-center gap-2 rounded-full border border-fire/40 bg-black/60 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-fire-ember backdrop-blur md:text-[11px]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fire" />
                  {t.hero.badge}
                </p>
              </motion.div>
            </div>

            <div className="col-span-12 lg:col-span-8">
              <h1
                className="font-display font-medium leading-[0.85] tracking-[-0.07em] text-[19vw] sm:text-[17vw] md:text-[15vw] lg:text-[11vw] xl:text-[10vw]"
                style={{ color: "#FFFFFF" }}
              >
                <WordsPullUp text="DBYoung" showAsterisk />
              </h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-3 max-w-2xl text-xs text-white/70 sm:text-sm md:text-base"
                style={{ lineHeight: 1.4 }}
              >
                {t.hero.desc}
              </motion.p>

              <div className="mt-5 flex flex-wrap gap-3 pb-4 lg:pb-8">
                <motion.a
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  href="/shop"
                  className="btn-fire group inline-flex items-center gap-2 self-start rounded-full py-1 pl-5 pr-1 text-sm font-medium sm:text-base"
                >
                  {t.hero.ctaShop}
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
                    <ArrowRight className="h-4 w-4 text-fire-ember" />
                  </span>
                </motion.a>
                <motion.a
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  href="/eventi"
                  className="inline-flex items-center gap-2 self-start rounded-full border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-medium text-white backdrop-blur transition-all hover:border-fire/60 hover:bg-fire/10 hover:text-fire-ember sm:text-base"
                >
                  {t.hero.ctaEvent}
                </motion.a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
