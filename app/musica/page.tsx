import { Disc3, ExternalLink } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/reveal";
import { SOCIALS } from "@/lib/utils";

export const metadata = { title: "Musica · Spotify & Social — DBYoung" };

const PLATFORMS = [
  ["Spotify", SOCIALS.spotify, "Streaming ufficiale"],
  ["Instagram", SOCIALS.instagram, "Backstage & reel"],
  ["YouTube", SOCIALS.youtube, "Video & live"],
  ["Facebook", SOCIALS.facebook, "Eventi & community"],
  ["TikTok", SOCIALS.tiktok, "Clip & trend"],
  ["Apple Music", SOCIALS.appleMusic, "Catalogo completo"],
];

export default function MusicaPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 md:px-8">
      <SectionHeading kicker="Musica" title={<>Ascolta <span className="text-fire-gradient">DBYoung</span></>} sub="Seguici per nuove uscite, beat tape e session in studio." />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map(([name, href, desc]) => (
          <Reveal key={name}>
            <a href={href} className="card-hover flex items-center justify-between rounded-3xl border border-white/10 bg-obsidian-card p-6">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-fire to-fire-deep"><Disc3 className="h-5 w-5 text-white" /></span>
                <div><p className="font-display font-semibold">{name}</p><p className="text-sm text-white/55">{desc}</p></div>
              </div>
              <ExternalLink className="h-4 w-4 text-white/40" />
            </a>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-10 overflow-hidden rounded-[2rem] border border-white/10 bg-obsidian-card">
        <iframe
          src={SOCIALS.spotifyEmbed}
          width="100%"
          height="420"
          loading="lazy"
          title="DBYoung su Spotify"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          className="block"
        />
      </Reveal>
    </div>
  );
}
