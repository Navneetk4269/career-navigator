export default function DashboardLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-6" aria-busy="true" role="status">
      <span className="sr-only">Loading dashboard</span>
      <div className="mb-8 h-9 w-56 animate-pulse rounded-lg bg-slate-200" />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="h-52 animate-pulse rounded-2xl bg-slate-100 lg:col-span-2" />
        <div className="h-52 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100 lg:col-span-3" />
      </div>
    </main>
  );
}
