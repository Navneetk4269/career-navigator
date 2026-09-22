"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SkillGap = {
  skill: string;
  priority: string;
  priorityScore: number;
  reason: string;
};

type RoadmapTask = {
  title: string;
  type: "certificate" | "project" | "practice";
  resourceUrl?: string | null;
};

type RoadmapPhase = {
  phase: string;
  skills: string[];
  description: string;
  estimatedDuration: string;
  weeklyHours: number;
  tasks: RoadmapTask[];
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

type MarketCareer = {
  rank?: number;
  career: string;
  demandScore: number;
  growthPercentage: number;
  trend: string;
  description?: string;
  averageSalary?: string;
  salaryRange?: string;
  whyInDemand?: string[];
  requiredSkills?: string[];
  changingMarket?: {
    technology: string;
    trend: string;
    reason: string;
  }[];
  commonJobTitles?: string[];
  userSkillMatch?: {
    matchedSkills: string[];
    missingSkills: any[];
    matchPercentage: number;
  };
  roadmap?: {
    phase: string;
    skills: string[];
    description: string;
    estimatedDuration: string;
    weeklyHours: number;
    tasks: string[];
  }[];
  aiInsight?: string;
};

type MarketDemandData = {
  careers: MarketCareer[];
  generatedAt?: string;
};

type MarketCareerDetailsModalProps = {
  career: MarketCareer | null;
  isOpen: boolean;
  onClose: () => void;
  onSelected?: () => void | Promise<void>;
};

function MarketCareerDetailsModal({
  career,
  isOpen,
  onClose,
  onSelected,
}: MarketCareerDetailsModalProps) {
  const [selecting, setSelecting] = useState(false);
  const [selectMessage, setSelectMessage] = useState("");

  if (!isOpen || !career) return null;

  const missingSkills =
    career.userSkillMatch?.missingSkills || [];

  const selectRoadmap = async () => {
    if (!career.roadmap?.length || selecting) return;

    try {
      setSelecting(true);
      setSelectMessage("");

      const token =
        localStorage.getItem("accessToken");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const recommendation = {
        career: career.career,
        matchScore:
          career.userSkillMatch?.matchPercentage || 0,
        description: career.description || "",
        whyRecommended:
          career.whyInDemand || [],
        strengthsUsed:
          career.userSkillMatch?.matchedSkills || [],
        missingSkills: missingSkills.map(
          (skill: any) => ({
            skill:
              typeof skill === "string"
                ? skill
                : skill?.skill || "",
            priority:
              typeof skill === "object"
                ? skill?.priority || "MEDIUM"
                : "MEDIUM",
            priorityScore:
              typeof skill === "object"
                ? skill?.priorityScore || 0
                : 0,
            reason:
              typeof skill === "object"
                ? skill?.reason || ""
                : "",
          })
        ),
        roadmap: career.roadmap || [],
      };

      const response = await fetch(
        "http://localhost:5000/careers/select-roadmap",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            recommendation,
          }),
        }
      );

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(
          data?.message ||
          "Failed to select this roadmap."
        );
      }

      setSelectMessage(
        "Roadmap selected successfully."
      );

      if (onSelected) {
        await onSelected();
      }
    } catch (error: any) {
      console.error(
        "Market roadmap selection error:",
        error
      );

      setSelectMessage(
        error?.message ||
        "Unable to select this roadmap."
      );
    } finally {
      setSelecting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

        {/* MODAL HEADER */}

        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur sm:px-8">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
              Market Demand Details
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
              {career.career}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl font-bold text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* MODAL BODY */}

        <div className="max-h-[calc(92vh-86px)] overflow-y-auto px-6 py-6 sm:px-8">

          {/* SCORE CARDS */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Demand Score
              </p>
              <p className="mt-2 text-3xl font-black text-blue-600">
                {career.demandScore}%
              </p>
            </div>

            <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Growth
              </p>
              <p className="mt-2 text-3xl font-black text-green-600">
                ↑ {career.growthPercentage}%
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {career.trend}
              </p>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Your Match
              </p>
              <p className="mt-2 text-3xl font-black text-orange-500">
                {career.userSkillMatch?.matchPercentage ?? 0}%
              </p>
            </div>
          </div>

          {/* SALARY */}

          {(career.averageSalary ||
            career.salaryRange) && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-black text-slate-900">
                  Salary Overview
                </h3>

                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {career.averageSalary && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400">
                        Average Salary
                      </p>
                      <p className="mt-1 font-bold text-slate-900">
                        {career.averageSalary}
                      </p>
                    </div>
                  )}

                  {career.salaryRange && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400">
                        Salary Range
                      </p>
                      <p className="mt-1 font-bold text-slate-900">
                        {career.salaryRange}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* DESCRIPTION */}

          {career.description && (
            <section className="mt-6">
              <h3 className="text-lg font-black text-slate-950">
                Career Overview
              </h3>
              <p className="mt-2 leading-7 text-slate-600">
                {career.description}
              </p>
            </section>
          )}

          {/* WHY IN DEMAND */}

          {career.whyInDemand?.length ? (
            <section className="mt-7">
              <h3 className="text-lg font-black text-slate-950">
                Why This Career Is In Demand
              </h3>

              <ul className="mt-3 space-y-2">
                {career.whyInDemand.map(
                  (item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                    >
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </section>
          ) : null}

          {/* REQUIRED SKILLS */}

          {career.requiredSkills?.length ? (
            <section className="mt-7">
              <h3 className="text-lg font-black text-slate-950">
                Top Required Skills
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {career.requiredSkills.map(
                  (skill, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </section>
          ) : null}

          {/* CHANGING MARKET */}

          {career.changingMarket?.length ? (
            <section className="mt-7">
              <h3 className="text-lg font-black text-slate-950">
                Changing Market
              </h3>

              <div className="mt-3 space-y-3">
                {career.changingMarket.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-bold text-slate-900">
                          {item.technology}
                        </p>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-blue-600 shadow-sm">
                          {item.trend}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {item.reason}
                      </p>
                    </div>
                  )
                )}
              </div>
            </section>
          ) : null}

          {/* JOB TITLES */}

          {career.commonJobTitles?.length ? (
            <section className="mt-7">
              <h3 className="text-lg font-black text-slate-950">
                Common Job Titles
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {career.commonJobTitles.map(
                  (title, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"
                    >
                      {title}
                    </span>
                  )
                )}
              </div>
            </section>
          ) : null}

          {/* USER MATCH */}

          <section className="mt-7 rounded-2xl border border-orange-100 bg-orange-50/60 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  Personalized Analysis
                </p>
                <h3 className="mt-1 text-lg font-black text-slate-950">
                  How your skills compare
                </h3>
              </div>

              <p className="text-2xl font-black text-orange-500">
                {career.userSkillMatch?.matchPercentage ?? 0}%
              </p>
            </div>

            {career.userSkillMatch?.matchedSkills?.length ? (
              <div className="mt-4">
                <p className="text-sm font-bold text-slate-900">
                  Matched Skills
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {career.userSkillMatch.matchedSkills.map(
                    (skill, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700"
                      >
                        ✓ {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            ) : null}

            {missingSkills.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-bold text-slate-900">
                  Missing Skills
                </p>

                <div className="mt-2 space-y-2">
                  {missingSkills.map(
                    (skill: any, index) => {
                      const skillName =
                        typeof skill === "string"
                          ? skill
                          : skill?.skill;

                      const priority =
                        typeof skill === "object"
                          ? skill?.priority
                          : "MEDIUM";

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-3 rounded-xl border border-orange-100 bg-white p-3"
                        >
                          <span className="text-sm font-semibold text-slate-800">
                            {skillName}
                          </span>

                          <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-black uppercase text-orange-600">
                            {priority}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </section>

          {/* PERSONALIZED ROADMAP */}

          {career.roadmap?.length ? (
            <section className="mt-7">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Personalized Roadmap
                  </p>
                  <h3 className="mt-1 text-xl font-black text-slate-950">
                    Learn the skills you are missing
                  </h3>
                </div>

                <p className="text-xs text-slate-500">
                  {career.roadmap.length} phases
                </p>
              </div>

              <div className="mt-4 space-y-4">
                {career.roadmap.map(
                  (phase, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-xs font-black text-blue-600">
                              {index + 1}
                            </span>

                            <h4 className="font-black text-slate-900">
                              {phase.phase}
                            </h4>
                          </div>

                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {phase.description}
                          </p>
                        </div>

                        <div className="shrink-0 rounded-xl bg-slate-50 px-3 py-2 text-center">
                          <p className="text-xs font-bold text-slate-900">
                            {phase.weeklyHours} hrs/week
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {phase.estimatedDuration}
                          </p>
                        </div>
                      </div>

                      {phase.skills?.length ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {phase.skills.map(
                            (skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600"
                              >
                                {skill}
                              </span>
                            )
                          )}
                        </div>
                      ) : null}

                      {phase.tasks?.length ? (
                        <div className="mt-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Tasks
                          </p>

                          <ul className="mt-2 space-y-2">
                            {phase.tasks.map(
                              (task, taskIndex) => (
                                <li
                                  key={taskIndex}
                                  className="flex items-start gap-2 text-sm text-slate-600"
                                >
                                  <span className="mt-1 text-orange-500">
                                    •
                                  </span>
                                  {task}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  )
                )}
              </div>
            </section>
          ) : null}

          {/* AI INSIGHT */}

          {career.aiInsight && (
            <section className="mt-7 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                AI Career Insight
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {career.aiInsight}
              </p>
            </section>
          )}

          {/* SELECT ROADMAP */}

          <div className="sticky bottom-0 mt-8 border-t border-slate-200 bg-white/95 pt-5 backdrop-blur">
            {selectMessage && (
              <p
                className={`mb-3 text-center text-sm font-semibold ${selectMessage.toLowerCase().includes("success")
                    ? "text-green-600"
                    : "text-red-600"
                  }`}
              >
                {selectMessage}
              </p>
            )}

            <button
              type="button"
              onClick={selectRoadmap}
              disabled={selecting || !career.roadmap?.length}
              className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-orange-500 to-orange-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {selecting
                ? "Selecting Roadmap..."
                : "Select This Roadmap →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  const [roadmap, setRoadmap] =
    useState<RoadmapData | null>(null);

  const [recommendations, setRecommendations] =
    useState<Recommendation[]>([]);

  const [marketDemand, setMarketDemand] =
    useState<MarketDemandData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [selectedMarketCareer, setSelectedMarketCareer] =
    useState<MarketCareer | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const token =
      localStorage.getItem("accessToken");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      /*
       * ================================
       * GET USER
       * ================================
       */

      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }


      /*
       * ================================
       * GET SELECTED ROADMAP + PROGRESS
       * ================================
       */

      const roadmapResponse =
        await fetch(
          "http://localhost:5000/careers/my-roadmap",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const roadmapText =
        await roadmapResponse.text();

      const roadmapData =
        roadmapText
          ? JSON.parse(roadmapText)
          : null;

      if (roadmapResponse.ok) {
        setRoadmap(roadmapData);
      }


      /*
       * ================================
       * GET CAREER RECOMMENDATIONS
       * ================================
       */

      const recommendationResponse =
        await fetch(
          "http://localhost:5000/careers/latest",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const recommendationText =
        await recommendationResponse.text();

      const recommendationData =
        recommendationText
          ? JSON.parse(
            recommendationText
          )
          : null;

      if (recommendationResponse.ok) {
        setRecommendations(
          recommendationData?.recommendations ||
          []
        );
      }


      /*
       * ================================
       * GET MARKET DEMAND
       * ================================
       */

      const marketDemandResponse =
        await fetch(
          "http://localhost:5000/market-demand/latest",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const marketDemandText =
        await marketDemandResponse.text();

      const marketDemandData =
        marketDemandText
          ? JSON.parse(marketDemandText)
          : null;

      if (marketDemandResponse.ok) {
        const normalizedMarketDemand =
          marketDemandData?.marketDemand ??
          marketDemandData?.data ??
          marketDemandData;

        setMarketDemand(
          normalizedMarketDemand
        );
      }

    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }


  /*
   * ================================
   * LOADING SCREEN
   * ================================
   */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <p className="text-slate-500">
          Loading your dashboard...
        </p>
      </main>
    );
  }


  /*
   * ================================
   * SELECTED CAREER
   * ================================
   */

  const selectedCareer =
    roadmap?.selectedRoadmap;


  /*
   * ================================
   * FIND CURRENT ROADMAP PHASE
   * ================================
   */

  const currentPhaseIndex =
    roadmap?.roadmapProgress?.find(
      (item) => !item.completed
    )?.phaseIndex ?? 0;

  const currentPhase =
    selectedCareer?.roadmap?.[
    currentPhaseIndex
    ];


  /*
   * ================================
   * SKILL GAPS
   * ================================
   */

  const skillGaps =
    selectedCareer?.missingSkills?.slice(
      0,
      5
    ) || [];


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

        {/* ================= HEADER ================= */}

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
            {user?.name
              ? `, ${user.name}`
              : ""}

          </h1>


          <p className="mt-3 text-base leading-7 text-slate-500">
            Here&apos;s an overview of your career journey.
          </p>

        </div>


        {/* ================= TOP CARDS ================= */}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">


          {/* ================= ROADMAP PROGRESS ================= */}

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
                  width: `${roadmap?.progressPercentage || 0
                    }%`,
                }}
              />

            </div>


            <p className="relative mt-3 text-sm text-slate-500">

              {roadmap?.completedPhases || 0} of{" "}

              {roadmap?.totalPhases || 0}

              {" "}phases completed

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


          {/* ================= SELECTED CAREER ================= */}

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


        {/* ================= CURRENT LEARNING ================= */}

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

                        {task.title}

                      </li>

                    ))}

                </ul>

              </div>

            )}

          </div>

        )}


        {/* ================= LOWER GRID ================= */}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">


          {/* ================= SKILL GAPS ================= */}

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

                {skillGaps.map(
                  (gap, index) => (

                    <div
                      key={index}
                      className="rounded-xl border border-slate-100 p-4"
                    >

                      <div className="flex items-center justify-between">

                        <p className="font-semibold text-slate-900">
                          {gap.skill}
                        </p>


                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${gap.priority ===
                            "CRITICAL"
                            ? "bg-red-50 text-red-600"
                            : gap.priority ===
                              "HIGH"
                              ? "bg-orange-50 text-orange-600"
                              : gap.priority ===
                                "MEDIUM"
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

                  )
                )}

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


          {/* ================= CAREER RECOMMENDATIONS ================= */}

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


        {/* ====================================================== */}
        {/* ================= MARKET DEMAND ====================== */}
        {/* ====================================================== */}

        <div className="group relative mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10">

          {/* Background glow */}

          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-blue-100/50 blur-3xl transition group-hover:bg-blue-200/60" />


          {/* Header */}

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

            <div>

              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">

                <span className="text-lg">
                  📈
                </span>

                Market Demand

              </p>


              <h2 className="mt-1 text-xl font-black text-slate-950">
                In-demand careers
              </h2>


              <p className="mt-1 text-sm text-slate-500">
                Explore careers based on current market demand and growth.
              </p>

            </div>


            <Link
              href="/explorer"
              className="shrink-0 text-sm font-bold text-blue-600 transition hover:text-blue-700"
            >
              Explore →
            </Link>

          </div>


          {/* ================= MARKET DEMAND DATA ================= */}

          {marketDemand?.careers?.length ? (

            /*
             * IMPORTANT:
             *
             * max-h-[350px]
             *      ↓
             * Keeps this section small.
             *
             * overflow-y-auto
             *      ↓
             * Gives internal scrollbar.
             *
             * The card can show approximately
             * 3 careers before scrolling.
             */

            <div
              className="
                relative
                mt-6
                max-h-[350px]
                space-y-3
                overflow-y-auto
                pr-3
                scrollbar-thin
                scrollbar-thumb-slate-300
                scrollbar-track-slate-100
              "
            >

              {marketDemand.careers.map(
                (career, index) => (

                  <div
                    key={`${career.career}-${index}`}
                    className="
                      rounded-2xl
                      border
                      border-slate-100
                      bg-slate-50/60
                      p-5
                      transition
                      duration-200
                      hover:border-blue-200
                      hover:bg-blue-50/30
                    "
                  >

                    {/* Career + Demand Score */}

                    <div className="flex items-center justify-between gap-5">

                      <div className="flex min-w-0 items-center gap-4">

                        {/* Rank */}

                        <div
                          className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-blue-50
                            text-sm
                            font-black
                            text-blue-600
                          "
                        >
                          {index + 1}
                        </div>


                        {/* Career Name */}

                        <div className="min-w-0">

                          <h3 className="truncate text-sm font-bold text-slate-900 sm:text-base">
                            {career.career}
                          </h3>

                          <p className="mt-1 text-xs text-slate-400">
                            Market demand
                          </p>

                        </div>

                      </div>


                      {/* Demand */}

                      <div className="shrink-0 text-right">

                        <p className="text-xl font-black text-blue-600">
                          {career.demandScore}%
                        </p>

                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          demand
                        </p>

                      </div>

                    </div>


                    {/* Demand Progress Bar */}

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">

                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            Math.max(
                              career.demandScore || 0,
                              0
                            ),
                            100
                          )}%`,
                        }}
                      />

                    </div>


                    {/* Growth + Trend + Details */}

                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <p className="text-xs font-semibold text-slate-500">

                        <span className="font-bold text-green-600">
                          ↑ {career.growthPercentage}%
                        </span>

                        <span className="mx-2 text-slate-300">
                          •
                        </span>

                        {career.trend}

                      </p>


                      <button
                        type="button"
                        onClick={() =>
                          setSelectedMarketCareer(career)
                        }
                        className="
                          inline-flex
                          w-fit
                          items-center
                          rounded-lg
                          px-3
                          py-1.5
                          text-xs
                          font-bold
                          text-blue-600
                          transition
                          hover:bg-blue-50
                          hover:text-blue-700
                        "
                      >
                        View Details →
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            /* ================= EMPTY STATE ================= */

            <div className="relative mt-6 rounded-2xl bg-slate-50 p-6 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                📈
              </div>


              <p className="mt-3 text-sm font-semibold text-slate-700">
                No market demand data available yet.
              </p>


              <p className="mt-1 text-xs text-slate-500">
                Generate market demand analysis from Career Explorer.
              </p>


              <Link
                href="/explorer"
                className="mt-4 inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
              >
                Explore Market Demand →
              </Link>

            </div>

          )}

        </div>


        {/* ================= LEARNING HOURS ================= */}

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


        {/* ================= QUICK ACTIONS ================= */}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">


          {/* PROFILE */}

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


          {/* EXPLORE */}

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


          {/* ROADMAP */}

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

      {/* ================= MARKET CAREER DETAILS MODAL ================= */}

      <MarketCareerDetailsModal
        career={selectedMarketCareer}
        isOpen={!!selectedMarketCareer}
        onClose={() => setSelectedMarketCareer(null)}
        onSelected={async () => {
          setSelectedMarketCareer(null);
          await loadDashboard();
        }}
      />

    </main>
  );
}