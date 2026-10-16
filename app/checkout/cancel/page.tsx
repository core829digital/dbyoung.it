import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <XCircle className="h-12 w-12 text-white/40" />
      <h1 className="mt-4 font-display text-4xl font-semibold">Pagamento annullato</h1>
      <p className="mt-3 text-sm text-white/60">Nessun addebito effettuato. Il carrello è conservato.</p>
      <div className="mt-6 flex gap-2">
        <Link href="/checkout" className="btn-fire rounded-full px-6 py-2.5 text-sm font-semibold">Riprova</Link>
        <Link href="/shop" className="rounded-full border border-white/20 px-6 py-2.5 text-sm text-white/80">Shop</Link>
      </div>
    </div>
  );
}
