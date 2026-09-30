"use client";

type ExplorerErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function ExplorerError({ retry }: ExplorerErrorProps) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm" role="alert">
        <p className="text-sm font-bold uppercase tracking-wider text-red-600">Career Explorer unavailable</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">We couldn&apos;t load career data.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Please try again. Your profile and saved progress are unchanged.</p>
        <button type="button" onClick={retry} className="mt-6 rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600">Try again</button>
      </section>
    </main>
  );
}
