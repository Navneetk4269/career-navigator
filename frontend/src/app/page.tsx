"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePopup } from "./components/PopupProvider";

export default function Home() {
  const { showPopup } = usePopup();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    setIsLoggedIn(false);

    showPopup("Logged out successfully!", "success");

    setTimeout(() => {
      window.location.href = "/";
    }, 800);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fafc] text-slate-900">

      {/* ================= BACKGROUND ================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-48 -top-40 h-[600px] w-[600px] rounded-full bg-orange-200/30 blur-[120px]" />

        <div className="absolute -right-48 top-[350px] h-[650px] w-[650px] rounded-full bg-blue-200/25 blur-[140px]" />

        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-orange-100/30 blur-[120px]" />
      </div>


      {/* ================= NAVBAR ================= */}

      <nav className="relative z-30 border-b border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6">

          {/* ================= LOGO ================= */}

          <Link
            href="/"
            className="group flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-orange-500 to-blue-600 text-white shadow-lg shadow-orange-500/20 transition duration-300 group-hover:scale-105 group-hover:rotate-3">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
              >
                <path
                  d="M4 17 10 11l4 4 6-8"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M16 7h4v4"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

            </div>

            <div>

              <div className="text-lg font-black tracking-tight">
                <span className="text-orange-500">
                  CAREER
                </span>

                <span className="ml-1 text-blue-600">
                  NAVIGATOR
                </span>
              </div>

              <p className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:block">
                Build your future
              </p>

            </div>

          </Link>


          {/* ================= NAVIGATION ================= */}

          <div className="flex items-center gap-1 sm:gap-2">

            {/* ================= LOGGED OUT NAVIGATION ================= */}

            {!isLoggedIn && (
              <>

                {/* Home */}

                <Link
                  href="/"
                  className="hidden rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-600 transition-all duration-200 hover:bg-blue-100 md:block"
                >
                  Home
                </Link>


                {/* Sign In */}

                <Link
                  href="/login"
                  className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 md:block"
                >
                  Sign In
                </Link>


                {/* Get Started */}

                <Link
                  href="/signup"
                  className="hidden rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/30 md:block"
                >
                  Get Started
                </Link>

              </>
            )}


            {/* ================= LOGGED IN NAVIGATION ================= */}

            {isLoggedIn && (
              <>

                {/* Home */}

                <Link
                  href="/"
                  className="hidden rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-600 transition-all duration-200 hover:bg-blue-100 md:block"
                >
                  Home
                </Link>


                {/* Dashboard */}

                <Link
                  href="/dashboard"
                  className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 lg:block"
                >
                  Dashboard
                </Link>


                {/* Career Explorer */}

                <Link
                  href="/explorer"
                  className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 lg:block"
                >
                  Career Explorer
                </Link>


                {/* My Roadmap */}

                <Link
                  href="/my-roadmap"
                  className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 lg:block"
                >
                  My Roadmap
                </Link>


                {/* Profile */}

                <Link
                  href="/profile"
                  className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 md:block"
                >
                  Profile
                </Link>


                {/* Divider */}

                <div className="mx-1 hidden h-7 w-px bg-slate-200 lg:block" />


                {/* Logout */}

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Logout"
                  className="group hidden items-center gap-2 rounded-xl border border-transparent px-3.5 py-2.5 text-sm font-semibold text-slate-500 transition-all duration-200 hover:border-red-100 hover:bg-red-50 hover:text-red-600 md:flex"
                >

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-0.5"
                  >

                    <path
                      d="M10 17l5-5-5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M15 12H3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M14 5V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                  </svg>

                  <span>
                    Logout
                  </span>

                </button>

              </>
            )}

          </div>

        </div>
      </nav>


      {/* ================= HERO ================= */}

      <section className="relative z-10 overflow-hidden">

        {/* Grid */}

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(100,116,139,0.18) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse 75% 70% at 50% 30%, black, transparent)",
          }}
        />


        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-28 lg:py-32">

          {/* Hero Text */}

          <div className="mx-auto max-w-4xl text-center">

            {/* Badge */}

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-600 shadow-sm backdrop-blur">

              <span className="relative flex h-2 w-2">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />

              </span>

              AI-Powered Career Guidance

            </div>


            {/* Heading */}

            <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">

              Navigate your

              <br />

              <span className="text-slate-950">
                career.
              </span>

              <span className="block bg-gradient-to-r from-orange-500 via-orange-500 to-blue-600 bg-clip-text text-transparent">
                Build your future.
              </span>

            </h1>


            {/* Description */}

            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-slate-500 sm:text-lg">

              Discover your strengths, identify career opportunities,
              understand the skills you need, and build a personalized
              roadmap towards your future.

            </p>


            {/* CTA Buttons */}

            <div className="mt-9 flex flex-wrap justify-center gap-4">

              {/* Logged Out */}

              {!isLoggedIn && (
                <>

                  <Link
                    href="/signup"
                    className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-500 to-orange-600 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-orange-500/25 transition duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/30"
                  >

                    Get Started

                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-4 w-4 transition group-hover:translate-x-0.5"
                      >

                        <path
                          d="M5 12h14M13 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                      </svg>

                    </div>

                  </Link>


                  <Link
                    href="/login"
                    className="rounded-2xl border border-slate-200 bg-white/80 px-7 py-4 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md"
                  >
                    Sign In
                  </Link>

                </>
              )}


              {/* Logged In */}

              {isLoggedIn && (
                <Link
                  href="/explorer"
                  className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-500 to-orange-600 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-orange-500/25 transition duration-200 hover:-translate-y-1 hover:shadow-2xl"
                >

                  Explore Careers

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5 transition group-hover:translate-x-1"
                  >

                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                  </svg>

                </Link>
              )}

            </div>


            {/* Trust Text */}

            <div className="mt-7 flex items-center justify-center gap-3 text-sm text-slate-400">

              <div className="flex -space-x-2">

                <div className="h-7 w-7 rounded-full border-2 border-white bg-orange-200" />

                <div className="h-7 w-7 rounded-full border-2 border-white bg-blue-200" />

                <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-300" />

              </div>

              <span>
                Start building your personalized career journey today.
              </span>

            </div>

          </div>


          {/* ================= STATS ================= */}

          <div className="mt-20 grid gap-4 border-t border-slate-200/70 pt-8 sm:grid-cols-3 lg:mt-24">

            <div className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md">

              <p className="text-3xl font-black text-slate-900">
                10k+
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Careers explored
              </p>

            </div>


            <div className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md">

              <p className="text-3xl font-black text-slate-900">
                200+
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Career paths mapped
              </p>

            </div>


            <div className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md">

              <p className="text-3xl font-black text-slate-900">
                4.8/5
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Average user rating
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================= FEATURES ================= */}

      <section className="relative z-10 border-t border-slate-200/70 bg-white/60 py-24 backdrop-blur-sm">

        <div className="mx-auto max-w-7xl px-5 sm:px-6">

          {/* Section Header */}

          <div className="mx-auto max-w-2xl text-center">

            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
              How it works
            </div>


            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">

              Everything you need

              <span className="block text-slate-500">
                to move forward.
              </span>

            </h2>


            <p className="mt-5 text-base leading-7 text-slate-500">

              Three simple steps to discover your strengths and build
              a career path designed around you.

            </p>

          </div>


          {/* Feature Cards */}

          <div className="mt-14 grid gap-6 md:grid-cols-2">

            {/* Card 1 */}

            <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10">

              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-100/50 blur-2xl transition group-hover:bg-orange-200/60" />

              <div className="relative">

                <div className="mb-7 flex items-center justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 shadow-sm transition duration-300 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white">

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-6 w-6"
                    >

                      <path
                        d="M20 21a8 8 0 1 0-16 0"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />

                      <circle
                        cx="12"
                        cy="7"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="2"
                      />

                    </svg>

                  </div>

                  <span className="text-5xl font-black text-slate-100 transition group-hover:text-orange-100">
                    01
                  </span>

                </div>


                <h3 className="text-xl font-bold text-slate-900">
                  Build Your Profile
                </h3>


                <p className="mt-3 leading-7 text-slate-500">

                  Add your skills, interests, education and experience
                  so we can understand your career potential.

                </p>


                <Link
                  href="/profile"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-orange-500 transition group-hover:gap-3"
                >
                  Create profile
                  <span>→</span>
                </Link>

              </div>

            </div>


            {/* Card 2 */}

            <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10">

              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-100/50 blur-2xl transition group-hover:bg-blue-200/60" />

              <div className="relative">

                <div className="mb-7 flex items-center justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm transition duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-6 w-6"
                    >

                      <circle
                        cx="11"
                        cy="11"
                        r="7"
                        stroke="currentColor"
                        strokeWidth="2"
                      />

                      <path
                        d="m21 21-4.3-4.3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />

                    </svg>

                  </div>

                  <span className="text-5xl font-black text-slate-100 transition group-hover:text-blue-100">
                    02
                  </span>

                </div>


                <h3 className="text-xl font-bold text-slate-900">
                  Explore Careers
                </h3>


                <p className="mt-3 leading-7 text-slate-500">

                  Discover career opportunities and explore roles that
                  match your skills and interests.

                </p>


                <Link
                  href="/explorer"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition group-hover:gap-3"
                >
                  Explore careers
                  <span>→</span>
                </Link>

              </div>

            </div>

          </div>


          {/* ================= BOTTOM CTA ================= */}

          <div className="mt-16 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-10 shadow-2xl sm:px-10">

            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <p className="text-sm font-bold uppercase tracking-[0.15em] text-orange-400">
                  Your future starts here
                </p>

                <h3 className="mt-3 text-3xl font-black text-white">
                  Ready to find your direction?
                </h3>

                <p className="mt-3 max-w-xl leading-7 text-slate-400">

                  Create your profile and start exploring career opportunities
                  tailored to your strengths and goals.

                </p>

              </div>


              <Link
                href={isLoggedIn ? "/explorer" : "/signup"}
                className="group flex w-fit items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-7 py-4 font-bold text-white shadow-xl shadow-orange-500/20 transition hover:-translate-y-1 hover:shadow-2xl"
              >

                {isLoggedIn
                  ? "Explore Careers"
                  : "Get Started"}

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5 transition group-hover:translate-x-1"
                >

                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                </svg>

              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}

      <footer className="relative z-10 border-t border-slate-200 bg-white py-8">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-center sm:flex-row sm:text-left">

          <div>

            <p className="font-black tracking-tight">

              <span className="text-orange-500">
                CAREER
              </span>

              <span className="ml-1 text-blue-600">
                NAVIGATOR
              </span>

            </p>

            <p className="mt-1 text-xs text-slate-400">
              Navigate your career. Build your future.
            </p>

          </div>


          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Career Navigator. All rights reserved.
          </p>

        </div>

      </footer>

    </main>
  );
}