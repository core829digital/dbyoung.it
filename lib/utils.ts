import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SUPERADMIN_EMAIL = "contact.core829@gmail.com";

/** Placeholder link — da sostituire con i link reali di DBYoung */
export const SOCIALS = {
  spotify: "#",
  instagram: "#",
  facebook: "#",
  youtube: "#",
  tiktok: "#",
  appleMusic: "#",
  soundcloud: "#",
};

export const CALENDLY_URL = "https://calendly.com/dbyoung/eventi";
