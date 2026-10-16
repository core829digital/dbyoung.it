import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

/** Mostrata dopo il redirect da Stripe. I diritti arrivano via webhook+email. */
export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <CheckCircle2 className="h-12 w-12 text-fire" />
      <h1 className="mt-4 font-display text-4xl font-semibold">Pagamento ricevuto</h1>
      <p className="mt-3 text-sm leading-relaxed text-white/60">
        Stiamo confermando il pagamento con Stripe. Riceverai a breve un&apos;email con i codici
        licenza e potrai scaricare da <Link href="/libreria" className="underline hover:text-fire-hot">/libreria</Link>.
        Se hai un account, li trovi anche in <Link href="/account" className="underline hover:text-fire-hot">/account</Link>.
      </p>
      <div className="mt-6 flex gap-2">
        <Link href="/libreria" className="btn-fire rounded-full px-6 py-2.5 text-sm font-semibold">Vai alla libreria</Link>
        <Link href="/shop" className="rounded-full border border-white/20 px-6 py-2.5 text-sm text-white/80">Shop</Link>
      </div>
    </div>
  );
}
