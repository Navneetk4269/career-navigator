export default function RoadmapLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-6" aria-busy="true" role="status">
      <span className="sr-only">Loading your roadmap</span>
      <div className="mb-8 h-9 w-56 animate-pulse rounded-lg bg-slate-200" />
      <div className="mb-6 h-36 animate-pulse rounded-2xl bg-slate-100" />
      <div className="space-y-4">
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </main>
  );
}
