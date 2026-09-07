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
    <main className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-black tracking-tight">
            <span className="text-orange-500">CAREER</span>
            <span className="text-blue-600">NAVIGATOR</span>
          </Link>

          <div className="flex gap-3">
            <Link
              href="/profile"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Profile
            </Link>

            <Link
              href="/"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Home
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
            Career Navigator
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            Career Explorer
          </h1>

          <p className="mt-3 max-w-2xl text-slate-500">
            Discover career paths based on your profile, skills, interests,
            and experience.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Your Career Recommendations
          </h2>

          {recommendation ? (
            <pre className="mt-6 overflow-auto rounded-xl bg-slate-50 p-5 text-sm text-slate-700">
              {JSON.stringify(recommendation, null, 2)}
            </pre>
          ) : (
            <div className="mt-6">
              <p className="text-slate-500">
                You don't have any career recommendations yet.
              </p>

              <button
                onClick={generateRecommendations}
                disabled={generating}
                className="mt-5 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {generating
                  ? "Generating..."
                  : "Generate Career Recommendations"}
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}