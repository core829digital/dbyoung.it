export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 md:px-8" aria-busy="true" aria-live="polite">
      <div className="h-8 w-48 animate-pulse rounded-full bg-white/10" />
      <div className="mt-4 h-12 w-3/4 animate-pulse rounded-2xl bg-white/10" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
        ))}
      </div>
    </div>
  );
}
