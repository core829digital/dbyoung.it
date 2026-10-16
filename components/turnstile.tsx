"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef } from "react";

/**
 * Widget Cloudflare Turnstile. Il token va inviato col form (campo `turnstile`)
 * e verificato server-side (lib/turnstile.ts).
 * Senza NEXT_PUBLIC_TURNSTILE_SITE_KEY non renderizza nulla (solo dev).
 */
export function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const ref = useRef<TurnstileInstance>(null);
  if (!siteKey) return null;
  return (
    <Turnstile
      ref={ref}
      siteKey={siteKey}
      onSuccess={onToken}
      onExpire={() => onToken("")}
      onError={() => onToken("")}
      options={{ theme: "dark" }}
    />
  );
}
