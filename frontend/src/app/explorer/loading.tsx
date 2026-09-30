export default function ExplorerLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6" aria-busy="true" role="status">
      <span className="sr-only">Loading Career Explorer</span>
      <div className="mb-8 h-9 w-64 animate-pulse rounded-lg bg-slate-200" />
      <div className="mb-6 h-36 animate-pulse rounded-2xl bg-slate-100" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-52 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-52 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </main>
  );
}
