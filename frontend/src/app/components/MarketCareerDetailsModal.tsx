"use client";

import { useState } from "react";

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

type MarketCareerDetailsModalProps = {
    career: MarketCareer | null;
    isOpen: boolean;
    onClose: () => void;
    onSelected?: () => void | Promise<void>;
};

export default function MarketCareerDetailsModal({
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

