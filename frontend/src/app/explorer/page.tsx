"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Explorer() {
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadRecommendation();
  }, []);

  async function loadRecommendation() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/careers/latest",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (response.ok) {
        setRecommendation(data);
      }
    } catch (error) {
      console.error("Failed to load recommendation:", error);
    } finally {
      setLoading(false);
    }
  }

  async function generateRecommendations() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch(
        "http://localhost:5000/careers/recommend",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        alert(data?.message || "Failed to generate recommendations.");
        return;
      }

      setRecommendation(data);
    } catch (error) {
      console.error("Recommendation error:", error);
      alert("Unable to generate recommendations.");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading Career Explorer...</p>
      </main>
    );
  }

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
              href="/explorer"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Career Explorer
            </Link>

            <Link
              href="/profile"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Profile
            </Link>

            <Link
              href="/"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Page header */}
      <section className="relative overflow-hidden bg-slate-50">

        {/* Background shapes */}
        <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-orange-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />
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

        <div className="relative mx-auto max-w-6xl px-6 py-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-orange-600">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            Career Navigator
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Career Explorer
          </h1>

          <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-500">
            Discover career paths based on your profile, skills, interests,
            and experience.
          </p>
        </div>
      </section>

      {/* Recommendations card */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Your Career Recommendations
          </h2>

          {recommendation ? (
            <pre className="mt-6 overflow-auto rounded-xl bg-slate-50 p-5 text-sm text-slate-700">
              {JSON.stringify(recommendation, null, 2)}
            </pre>
          ) : (
            <div className="mt-6 flex flex-col items-start">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="m21 21-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              <p className="text-slate-500">
                You don't have any career recommendations yet.
              </p>

              <button
                onClick={generateRecommendations}
                disabled={generating}
                className="group mt-5 flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white shadow-md shadow-orange-500/25 transition hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-60"
              >
                {generating ? "Generating..." : "Generate Career Recommendations"}
                {!generating && (
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 transition group-hover:translate-x-0.5">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}