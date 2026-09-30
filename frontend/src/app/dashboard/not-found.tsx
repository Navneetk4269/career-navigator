import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wider text-blue-600">404</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">Dashboard page not found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">That dashboard view doesn&apos;t exist.</p>
        <Link href="/dashboard" className="mt-6 inline-flex rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600">Go to dashboard</Link>
      </section>
    </main>
  );
}
