import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-fire-hot">404</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Pagina non trovata</h1>
      <p className="mt-3 text-sm text-white/60">La pagina che cerchi non esiste o è stata spostata.</p>
      <div className="mt-6 flex gap-2">
        <Link href="/" className="btn-fire rounded-full px-6 py-2.5 text-sm font-semibold">Torna alla home</Link>
        <Link href="/shop" className="rounded-full border border-white/20 px-6 py-2.5 text-sm text-white/80">Vai allo shop</Link>
      </div>
    </div>
  );
}
