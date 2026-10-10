"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-4xl font-semibold">Qualcosa è andato storto</h1>
      <p className="mt-3 text-sm text-white/60">Riprova o torna alla home. Dettaglio tecnico nascosto in produzione.</p>
      {process.env.NODE_ENV !== "production" && (
        <pre className="mt-4 w-full overflow-auto rounded-xl bg-black/50 p-4 text-left text-xs text-red-300">{error.message}</pre>
      )}
      <div className="mt-6 flex gap-2">
        <button onClick={reset} className="btn-fire rounded-full px-6 py-2.5 text-sm font-semibold">Riprova</button>
        <a href="/" className="rounded-full border border-white/20 px-6 py-2.5 text-sm text-white/80">Home</a>
      </div>
    </div>
  );
}
