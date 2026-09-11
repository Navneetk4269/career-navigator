"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SkillGap = {
  skill: string;
  priority: string;
  priorityScore: number;
  reason: string;
};

type RoadmapPhase = {
  phase: string;
  skills: string[];
  description: string;
  estimatedDuration: string;
  weeklyHours: number;
  tasks: string[];
};

type Recommendation = {
  career: string;
  matchScore: number;
  description: string;
  whyRecommended: string[];
  strengthsUsed: string[];
  missingSkills: SkillGap[];
  roadmap: RoadmapPhase[];
};

type RoadmapData = {
  selectedRoadmap: Recommendation | null;
  selectedAt: string | null;
  roadmapProgress: {
    phaseIndex: number;
    completed: boolean;
    completedAt: string | null;
  }[];
  totalPhases: number;
  completedPhases: number;
  progressPercentage: number;
  roadmapCompleted: boolean;
};

type User = {
  name?: string;
  email?: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [recommendations, setRecommendations] = useState<
    Recommendation[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      /*
       * GET SELECTED ROADMAP + PROGRESS
       */
      const roadmapResponse = await fetch(
        "http://localhost:5000/careers/my-roadmap",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const roadmapText = await roadmapResponse.text();
      const roadmapData = roadmapText
        ? JSON.parse(roadmapText)
        : null;

      if (roadmapResponse.ok) {
        setRoadmap(roadmapData);
      }

      /*
       * GET CAREER RECOMMENDATIONS
       */
      const recommendationResponse = await fetch(
        "http://localhost:5000/careers/latest",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const recommendationText =
        await recommendationResponse.text();

      const recommendationData = recommendationText
        ? JSON.parse(recommendationText)
        : null;

      if (recommendationResponse.ok) {
        setRecommendations(
          recommendationData?.recommendations || []
        );
      }
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <p className="text-slate-500">
          Loading your dashboard...
        </p>
      </main>
    );
  }

  const selectedCareer = roadmap?.selectedRoadmap;

  /*
   * Find the first incomplete roadmap phase.
   */
  const currentPhaseIndex =
    roadmap?.roadmapProgress?.find(
      (item) => !item.completed
    )?.phaseIndex ?? 0;

  const currentPhase =
    selectedCareer?.roadmap?.[currentPhaseIndex];

  /*
   * Collect missing skills from the selected career.
   */
  const skillGaps =
    selectedCareer?.missingSkills?.slice(0, 5) || [];

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
                <span className="text-orange-500">CAREER</span>
                <span className="ml-1 text-blue-600">NAVIGATOR</span>
              </div>

              <p className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:block">
                Build your future
              </p>
            </div>

          </Link>


          {/* NAVIGATION */}
          <div className="flex items-center gap-1 sm:gap-2">

            <Link
              href="/"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:block"
            >
              Home
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-600 transition-all duration-200 hover:bg-blue-100"
            >
              Dashboard
            </Link>

            <Link
              href="/explorer"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 lg:block"
            >
              Career Explorer
            </Link>

            <Link
              href="/my-roadmap"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 lg:block"
            >
              My Roadmap
            </Link>

            <Link
              href="/profile"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 md:block"
            >
              Profile
            </Link>

          </div>

        </div>
      </nav>


      {/* ================= MAIN ================= */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 py-12 sm:px-6">

        {/* Header */}
        <div className="mb-10">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-600 shadow-sm backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
            </span>
            Career Navigator
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Welcome back
            {user?.name ? `, ${user.name}` : ""} 👋
          </h1>

          <p className="mt-3 text-base leading-7 text-slate-500">
            Here&apos;s an overview of your career journey.
          </p>

        </div>


        {/* TOP CARDS */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* Roadmap Progress */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10">

            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-100/50 blur-2xl transition group-hover:bg-blue-200/60" />

            <div className="relative flex items-start justify-between">

              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Roadmap Progress
                </p>

                <h2 className="mt-2 text-4xl font-black text-slate-950">
                  {roadmap?.progressPercentage || 0}%
                </h2>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm transition duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-6 w-6"
                >
                  <path
                    d="M4 19V5M4 19h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="m7 15 4-4 3 3 5-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

            </div>

            <div className="relative mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{
                  width: `${roadmap?.progressPercentage || 0}%`,
                }}
              />
            </div>

            <p className="relative mt-3 text-sm text-slate-500">
              {roadmap?.completedPhases || 0} of{" "}
              {roadmap?.totalPhases || 0} phases completed
            </p>

            {selectedCareer && (
              <Link
                href="/roadmap"
                className="relative mt-5 inline-block text-sm font-bold text-blue-600 transition hover:text-blue-700"
              >
                Continue your roadmap →
              </Link>
            )}

          </div>


          {/* Selected Career */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10">

            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-100/50 blur-2xl transition group-hover:bg-orange-200/60" />

            <p className="relative text-sm font-bold uppercase tracking-wider text-slate-500">
              Your Career Path
            </p>

            {selectedCareer ? (
              <>
                <h2 className="relative mt-3 text-2xl font-black text-slate-950">
                  {selectedCareer.career}
                </h2>

                <div className="relative mt-5 flex items-center gap-4">

                  <div className="text-3xl font-black text-orange-500">
                    {selectedCareer.matchScore}%
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Profile Match
                    </p>

                    <p className="text-xs text-slate-500">
                      Based on your skills and interests
                    </p>
                  </div>

                </div>

                <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{
                      width: `${selectedCareer.matchScore}%`,
                    }}
                  />
                </div>

              </>
            ) : (
              <div className="relative mt-5">

                <p className="text-slate-500">
                  You haven&apos;t selected a career roadmap yet.
                </p>

                <Link
                  href="/explorer"
                  className="group/btn mt-5 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-500 to-orange-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-orange-500/25 transition duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/30"
                >
                  Explore Careers

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4 transition group-hover/btn:translate-x-0.5"
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
            )}

          </div>

        </div>


        {/* CURRENT LEARNING */}
        {selectedCareer && currentPhase && (
          <div className="group relative mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10">

            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-100/50 blur-2xl transition group-hover:bg-orange-200/60" />

            <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">

              <div>

                <p className="text-sm font-bold uppercase tracking-[0.15em] text-orange-500">
                  Recommended Next Step
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  {currentPhase.phase}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  {currentPhase.description}
                </p>

              </div>

              <div className="shrink-0 rounded-2xl border border-white/80 bg-white/70 px-6 py-4 text-center shadow-sm backdrop-blur">

                <p className="text-2xl font-black text-slate-950">
                  {currentPhase.weeklyHours}
                </p>

                <p className="text-xs font-medium text-slate-500">
                  hours / week
                </p>

              </div>

            </div>

            <div className="relative mt-6 flex flex-wrap gap-2">

              {currentPhase.skills.map(
                (skill, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600"
                  >
                    {skill}
                  </span>
                )
              )}

            </div>

            {currentPhase.tasks?.length > 0 && (
              <div className="relative mt-6">

                <p className="text-sm font-bold text-slate-900">
                  Focus on
                </p>

                <ul className="mt-3 space-y-2">

                  {currentPhase.tasks
                    .slice(0, 3)
                    .map((task, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-slate-600"
                      >
                        <span className="mt-1 text-orange-500">
                          •
                        </span>

                        {task}
                      </li>
                    ))}

                </ul>

              </div>
            )}

          </div>
        )}


        {/* LOWER GRID */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">


          {/* Skill Gaps */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10">

            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-100/50 blur-2xl transition group-hover:bg-orange-200/60" />

            <div className="relative flex items-center justify-between">

              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Skill Gaps
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Skills to develop
                </h2>
              </div>

              <span className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600">
                {skillGaps.length} areas
              </span>

            </div>


            {skillGaps.length > 0 ? (

              <div className="relative mt-6 space-y-4">

                {skillGaps.map((gap, index) => (

                  <div
                    key={index}
                    className="rounded-xl border border-slate-100 p-4"
                  >

                    <div className="flex items-center justify-between">

                      <p className="font-semibold text-slate-900">
                        {gap.skill}
                      </p>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${gap.priority === "CRITICAL"
                          ? "bg-red-50 text-red-600"
                          : gap.priority === "HIGH"
                            ? "bg-orange-50 text-orange-600"
                            : gap.priority === "MEDIUM"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-blue-50 text-blue-600"
                          }`}
                      >
                        {gap.priority}
                      </span>

                    </div>

                    <p className="mt-2 text-sm leading-5 text-slate-500">
                      {gap.reason}
                    </p>

                  </div>

                ))}

              </div>

            ) : (

              <div className="relative mt-6 rounded-xl bg-slate-50 p-5">

                <p className="text-sm text-slate-500">
                  No skill gaps available yet.
                  Generate a career recommendation to
                  identify areas to improve.
                </p>

              </div>

            )}

          </div>


          {/* Career Recommendations */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10">

            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-100/50 blur-2xl transition group-hover:bg-blue-200/60" />

            <div className="relative flex items-center justify-between">

              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Career Options
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Recommended paths
                </h2>
              </div>

              <Link
                href="/explorer"
                className="text-sm font-bold text-blue-600 transition hover:text-blue-700"
              >
                Explore →
              </Link>

            </div>


            {recommendations.length > 0 ? (

              <div className="relative mt-6 space-y-4">

                {recommendations.map(
                  (recommendation, index) => {

                    const isSelected =
                      selectedCareer?.career ===
                      recommendation.career;

                    return (
                      <div
                        key={index}
                        className={`rounded-xl border p-5 ${isSelected
                          ? "border-orange-200 bg-orange-50/40"
                          : "border-slate-100"
                          }`}
                      >

                        <div className="flex items-center justify-between gap-4">

                          <div>

                            <div className="flex items-center gap-2">

                              <h3 className="font-semibold text-slate-900">
                                {recommendation.career}
                              </h3>

                              {isSelected && (
                                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-600">
                                  Selected
                                </span>
                              )}

                            </div>

                            <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                              {recommendation.description}
                            </p>

                          </div>

                          <div className="shrink-0 text-right">

                            <p className="text-xl font-bold text-blue-600">
                              {recommendation.matchScore}%
                            </p>

                            <p className="text-[10px] text-slate-400">
                              match
                            </p>

                          </div>

                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">

                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{
                              width: `${recommendation.matchScore}%`,
                            }}
                          />

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            ) : (

              <div className="relative mt-6 rounded-xl bg-slate-50 p-5">

                <p className="text-sm text-slate-500">
                  No career recommendations yet.
                </p>

                <Link
                  href="/explorer"
                  className="mt-4 inline-block text-sm font-bold text-orange-500"
                >
                  Generate recommendations →
                </Link>

              </div>

            )}

          </div>

        </div>


        {/* LEARNING HOURS */}
        <div className="group relative mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Your Learning Capacity
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                Make progress at your pace
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Your roadmap is personalized around the
                amount of time you can dedicate each week.
              </p>

            </div>

            <div className="flex items-center gap-8">

              <div className="text-center">

                <p className="text-3xl font-black text-orange-500">
                  {currentPhase?.weeklyHours || "—"}
                </p>

                <p className="text-xs text-slate-500">
                  hrs / week
                </p>

              </div>

              <div className="h-10 w-px bg-slate-200" />

              <div className="text-center">

                <p className="text-3xl font-black text-blue-600">
                  {currentPhase?.estimatedDuration || "—"}
                </p>

                <p className="text-xs text-slate-500">
                  current phase
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* QUICK ACTIONS */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <Link
            href="/profile"
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10"
          >

            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-orange-100/50 blur-2xl transition group-hover:bg-orange-200/60" />

            <p className="relative text-sm font-bold uppercase tracking-wider text-slate-500">
              Profile
            </p>

            <h3 className="relative mt-2 font-bold text-slate-900">
              Update your profile
            </h3>

            <p className="relative mt-1 text-sm text-slate-500">
              Keep your skills and interests up to date.
            </p>

            <p className="relative mt-4 inline-flex items-center gap-2 text-sm font-bold text-orange-500 transition group-hover:gap-3">
              Edit Profile <span>→</span>
            </p>

          </Link>


          <Link
            href="/explorer"
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10"
          >

            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-100/50 blur-2xl transition group-hover:bg-blue-200/60" />

            <p className="relative text-sm font-bold uppercase tracking-wider text-slate-500">
              Discover
            </p>

            <h3 className="relative mt-2 font-bold text-slate-900">
              Explore careers
            </h3>

            <p className="relative mt-1 text-sm text-slate-500">
              Compare career paths and discover new opportunities.
            </p>

            <p className="relative mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition group-hover:gap-3">
              Open Explorer <span>→</span>
            </p>

          </Link>


          <Link
            href="/roadmap"
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10"
          >

            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-orange-100/50 blur-2xl transition group-hover:bg-orange-200/60" />

            <p className="relative text-sm font-bold uppercase tracking-wider text-slate-500">
              Roadmap
            </p>

            <h3 className="relative mt-2 font-bold text-slate-900">
              Continue learning
            </h3>

            <p className="relative mt-1 text-sm text-slate-500">
              Continue working through your personalized roadmap.
            </p>

            <p className="relative mt-4 inline-flex items-center gap-2 text-sm font-bold text-orange-500 transition group-hover:gap-3">
              View Roadmap <span>→</span>
            </p>

          </Link>

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