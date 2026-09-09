import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SUPERADMIN_EMAIL = "contact.core829@gmail.com";

/** Link ufficiali di DBYoung */
export const SOCIALS = {
  spotify: "https://open.spotify.com/artist/38BZZnNarKezUPXXUz76pB?si=90_dcrVfR4yMmAmDfcx5oQ&utm_source=copy-link",
  spotifyEmbed: "https://open.spotify.com/embed/artist/38BZZnNarKezUPXXUz76pB",
  instagram: "https://www.instagram.com/dimitri_boutourline?utm_source=qr&igsi=dzV6Z2xsNDUxeXdh",
  facebook: "https://www.facebook.com/share/19Z5t1eNJi/",
  youtube: "https://youtube.com/channel/UCuTxCKGEvkPEPmZGZw-GQWA?si=9dRHGAKG75Igtb1R",
  tiktok: "https://www.tiktok.com/@d.b.young6?_r=1&_t=ZN-99YtuTH71oh",
  appleMusic: "#",
  soundcloud: "#",
};

export const CALENDLY_URL = "https://calendly.com/dbyoung/eventi";
