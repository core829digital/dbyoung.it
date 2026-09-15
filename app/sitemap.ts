import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://dbyoung.it";
  const pages = ["", "/artista", "/musica", "/opere", "/shop", "/eventi", "/contatti", "/privacy", "/termini", "/cookie", "/gdpr"];
  return pages.map((p) => ({ url: `${base}${p}`, lastModified: new Date(), changeFrequency: "weekly", priority: p === "" ? 1 : 0.7 }));
}
