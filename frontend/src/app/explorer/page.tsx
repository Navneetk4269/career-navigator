"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RoadmapModal from "../components/RoadmapModal";

export default function Explorer() {
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [jobAnalysis, setJobAnalysis] = useState<any>(null);
  const [analyzingJob, setAnalyzingJob] = useState(false);

  const [selectedRecommendation, setSelectedRecommendation] =
    useState<any>(null);
  const [roadmapOpen, setRoadmapOpen] = useState(false);

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

  async function analyzeJobDescription() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setAnalyzingJob(true);

    try {
      const response = await fetch(
        "http://localhost:5000/job-analysis/analyze",
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
        alert(data?.message || "Job analysis failed.");
        return;
      }

      setJobAnalysis(data.analysis);
    } catch (error) {
      console.error("Job analysis error:", error);
      alert("Unable to analyze the job description.");
    } finally {
      setAnalyzingJob(false);
    }
  }

  function priorityBadgeClasses(priority: string) {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-50 text-red-600";
      case "HIGH":
        return "bg-orange-50 text-orange-600";
      case "MEDIUM":
        return "bg-blue-50 text-blue-600";
      default:
        return "bg-slate-100 text-slate-600";
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

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Your Career Recommendations
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Based on your latest profile information.
              </p>
            </div>

            {recommendation && (
              <button
                onClick={generateRecommendations}
                disabled={generating}
                className="flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-600 transition hover:border-orange-300 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`h-4 w-4 ${generating ? "animate-spin" : ""}`}
                >
                  <path
                    d="M20 11a8 8 0 0 0-14.9-4M4 5v4h4M4 13a8 8 0 0 0 14.9 4M20 19v-4h-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {generating
                  ? "Generating..."
                  : "Regenerate Recommendations"}
              </button>
            )}

          </div>

          {recommendation ? (
              <div className="mt-6 space-y-6">

                {/* Summary */}
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-blue-600">
                        AI Career Analysis
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Based on your profile, skills, interests, and goals.
                      </p>
                    </div>

                    <div className="rounded-xl bg-white px-5 py-3 text-center shadow-sm">
                      <p className="text-2xl font-bold text-slate-900">
                        {recommendation.learningHoursPerWeek}
                      </p>

                      <p className="text-xs font-medium text-slate-500">
                        Hours / Week
                      </p>
                    </div>
                  </div>
                </div>

                {/* Career recommendations */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Recommended Career Paths
                  </h3>

                  <div className="mt-4 space-y-5">
                    {recommendation.recommendations?.map(
                      (career: any, index: number) => (
                        <div
                          key={index}
                          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >

                          {/* Career title + score */}
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                            <div className="flex items-start gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  className="h-6 w-6"
                                >
                                  <path
                                    d="M4 20V10M10 20V4M16 20v-7M22 20H2"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              </div>

                              <div>
                                <h4 className="text-xl font-bold text-slate-900">
                                  {career.career}
                                </h4>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                  {career.description}
                                </p>
                              </div>
                            </div>

                            {/* Match score */}
                            <div className="shrink-0 text-center">
                              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-orange-100 bg-orange-50">
                                <span className="text-lg font-bold text-orange-600">
                                  {career.matchScore}%
                                </span>
                              </div>

                              <p className="mt-1 text-xs font-medium text-slate-500">
                                Match
                              </p>
                            </div>
                          </div>

                          {/* Why recommended */}
                          {career.whyRecommended?.length > 0 && (
                            <div className="mt-6 border-t border-slate-100 pt-5">
                              <h5 className="text-sm font-bold text-slate-900">
                                Why this career?
                              </h5>

                              <div className="mt-3 space-y-2">
                                {career.whyRecommended.map(
                                  (reason: string, reasonIndex: number) => (
                                    <div
                                      key={reasonIndex}
                                      className="flex items-start gap-2 text-sm text-slate-600"
                                    >
                                      <span className="mt-1 text-orange-500">
                                        ✓
                                      </span>

                                      <span>{reason}</span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {/* Strengths */}
                          {career.strengthsUsed?.length > 0 && (
                            <div className="mt-6">
                              <h5 className="text-sm font-bold text-slate-900">
                                Your Strengths
                              </h5>

                              <div className="mt-3 flex flex-wrap gap-2">
                                {career.strengthsUsed.map(
                                  (strength: string, strengthIndex: number) => (
                                    <span
                                      key={strengthIndex}
                                      className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600"
                                    >
                                      {strength}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {/* Missing skills */}
                          {career.missingSkills?.length > 0 && (
                            <div className="mt-6">
                              <h5 className="text-sm font-bold text-slate-900">
                                Skills to Develop
                              </h5>

                              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                {career.missingSkills.map(
                                  (item: any, skillIndex: number) => (
                                    <div
                                      key={skillIndex}
                                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                                    >
                                      <span className="text-sm font-medium text-slate-700">
                                        {item.skill}
                                      </span>

                                      <span
                                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${priorityBadgeClasses(
                                          item.priority
                                        )}`}
                                      >
                                        {item.priority}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {/* View roadmap */}
                          <div className="mt-6 border-t border-slate-100 pt-5">
                            <button
                              onClick={() => {
                                setSelectedRecommendation(career);
                                setRoadmapOpen(true);
                              }}
                              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                              View Roadmap
                            </button>
                          </div>

                        </div>
                      )
                    )}
                  </div>
                </div>

              </div>
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

      {/* Job Description Analysis card */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Job Description Analysis
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                See how well your current profile matches this job and
                what to work on next.
              </p>
            </div>

            <button
              onClick={analyzeJobDescription}
              disabled={analyzingJob}
              className="group flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className={`h-4 w-4 ${analyzingJob ? "animate-spin" : ""}`}
              >
                <path
                  d="M20 11a8 8 0 0 0-14.9-4M4 5v4h4M4 13a8 8 0 0 0 14.9 4M20 19v-4h-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {analyzingJob
                ? "Analyzing..."
                : jobAnalysis
                ? "Re-analyze Job Description"
                : "Analyze Job Description"}
            </button>
          </div>

          {jobAnalysis ? (
            <div className="mt-6 space-y-8">

              {/* Match score */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-6">
                <p className="text-sm font-semibold text-blue-600">
                  Overall Match
                </p>

                <p className="mt-2 text-5xl font-bold text-blue-600">
                  {jobAnalysis.matchScore}%
                </p>
              </div>

              {/* Matched skills */}
              {jobAnalysis.matchedSkills?.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Matched Skills
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {jobAnalysis.matchedSkills.map(
                      (skill: string, index: number) => (
                        <span
                          key={index}
                          className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700"
                        >
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {jobAnalysis.strengths?.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Your Strengths
                  </h3>

                  <div className="mt-3 space-y-2">
                    {jobAnalysis.strengths.map(
                      (strength: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-600"
                        >
                          <span className="mt-0.5 text-orange-500">✓</span>
                          <span>{strength}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Missing skills */}
              {jobAnalysis.missingSkills?.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Skills You Need to Develop
                  </h3>

                  <div className="mt-4 space-y-4">
                    {jobAnalysis.missingSkills.map(
                      (item: any, index: number) => (
                        <div
                          key={index}
                          className="rounded-xl border border-slate-200 p-5"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-900">
                              {item.skill}
                            </h4>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${priorityBadgeClasses(
                                item.priority
                              )}`}
                            >
                              {item.priority}
                            </span>
                          </div>

                          <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            {item.reason}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* General roadmap */}
              {jobAnalysis.generalRoadmap?.length > 0 && (
                <div className="border-t border-slate-100 pt-8">
                  <h3 className="text-lg font-bold text-slate-900">
                    Your Job-Readiness Roadmap
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    A personalized path based on your current skills,
                    missing skills, and available learning time.
                  </p>

                  <div className="mt-6 space-y-5">
                    {jobAnalysis.generalRoadmap.map((phase: any, index: number) => (
                      <div
                        key={index}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-6"
                      >
                        <div className="flex items-start gap-4">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                            {index + 1}
                          </div>

                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-slate-900">
                              {phase.phase}
                            </h4>

                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {phase.description}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-3">
                              <span className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                                ⏱ {phase.estimatedDuration}
                              </span>

                              <span className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                                📚 {phase.weeklyHours} hrs/week
                              </span>
                            </div>

                            {phase.skills?.length > 0 && (
                              <div className="mt-5">
                                <h5 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                  Skills
                                </h5>

                                <div className="mt-2 flex flex-wrap gap-2">
                                  {phase.skills.map(
                                    (skill: string, skillIndex: number) => (
                                      <span
                                        key={skillIndex}
                                        className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600"
                                      >
                                        {skill}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                            {phase.tasks?.length > 0 && (
                              <div className="mt-5">
                                <h5 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                  Tasks
                                </h5>

                                <ul className="mt-2 space-y-1.5">
                                  {phase.tasks.map(
                                    (task: string, taskIndex: number) => (
                                      <li
                                        key={taskIndex}
                                        className="flex items-start gap-2 text-sm text-slate-600"
                                      >
                                        <span className="mt-0.5 font-bold text-blue-600">
                                          ✓
                                        </span>
                                        <span>{task}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-start">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path
                    d="M9 12h6M9 16h6M9 8h6M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <p className="text-slate-500">
                Add a job description to your profile, then analyze it to
                see your match score and a tailored readiness roadmap.
              </p>
            </div>
          )}
        </div>
      </section>

      <RoadmapModal
        recommendation={selectedRecommendation}
        isOpen={roadmapOpen}
        onClose={() => {
          setRoadmapOpen(false);
          setSelectedRecommendation(null);
        }}
      />
    </main>
  );
}