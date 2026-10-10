import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://dbyoung.it";
  const lastModified = new Date("2026-01-15");
  const pages = ["", "/artista", "/musica", "/opere", "/shop", "/libreria", "/eventi", "/contatti", "/privacy", "/termini", "/cookie", "/gdpr"];
  return pages.map((p) => ({ url: `${base}${p}`, lastModified, changeFrequency: "weekly", priority: p === "" ? 1 : p === "/shop" ? 0.9 : 0.7 }));
}
