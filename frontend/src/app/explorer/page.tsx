"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MarketCareerDetailsModal from "../components/MarketCareerDetailsModal";
import LogoutButton from "../components/LogoutButton";


type CareerRoadmapModalProps = {
  recommendation: any;
  isOpen: boolean;
  onClose: () => void;
  onSelected?: () => void | Promise<void>;
};

function CareerRoadmapModal({
  recommendation,
  isOpen,
  onClose,
  onSelected,
}: CareerRoadmapModalProps) {
  const [selecting, setSelecting] = useState(false);
  const [selectMessage, setSelectMessage] = useState("");

  if (!isOpen || !recommendation) {
    return null;
  }

  const roadmap = Array.isArray(recommendation.roadmap)
    ? recommendation.roadmap
    : [];

  const missingSkills = Array.isArray(recommendation.missingSkills)
    ? recommendation.missingSkills
    : [];

  const selectRoadmap = async () => {
    if (!roadmap.length || selecting) {
      return;
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setSelecting(true);
    setSelectMessage("");

    try {
      /*
       * The backend SelectRoadmapDto expects:
       *
       * {
       *   recommendation: { ... }
       * }
       *
       * Do NOT send the recommendation object directly.
       */
      const payload = {
        recommendation: {
          career: recommendation.career || "",
          matchScore: Number(recommendation.matchScore || 0),
          description: recommendation.description || "",
          whyRecommended: Array.isArray(recommendation.whyRecommended)
            ? recommendation.whyRecommended
            : [],
          strengthsUsed: Array.isArray(recommendation.strengthsUsed)
            ? recommendation.strengthsUsed
            : [],
          missingSkills: missingSkills.map((item: any) => ({
            skill:
              typeof item === "string"
                ? item
                : item?.skill || "",
            priority:
              typeof item === "object"
                ? item?.priority || "MEDIUM"
                : "MEDIUM",
            priorityScore:
              typeof item === "object"
                ? Number(item?.priorityScore || 0)
                : 0,
            reason:
              typeof item === "object"
                ? item?.reason || ""
                : "",
          })),
          roadmap: roadmap.map((phase: any) => ({
            phase: phase?.phase || "",
            skills: Array.isArray(phase?.skills)
              ? phase.skills
              : [],
            description: phase?.description || "",
            estimatedDuration:
              phase?.estimatedDuration || "",
            weeklyHours: Number(
              phase?.weeklyHours || 0
            ),
            tasks: Array.isArray(phase?.tasks)
              ? phase.tasks
              : [],
          })),
        },
      };

      console.log(
        "Selecting career roadmap:",
        payload
      );

      const response = await fetch(
        "/api/careers/select-roadmap",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();

      let data: any = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = {
          message: text || "Unexpected server response.",
        };
      }

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message ||
          "Failed to select this roadmap.";

        throw new Error(message);
      }

      console.log(
        "Roadmap selected successfully:",
        data
      );

      setSelectMessage(
        "Roadmap selected successfully!"
      );

      /*
       * Give the user a moment to see the success message,
       * then refresh the Explorer state and close the modal.
       */
      if (onSelected) {
        await onSelected();
      }

      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error: any) {
      console.error(
        "Career roadmap selection error:",
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
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
              Personalized Career Roadmap
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
              {recommendation.career}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              A learning path based on your current skills
              and the skills you need to develop.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl font-bold text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
            aria-label="Close roadmap"
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="min-h-0 overflow-y-auto px-6 py-6 sm:px-8">
          {/* MATCH */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Match Score
              </p>

              <p className="mt-2 text-3xl font-black text-orange-600">
                {recommendation.matchScore || 0}%
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Roadmap
              </p>

              <p className="mt-2 text-lg font-bold text-slate-900">
                {roadmap.length} learning phases
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Complete each phase to build the missing
                skills for this career.
              </p>
            </div>
          </div>

          {/* DESCRIPTION */}
          {recommendation.description && (
            <section className="mt-7">
              <h3 className="text-lg font-bold text-slate-900">
                Career Overview
              </h3>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                {recommendation.description}
              </p>
            </section>
          )}

          {/* STRENGTHS */}
          {recommendation.strengthsUsed?.length > 0 && (
            <section className="mt-7">
              <h3 className="text-lg font-bold text-slate-900">
                Your Existing Strengths
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {recommendation.strengthsUsed.map(
                  (skill: string, index: number) => (
                    <span
                      key={index}
                      className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700"
                    >
                      ✓ {skill}
                    </span>
                  )
                )}
              </div>
            </section>
          )}

          {/* MISSING SKILLS */}
          {missingSkills.length > 0 && (
            <section className="mt-7">
              <h3 className="text-lg font-bold text-slate-900">
                Skills You Need to Develop
              </h3>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {missingSkills.map(
                  (item: any, index: number) => {
                    const skill =
                      typeof item === "string"
                        ? item
                        : item?.skill || "";

                    const priority =
                      typeof item === "object"
                        ? item?.priority || "MEDIUM"
                        : "MEDIUM";

                    return (
                      <div
                        key={index}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-slate-800">
                            {skill}
                          </span>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${priority === "CRITICAL"
                              ? "bg-red-50 text-red-600"
                              : priority === "HIGH"
                                ? "bg-orange-50 text-orange-600"
                                : priority === "MEDIUM"
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                          >
                            {priority}
                          </span>
                        </div>

                        {typeof item === "object" &&
                          item?.reason && (
                            <p className="mt-2 text-xs leading-5 text-slate-500">
                              {item.reason}
                            </p>
                          )}
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          )}

          {/* ROADMAP */}
          <section className="mt-8 border-t border-slate-100 pt-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Learning Roadmap
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Focus on the skills you are currently missing.
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
                {roadmap.length} phases
              </span>
            </div>

            {roadmap.length > 0 ? (
              <div className="mt-6 space-y-5">
                {roadmap.map(
                  (phase: any, index: number) => (
                    <div
                      key={index}
                      className="relative rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white shadow-sm">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <h4 className="text-lg font-bold text-slate-900">
                              {phase?.phase ||
                                `Phase ${index + 1}`}
                            </h4>

                            <div className="flex flex-wrap gap-2">
                              {phase?.estimatedDuration && (
                                <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                                  ⏱ {phase.estimatedDuration}
                                </span>
                              )}

                              {phase?.weeklyHours && (
                                <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                                  📚 {phase.weeklyHours} hrs/week
                                </span>
                              )}
                            </div>
                          </div>

                          {phase?.description && (
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {phase.description}
                            </p>
                          )}

                          {phase?.skills?.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Skills
                              </p>

                              <div className="mt-2 flex flex-wrap gap-2">
                                {phase.skills.map(
                                  (
                                    skill: string,
                                    skillIndex: number
                                  ) => (
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

                          {phase?.tasks?.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Tasks
                              </p>

                              <ul className="mt-2 space-y-2">
                                {phase.tasks.map(
                                  (
                                    task: any,
                                    taskIndex: number
                                  ) => (
                                    <li
                                      key={task?._id || taskIndex}
                                      className="flex items-start gap-2 text-sm text-slate-600"
                                    >
                                      <span className="mt-1 font-bold text-blue-600">
                                        •
                                      </span>

                                      <div>
                                        <p className="font-medium text-slate-700">
                                          {typeof task === "string"
                                            ? task
                                            : task?.title || "Untitled task"}
                                        </p>

                                        {typeof task === "object" && task?.type && (
                                          <span
                                            className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                              task.type === "certificate"
                                                ? "bg-purple-100 text-purple-700"
                                                : task.type === "project"
                                                  ? "bg-blue-100 text-blue-700"
                                                  : "bg-orange-100 text-orange-700"
                                            }`}
                                          >
                                            {task.type}
                                          </span>
                                        )}
                                      </div>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                No roadmap phases are available for this recommendation.
              </div>
            )}
          </section>
        </div>

        {/* FOOTER */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-5 sm:px-8">
          {selectMessage && (
            <p
              className={`mb-3 text-center text-sm font-bold ${selectMessage
                .toLowerCase()
                .includes("success")
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
            disabled={selecting || roadmap.length === 0}
            className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-orange-500 to-orange-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {selecting
              ? "Selecting Roadmap..."
              : "Select This Roadmap →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Explorer() {
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [jobAnalysis, setJobAnalysis] = useState<any>(null);
  const [analyzingJob, setAnalyzingJob] = useState(false);
  const [selectingJobRoadmap, setSelectingJobRoadmap] = useState(false);
  const [jobRoadmapMessage, setJobRoadmapMessage] = useState('');
  const [jobRoadmapMessageSuccess, setJobRoadmapMessageSuccess] = useState(true);

  const [marketDemand, setMarketDemand] = useState<any>(null);
  const [generatingMarketDemand, setGeneratingMarketDemand] = useState(false);
  const [selectedMarketCareer, setSelectedMarketCareer] = useState<any>(null);

  const [selectedRecommendation, setSelectedRecommendation] =
    useState<any>(null);
  const [roadmapOpen, setRoadmapOpen] = useState(false);

  useEffect(() => {
    loadRecommendation();
    loadMarketDemand();
    loadSavedJobAnalysis();
  }, []);

  function getJobAnalysisStorageKey() {
    const storedUser = localStorage.getItem("user");

    try {
      const user = storedUser ? JSON.parse(storedUser) : null;
      const userId =
        user?.id ||
        user?._id ||
        user?.userId ||
        user?.email ||
        "current";

      return `careerNavigator_jobAnalysis_${userId}`;
    } catch {
      return "careerNavigator_jobAnalysis_current";
    }
  }

  function loadSavedJobAnalysis() {
    try {
      const saved = localStorage.getItem(
        getJobAnalysisStorageKey()
      );

      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved);

      if (parsed) {
        setJobAnalysis(parsed);
      }
    } catch (error) {
      console.error(
        "Failed to load saved job analysis:",
        error
      );
    }
  }

  async function loadRecommendation() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(
        "/api/careers/latest",
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
        "/api/careers/recommend",
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

  async function generateMarketDemand() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setGeneratingMarketDemand(true);

    try {
      const response = await fetch(
        "/api/market-demand/generate",
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
        alert(
          data?.message ||
          "Failed to generate market demand."
        );
        return;
      }

      setMarketDemand(data.marketDemand);
    } catch (error) {
      console.error(
        "Market demand error:",
        error
      );

      alert(
        "Unable to generate market demand."
      );
    } finally {
      setGeneratingMarketDemand(false);
    }
  }

  async function loadMarketDemand() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        "/api/market-demand/latest",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (response.ok) {
        setMarketDemand(
          data.marketDemand
        );
      }
    } catch (error) {
      console.error(
        "Failed to load market demand:",
        error
      );
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
        "/api/job-analysis/analyze",
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

      // Keep showing the latest analysis after refresh/navigation.
      // A new analysis replaces this saved result.
      try {
        localStorage.setItem(
          getJobAnalysisStorageKey(),
          JSON.stringify(data.analysis)
        );
      } catch (storageError) {
        console.error(
          "Failed to save job analysis locally:",
          storageError
        );
      }
    } catch (error) {
      console.error("Job analysis error:", error);
      alert("Unable to analyze the job description.");
    } finally {
      setAnalyzingJob(false);
    }
  }

  async function selectJobAnalysisRoadmap() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const roadmap = Array.isArray(jobAnalysis?.generalRoadmap)
      ? jobAnalysis.generalRoadmap
      : [];

    if (!jobAnalysis || roadmap.length === 0) {
      setJobRoadmapMessageSuccess(false);
      setJobRoadmapMessage(
        "No job-analysis roadmap is available to select."
      );
      return;
    }

    setSelectingJobRoadmap(true);
    setJobRoadmapMessage('');

    try {
      /*
       * The careers/select-roadmap endpoint expects the same
       * recommendation structure used by CareerRoadmapModal.
       * Here we convert the Job Description Analysis result
       * into that structure before sending it to the backend.
       */
      const payload = {
        recommendation: {
          career:
            jobAnalysis.jobTitle ||
            jobAnalysis.career ||
            "Job Description Career",

          matchScore: Number(jobAnalysis.matchScore || 0),

          description:
            jobAnalysis.description ||
            `Personalized roadmap for ${jobAnalysis.jobTitle || "this job"
            } based on your Job Description Analysis.`,

          whyRecommended: Array.isArray(jobAnalysis.explanations)
            ? jobAnalysis.explanations
            : [],

          strengthsUsed: Array.isArray(jobAnalysis.strengths)
            ? jobAnalysis.strengths
            : [],

          missingSkills: Array.isArray(jobAnalysis.missingSkills)
            ? jobAnalysis.missingSkills.map((item: any) => ({
              skill:
                typeof item === "string"
                  ? item
                  : item?.skill || "",
              priority:
                typeof item === "object"
                  ? item?.priority || "MEDIUM"
                  : "MEDIUM",
              priorityScore:
                typeof item === "object"
                  ? Number(item?.priorityScore || 0)
                  : 0,
              reason:
                typeof item === "object"
                  ? item?.reason || ""
                  : "",
            }))
            : [],

          roadmap: roadmap.map((phase: any) => ({
            phase: phase?.phase || "",
            skills: Array.isArray(phase?.skills)
              ? phase.skills
              : [],
            description: phase?.description || "",
            estimatedDuration:
              phase?.estimatedDuration || "",
            weeklyHours: Number(phase?.weeklyHours || 0),
            tasks: Array.isArray(phase?.tasks)
              ? phase.tasks
              : [],
          })),
        },
      };

      console.log(
        "Selecting Job Analysis roadmap:",
        payload
      );

      const response = await fetch(
        "/api/careers/select-roadmap",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();
      let data: any = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = {
          message: text || "Unexpected server response.",
        };
      }

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message ||
          "Failed to select the Job Analysis roadmap.";

        throw new Error(message);
      }

      setJobRoadmapMessageSuccess(true);
      setJobRoadmapMessage(
        "Roadmap selected successfully! You can now track it from My Roadmap."
      );

      // Refresh recommendation data so the selected roadmap is reflected
      // wherever the Explorer uses career roadmap information.
      await loadRecommendation();
    } catch (error: any) {
      console.error(
        "Job Analysis roadmap selection error:",
        error
      );

      setJobRoadmapMessageSuccess(false);
      setJobRoadmapMessage(
        error?.message ||
        "Unable to select the Job Analysis roadmap."
      );
    } finally {
      setSelectingJobRoadmap(false);
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

      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-xl">
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



          {/* NAVIGATION LINKS */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* HOME */}
            <Link
              href="/"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 md:block"
            >
              Home
            </Link>

            <Link
              href="/dashboard"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 lg:block"
            >
              Dashboard
            </Link>


            {/* CAREER EXPLORER - ACTIVE */}
            <Link
              href="/explorer"
              className="hidden rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-600 transition-all duration-200 hover:bg-blue-100 lg:block"
            >
              Career Explorer
            </Link>


            {/* MY ROADMAP */}
            <Link
              href="/my-roadmap"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 lg:block"
            >
              My Roadmap
            </Link>


            {/* PROFILE */}
            <Link
              href="/profile"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 md:block"
            >
              Profile
            </Link>

            <div className="mx-1 hidden h-7 w-px bg-slate-200 lg:block" />

            <LogoutButton />

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

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          {/* HEADER */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Market Demand
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Explore careers that are currently in demand
                and see how your skills compare.
              </p>
            </div>

            <button
              onClick={generateMarketDemand}
              disabled={generatingMarketDemand}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generatingMarketDemand
                ? "Analyzing..."
                : marketDemand
                  ? "Refresh Market Demand"
                  : "Explore Market Demand"}
            </button>

          </div>

          {/* CAREERS */}

          {marketDemand?.careers?.length > 0 ? (

            <div className="mt-6 space-y-4">

              {marketDemand.careers.map(
                (career: any, index: number) => (

                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-md"
                  >

                    {/* CAREER HEADER */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div>

                        <div className="flex items-center gap-3">

                          <span className="text-lg">
                            {index === 0
                              ? "🏆"
                              : "💼"}
                          </span>

                          <h3 className="text-lg font-bold text-slate-900">
                            {career.career}
                          </h3>

                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          {career.description}
                        </p>

                      </div>


                      {/* DEMAND SCORE */}

                      <div className="shrink-0">

                        <div className="flex items-center gap-3">

                          <div className="h-3 w-32 overflow-hidden rounded-full bg-slate-100">

                            <div
                              className="h-full rounded-full bg-blue-600"
                              style={{
                                width: `${career.demandScore}%`,
                              }}
                            />

                          </div>

                          <span className="text-sm font-bold text-slate-900">
                            {career.demandScore}%
                          </span>

                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          Demand
                        </p>

                      </div>

                    </div>


                    {/* GROWTH */}

                    <div className="mt-4 flex items-center justify-between">

                      <div className="text-sm">

                        <span className="font-semibold text-green-600">
                          ↑ {career.growthPercentage}%
                        </span>

                        <span className="ml-2 text-slate-500">
                          • {career.trend}
                        </span>

                      </div>


                      <button
                        onClick={() =>
                          setSelectedMarketCareer(
                            career
                          )
                        }
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View Details →
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            <div className="mt-6 rounded-xl bg-slate-50 p-8 text-center">

              <p className="text-sm text-slate-500">
                Generate a market demand analysis
                to see current career trends.
              </p>

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
                                    (
                                      task: any,
                                      taskIndex: number
                                    ) => (
                                      <li
                                        key={task?._id || taskIndex}
                                        className="flex items-start gap-2 text-sm text-slate-600"
                                      >
                                        <span className="mt-0.5 font-bold text-blue-600">
                                          ✓
                                        </span>

                                        <div>
                                          <p className="font-medium text-slate-700">
                                            {typeof task === "string"
                                              ? task
                                              : task?.title || "Untitled task"}
                                          </p>

                                          {typeof task === "object" && task?.type && (
                                            <span
                                              className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                                task.type === "certificate"
                                                  ? "bg-purple-100 text-purple-700"
                                                  : task.type === "project"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-orange-100 text-orange-700"
                                              }`}
                                            >
                                              {task.type}
                                            </span>
                                          )}
                                        </div>
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

              {/* SELECT JOB ANALYSIS ROADMAP */}
              {jobAnalysis.generalRoadmap?.length > 0 && (
                <div className="border-t border-slate-100 pt-8">
                  {/* Selection message - shown directly above the button */}
                  {jobRoadmapMessage && (
                    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-5 w-5"
                        >
                          <path
                            d="m5 12 4 4L19 6"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>

                      <p className="flex-1 text-sm font-bold text-green-800">
                        {jobRoadmapMessage}
                      </p>

                      <button
                        type="button"
                        onClick={() => setJobRoadmapMessage("")}
                        className="shrink-0 text-xl leading-none text-slate-400 transition hover:text-slate-600"
                        aria-label="Close message"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={selectJobAnalysisRoadmap}
                    disabled={selectingJobRoadmap}
                    className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-orange-500 to-orange-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {selectingJobRoadmap
                      ? "Selecting Roadmap..."
                      : "Select This Roadmap →"}
                  </button>

                  <p className="mt-3 text-center text-xs text-slate-400">
                    This will save the Job Description Analysis roadmap to your
                    selected roadmap.
                  </p>
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

      <CareerRoadmapModal
        recommendation={selectedRecommendation}
        isOpen={roadmapOpen}
        onClose={() => {
          setRoadmapOpen(false);
          setSelectedRecommendation(null);
        }}
        onSelected={async () => {
          await loadRecommendation();
        }}
      />
      <MarketCareerDetailsModal
        career={selectedMarketCareer}
        isOpen={!!selectedMarketCareer}
        onClose={() => {
          setSelectedMarketCareer(null);
        }}
      />
    </main>
  );
}