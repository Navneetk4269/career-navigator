"use client";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function DashboardError({ retry }: DashboardErrorProps) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm" role="alert">
        <p className="text-sm font-bold uppercase tracking-wider text-red-600">Dashboard unavailable</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">We couldn&apos;t load your dashboard.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Your data is safe. Try loading this page again.</p>
        <button type="button" onClick={retry} className="mt-6 rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600">Try again</button>
      </section>
    </main>
  );
}
