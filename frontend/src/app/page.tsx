import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">

          <Link href="/" className="text-xl font-black tracking-tight">
            <span className="text-orange-500">CAREER</span>
            <span className="text-blue-600">NAVIGATOR</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-500/25 transition hover:bg-orange-600 hover:shadow-md hover:shadow-orange-500/30"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-50">

        {/* Background shapes */}
        <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-orange-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(100,116,139,0.15) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 30% 30%, black, transparent)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">

          <div className="max-w-3xl">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-orange-600">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              Career Navigator
            </div>

            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-slate-900 md:text-6xl">
              Navigate your career.
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                Build your future.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-500">
              Create your profile, discover opportunities, understand your
              strengths, and find a career path designed around you.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="group flex items-center gap-2 rounded-lg bg-orange-500 px-7 py-3.5 font-semibold text-white shadow-md shadow-orange-500/25 transition hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30"
              >
                Get Started
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 transition group-hover:translate-x-0.5">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

              <Link
                href="/login"
                className="rounded-lg border border-slate-300 bg-white px-7 py-3.5 font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Sign In
              </Link>
            </div>

            {/* Stats strip */}
            <div className="mt-14 flex flex-wrap gap-x-10 gap-y-4 border-t border-slate-200 pt-8">
              <div>
                <p className="text-2xl font-bold text-slate-900">10k+</p>
                <p className="text-sm text-slate-500">Careers explored</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">200+</p>
                <p className="text-sm text-slate-500">Career paths mapped</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">4.8/5</p>
                <p className="text-sm text-slate-500">Average user rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Everything you need to move forward
          </h2>
          <p className="mt-3 text-slate-500">
            Three simple steps to a career that fits you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">

          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900">
              Your Profile
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              Tell us about your skills, interests, and goals.
            </p>
          </div>

          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="m21 21-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900">
              Discover
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              Explore career possibilities matched to you.
            </p>
          </div>

          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="m7 15 4-4 3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900">
              Your Path
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              Build a step-by-step career roadmap.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}