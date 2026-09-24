"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import RoadmapProgress from "../components/RoadmapProgress";
import LogoutButton from "../components/LogoutButton";
import MsgPopup from "../components/msgpopup";


interface RoadmapPhase {
    phase: string;
    skills: string[];
    description: string;
    estimatedDuration: string;
    weeklyHours: number;
    tasks: {
        title: string;
        type: "certificate" | "project" | "practice";
        resourceUrl?: string;
    }[];
}


interface SelectedRoadmap {
    career: string;
    matchScore: number;
    description: string;
    roadmap: RoadmapPhase[];
}


interface RoadmapProgressItem {
    phaseIndex: number;
    taskIndex: number | null;
    taskTitle: string | null;

    completed: boolean;
    completedAt: string | null;

    verificationStatus:
        | "not_submitted"
        | "pending"
        | "verified"
        | "rejected";

    evidenceType:
        | "certificate"
        | "screenshot"
        | "github"
        | null;

    evidenceFileName: string | null;
    evidenceFilePath?: string | null;

    verificationResult: {
        confidence?: number;
        learnerName?: string;
        courseName?: string;
        platform?: string;
        completionStatus?: string;
        relevantSkills?: string[];
        reason?: string;
    } | null;
}

interface MyRoadmapData {
    message: string;

    selectedRoadmap: SelectedRoadmap | null;

    selectedAt: string | null;

    roadmapProgress: RoadmapProgressItem[];

    totalPhases: number;

    completedPhases: number;

    progressPercentage: number;

    roadmapCompleted: boolean;

    achievements: Achievement[];
}

type Achievement = {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt: string | null;
};


export default function MyRoadmapPage() {

    const [roadmapData, setRoadmapData] =
        useState<MyRoadmapData | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [proofModalOpen, setProofModalOpen] = useState(false);
    const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number | null>(null);

    const [proofFile, setProofFile] = useState<File | null>(null);
    const [evidenceType, setEvidenceType] = useState<
        "certificate" | "screenshot" | "github"
    >("certificate");
    const [repositoryUrl, setRepositoryUrl] = useState("");
    const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null);

    const [uploadingProof, setUploadingProof] = useState(false);
    const [proofMessage, setProofMessage] = useState("");
    const [proofError, setProofError] = useState("");

    const [achievementPopup, setAchievementPopup] =
    useState<Achievement | null>(null);
    const knownAchievementIds = useRef<Set<string> | null>(null);

    const selectedPhase =
        selectedPhaseIndex === null
            ? null
            : roadmapData?.selectedRoadmap?.roadmap[
                selectedPhaseIndex
            ];


    // ==========================================
    // GET USER'S SELECTED ROADMAP
    // ==========================================

    const fetchRoadmap = async (showLoading = true) => {

        try {

            if (showLoading) {
                setLoading(true);
            }

            const token =
                localStorage.getItem("accessToken");


            const response = await fetch(
                "/api/careers/my-roadmap",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );


            if (!response.ok) {
                throw new Error(
                    "Failed to fetch roadmap"
                );
            }


            const data = await response.json();

            setRoadmapData(data);

            const currentAchievements: Achievement[] =
                data?.achievements || [];

            if (knownAchievementIds.current === null) {
                // First fetch: establish the baseline.
                // Don't show old achievements as new.
                knownAchievementIds.current = new Set(
                    currentAchievements.map(
                        (achievement) => achievement.id
                    )
                );
            } else {
                const newAchievement =
                    currentAchievements.find(
                        (achievement) =>
                            !knownAchievementIds.current!.has(
                                achievement.id
                            )
                    );

                if (newAchievement) {
                    setAchievementPopup(newAchievement);

                    knownAchievementIds.current.add(
                        newAchievement.id
                    );
                }
            }

        } catch (error) {

            console.error(
                "Roadmap fetch error:",
                error
            );

        } finally {

            if (showLoading) {
                setLoading(false);
            }

        }

    };


    useEffect(() => {

        fetchRoadmap();

    }, []);

    useEffect(() => {
        const hasPendingVerification =
            roadmapData?.roadmapProgress.some(
                (item) =>
                    item.verificationStatus === "pending",
            );

        if (!hasPendingVerification) {
            return;
        }

        const intervalId = window.setInterval(
            () => fetchRoadmap(false),
            5000,
        );

        return () => window.clearInterval(intervalId);
    }, [roadmapData]);

    
    // ==========================================
    // SUBMIT ROADMAP COMPLETION PROOF
    // ==========================================

    const submitProof = async () => {
        if (selectedPhaseIndex === null ||
            selectedTaskIndex === null
        ) {
            return;
        }

        if (evidenceType !== "github" && !proofFile) {
            setProofError("Please select a certificate or screenshot.");
            return;
        }

        if (evidenceType === "github" && !repositoryUrl.trim()) {
            setProofError("Please enter your public GitHub repository URL.");
            return;
        }

        const token = localStorage.getItem("accessToken");

        if (!token) {
            setProofError("You are not logged in.");
            return;
        }

        try {
            setUploadingProof(true);
            setProofError("");
            setProofMessage("");

            if (evidenceType === "github") {
                const response = await fetch(
                    "/api/careers/roadmap-github-repo",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            phaseIndex: selectedPhaseIndex,
                            taskIndex: selectedTaskIndex,
                            repositoryUrl: repositoryUrl.trim(),
                        }),
                    },
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to submit GitHub repository.",
                    );
                }

                setProofMessage(
                    "Repository submitted. Gemini is evaluating it now.",
                );
                setRepositoryUrl("");
                await fetchRoadmap();
                return;
            }

            if (!proofFile) {
                return;
            }

            const formData = new FormData();

            formData.append(
                "file",
                proofFile,
            );

            formData.append(
                "phaseIndex",
                selectedPhaseIndex.toString(),
            );

            formData.append(
                "evidenceType",
                evidenceType,
            );

            formData.append(
                "taskIndex",
                selectedTaskIndex.toString(),
            );

            const response = await fetch(
                    "/api/careers/roadmap-proof",
                {
                    method: "POST",

                    headers: {
                        Authorization: `Bearer ${token}`,
                    },

                    body: formData,
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to submit completion proof.",
                );
            }

            if (
                data?.achievementsUnlocked &&
                data.achievementsUnlocked.length > 0
            ) {
                setAchievementPopup(
                    data.achievementsUnlocked[0]
                );
            }

            if (
                data.verificationStatus ===
                "verified"
            ) {
                setProofMessage(
                    "Evidence verified successfully! This task is now completed.",
                );
            } else if (
                data.verificationStatus ===
                "rejected"
            ) {
                setProofError(
                    data.verificationResult?.reason ||
                    "The submitted evidence could not be verified.",
                );
            } else {
                setProofMessage(
                    "Evidence submitted and is waiting for verification.",
                );
            }

            setProofFile(null);

            setSelectedTaskIndex(null);

            // Refresh roadmap data
            await fetchRoadmap();

        } catch (error: any) {

            setProofError(
                error.message ||
                "Something went wrong while uploading the evidence.",
            );

        } finally {

            setUploadingProof(false);

        }
    };



    // ==========================================
    // CHECK IF PHASE IS COMPLETED
    // ==========================================

    const isPhaseCompleted = (
        phaseIndex: number
    ) => {
        if (!roadmapData) return false;

        const phase =
            roadmapData.selectedRoadmap?.roadmap[phaseIndex];

        if (!phase) return false;

        const tasks = phase.tasks || [];

        if (tasks.length === 0) {
            return false;
        }

        return tasks.every((_, taskIndex) => {
            const progress =
                roadmapData.roadmapProgress.find(
                    (item) =>
                        item.phaseIndex === phaseIndex &&
                        item.taskIndex === taskIndex
                );

            return progress?.completed === true;
        });
    };


    // ==========================================
    // GET PHASE PROGRESS
    // ==========================================

    const getTaskProgress = (
        phaseIndex: number,
        taskIndex: number,
    ) => {
        return (
            roadmapData?.roadmapProgress?.find(
                (item) =>
                    item.phaseIndex === phaseIndex &&
                    item.taskIndex === taskIndex,
            ) || null
        );
    };


    // ==========================================
    // GET VERIFICATION STATUS
    // ==========================================

    const getTaskVerificationStatus = (
        phaseIndex: number,
        taskIndex: number,
    ) => {
        return (
            getTaskProgress(
                phaseIndex,
                taskIndex,
            )?.verificationStatus ||
            "not_submitted"
        );
    };


    // ==========================================
    // CHECK IF PHASE IS UNLOCKED
    // ==========================================

    const isPhaseUnlocked = (phaseIndex: number) => {
        // First phase is always unlocked
        if (phaseIndex === 0) {
            return true;
        }

        // Every other phase requires the previous phase
        // to be completed and verified.
        return isPhaseCompleted(phaseIndex - 1);
    };



    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-white to-blue-50">

                {/* ================= NAVBAR ================= */}

                <nav className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-xl">

                    <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6">

                        {/* LOGO */}

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

                            {/* DASHBOARD */}

                            <Link
                                href="/dashboard"
                                className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:block"
                            >
                                Dashboard
                            </Link>

                            <Link
                                href="/explorer"
                                className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:block"
                            >
                                Career Explorer
                            </Link>


                            {/* ACTIVE */}

                            <Link
                                href="/my-roadmap"
                                className="hidden rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-600 transition hover:bg-blue-100 lg:block"
                            >
                                My Roadmap
                            </Link>


                            <Link
                                href="/profile"
                                className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:block"
                            >
                                Profile
                            </Link>

                            <LogoutButton />

                        </div>

                    </div>

                </nav>


                {/* LOADING */}

                <div className="relative flex min-h-[calc(100vh-76px)] items-center justify-center px-6">

                    <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl" />
                    <div className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />

                    <div className="text-lg font-medium text-slate-600">
                        Loading your roadmap...
                    </div>

                </div>

            </div>

        );

    }



    // ==========================================
    // NO ROADMAP SELECTED
    // ==========================================

    if (
        !roadmapData ||
        !roadmapData.selectedRoadmap
    ) {

        return (

            <div className="min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-white to-blue-50">

                {/* ================= NAVBAR ================= */}

                <nav className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-xl">

                    <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6">

                        <Link
                            href="/"
                            className="group flex items-center gap-3"
                        >

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-orange-500 to-blue-600 text-white shadow-lg shadow-orange-500/20">

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

                            </div>

                        </Link>


                        <div className="flex items-center gap-1 sm:gap-2">

                            <Link
                                href="/"
                                className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 md:block"
                            >
                                Home
                            </Link>

                            {/* DASHBOARD */}

                            <Link
                                href="/dashboard"
                                className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:block"
                            >
                                Dashboard
                            </Link>

                            <Link
                                href="/explorer"
                                className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 lg:block"
                            >
                                Career Explorer
                            </Link>

                            <Link
                                href="/my-roadmap"
                                className="hidden rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-600 lg:block"
                            >
                                My Roadmap
                            </Link>

                            <Link
                                href="/profile"
                                className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 md:block"
                            >
                                Profile
                            </Link>

                            <LogoutButton />

                        </div>

                    </div>

                </nav>


                {/* EMPTY ROADMAP */}

                <div className="relative flex min-h-[calc(100vh-76px)] items-center justify-center overflow-hidden p-6">

                    <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />
                    <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />

                    <div className="relative max-w-md rounded-3xl border border-white/80 bg-white/90 p-10 text-center shadow-2xl shadow-blue-900/10 backdrop-blur-xl">

                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-blue-600 text-4xl shadow-xl shadow-orange-500/20">
                            🗺️
                        </div>

                        <h1 className="text-3xl font-black tracking-tight text-slate-900">
                            No Roadmap Selected
                        </h1>

                        <p className="mt-4 leading-7 text-slate-500">
                            Go to Career Explorer and select a career roadmap to start your learning journey.
                        </p>


                        <Link
                            href="/explorer"
                            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-orange-500/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/30"
                        >
                            Explore Careers
                        </Link>

                    </div>

                </div>

            </div>

        );

    }



    const {
        selectedRoadmap,
        totalPhases,
        completedPhases,
        progressPercentage,
        roadmapCompleted,
    } = roadmapData;



    // ==========================================
    // MAIN PAGE
    // ==========================================

    return (

        <div className="min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-white to-blue-50">

            {/* ================= NAVBAR ================= */}

            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-xl">

                <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6">

                    {/* LOGO */}

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

                        {/* HOME */}

                        <Link
                            href="/"
                            className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:block"
                        >
                            Home
                        </Link>

                        {/* DASHBOARD */}

                        <Link
                            href="/dashboard"
                            className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:block"
                        >
                            Dashboard
                        </Link>

                        {/* CAREER EXPLORER */}

                        <Link
                            href="/explorer"
                            className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:block"
                        >
                            Career Explorer
                        </Link>


                        {/* ⭐ MY ROADMAP ACTIVE */}

                        <Link
                            href="/my-roadmap"
                            className="hidden rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-600 transition hover:bg-blue-100 lg:block"
                        >
                            My Roadmap
                        </Link>


                        {/* PROFILE */}

                        <Link
                            href="/profile"
                            className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:block"
                        >
                            Profile
                        </Link>

                        <div className="mx-1 hidden h-7 w-px bg-slate-200 lg:block" />

                        <LogoutButton />

                    </div>

                </div>

            </nav>


            {/* ================= PAGE CONTENT ================= */}

            <main className="relative overflow-hidden px-5 py-12 md:px-10 md:py-16">

                <div className="pointer-events-none absolute -left-40 top-0 h-[32rem] w-[32rem] rounded-full bg-orange-200/35 blur-3xl" />
                <div className="pointer-events-none absolute -right-40 top-40 h-[32rem] w-[32rem] rounded-full bg-blue-200/35 blur-3xl" />
                <div className="pointer-events-none absolute inset-0 opacity-[0.35]" style={{ backgroundImage: "radial-gradient(circle, rgba(100,116,139,0.16) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

                <div className="relative mx-auto max-w-6xl">

                    {/* PROGRESS COMPONENT */}

                    <div className="mb-12 rounded-3xl border border-white/80 bg-white/75 p-4 shadow-xl shadow-blue-900/5 backdrop-blur-xl md:p-6">

                        <RoadmapProgress
                            careerName={selectedRoadmap.career}
                            totalPhases={totalPhases}
                            completedPhases={completedPhases}
                            progressPercentage={progressPercentage}
                        />

                    </div>


                    {/* CONGRATULATIONS */}

                    {roadmapCompleted && (

                        <div className="mb-12 rounded-3xl border border-green-200/80 bg-gradient-to-br from-green-50 to-white p-10 text-center shadow-xl shadow-green-900/5">

                            <div className="text-7xl">
                                🎉
                            </div>

                            <h2 className="mt-5 text-3xl font-black text-green-800">
                                Congratulations!
                            </h2>

                            <p className="mt-2 text-lg text-green-700">

                                You have successfully completed the{" "}

                                <span className="font-bold">
                                    {selectedRoadmap.career}
                                </span>{" "}

                                roadmap!

                            </p>

                            <p className="mt-2 text-green-600">
                                Amazing work! Keep building, learning, and growing. 🚀
                            </p>

                        </div>

                    )}


                    {/* ROADMAP PHASES */}

                    <div className="space-y-7">

                        {selectedRoadmap.roadmap.map(
                            (phase, index) => {

                                const completed =
                                    isPhaseCompleted(index);


                                return (

                                    <div
                                        key={index}
                                        className={`group rounded-3xl border p-6 shadow-xl backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl md:p-8 ${completed
                                            ? "border-green-200/80 bg-gradient-to-br from-green-50 to-white shadow-green-900/5"
                                            : "border-white/80 bg-white/85 shadow-blue-900/5"
                                            }`}
                                    >


                                        {/* PHASE HEADER */}

                                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                                            <div className="flex gap-4">

                                                {/* PHASE NUMBER */}

                                                <div
                                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold ${completed
                                                        ? "bg-green-500 text-white shadow-green-500/20"
                                                        : "bg-gradient-to-br from-orange-500 to-blue-600 text-white shadow-orange-500/20"
                                                        }`}
                                                >

                                                    {completed
                                                        ? "✓"
                                                        : index + 1}

                                                </div>


                                                <div>

                                                    <h2
                                                        className={`text-xl font-bold ${completed
                                                            ? "text-green-800"
                                                            : "text-slate-900"
                                                            }`}
                                                    >
                                                        {phase.phase}
                                                    </h2>


                                                    <p className="mt-2 text-slate-600">
                                                        {phase.description}
                                                    </p>

                                                </div>

                                            </div>

                                        </div>


                                        {/* TASKS */}

                                        <div className="mt-8">

                                            <div className="mb-4 flex items-center justify-between">
                                                <h3 className="text-lg font-bold text-slate-900">
                                                    Tasks
                                                </h3>

                                                <span className="text-sm text-slate-500">
                                                    {phase.tasks.length}{" "}
                                                    {phase.tasks.length === 1 ? "task" : "tasks"}
                                                </span>
                                            </div>

                                            <div className="space-y-4">

                                                {phase.tasks.map((task, taskIndex) => {

                                                    const taskProgress =
                                                        getTaskProgress(
                                                            index,
                                                            taskIndex,
                                                        );

                                                    const taskStatus =
                                                        getTaskVerificationStatus(
                                                            index,
                                                            taskIndex,
                                                        );

                                                    const taskCompleted =
                                                        taskProgress?.completed === true;

                                                    const isGithubTask =
                                                        task.type === "project" ||
                                                        task.type === "practice";

                                                    const isCertificateTask =
                                                        task.type === "certificate";

                                                    return (
                                                        <div
                                                            key={taskIndex}
                                                            className={`rounded-2xl border p-5 transition ${
                                                                taskCompleted
                                                                    ? "border-green-200 bg-green-50"
                                                                    : "border-slate-200 bg-white"
                                                            }`}
                                                        >

                                                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                                                                {/* TASK INFORMATION */}

                                                                <div className="flex items-start gap-4">

                                                                    {/* TASK NUMBER / CHECK */}

                                                                    <div
                                                                        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                                                            taskCompleted
                                                                                ? "bg-green-500 text-white"
                                                                                : "bg-slate-100 text-slate-600"
                                                                        }`}
                                                                    >
                                                                        {taskCompleted
                                                                            ? "✓"
                                                                            : taskIndex + 1}
                                                                    </div>


                                                                    {/* TASK TEXT */}

                                                                    <div>

                                                                        <h4 className="font-bold text-slate-900">
                                                                            {task.title}
                                                                        </h4>

                                                                        <span
                                                                            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                                                                                task.type === "certificate"
                                                                                    ? "bg-purple-100 text-purple-700"
                                                                                    : task.type === "project"
                                                                                        ? "bg-blue-100 text-blue-700"
                                                                                        : "bg-orange-100 text-orange-700"
                                                                            }`}
                                                                        >
                                                                            {task.type}
                                                                        </span>

                                                                    </div>

                                                                </div>


                                                                {/* TASK STATUS / BUTTON */}

                                                                <div className="shrink-0">

                                                                    {taskCompleted ? (

                                                                        <span className="inline-flex items-center rounded-xl bg-green-100 px-4 py-2.5 text-sm font-semibold text-green-700">
                                                                            ✓ Verified
                                                                        </span>

                                                                    ) : taskStatus === "pending" ? (

                                                                        <span className="inline-flex items-center rounded-xl bg-blue-100 px-4 py-2.5 text-sm font-semibold text-blue-700">
                                                                            ⏳ Verification Pending
                                                                        </span>

                                                                    ) : taskStatus === "rejected" ? (

                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedPhaseIndex(index);
                                                                                setSelectedTaskIndex(taskIndex);

                                                                                setProofModalOpen(true);

                                                                                setProofFile(null);
                                                                                setRepositoryUrl("");

                                                                                setProofError("");
                                                                                setProofMessage("");

                                                                                setEvidenceType(
                                                                                    isGithubTask
                                                                                        ? "github"
                                                                                        : "certificate"
                                                                                );
                                                                            }}
                                                                            className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
                                                                        >
                                                                            Submit Again
                                                                        </button>

                                                                    ) : isPhaseUnlocked(index) ? (

                                                                        <div className="flex flex-col gap-2 sm:flex-row">

                                                                            {isCertificateTask && task.resourceUrl && (
                                                                                <button
                                                                                    onClick={() => {
                                                                                        window.open(
                                                                                            task.resourceUrl,
                                                                                            "_blank",
                                                                                            "noopener,noreferrer"
                                                                                        );
                                                                                    }}
                                                                                    className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                                                                                >
                                                                                    Open Course
                                                                                </button>
                                                                            )}

                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelectedPhaseIndex(index);
                                                                                    setSelectedTaskIndex(taskIndex);

                                                                                    setProofModalOpen(true);

                                                                                    setProofFile(null);
                                                                                    setRepositoryUrl("");

                                                                                    setProofError("");
                                                                                    setProofMessage("");

                                                                                    setEvidenceType(
                                                                                        isGithubTask
                                                                                            ? "github"
                                                                                            : "certificate"
                                                                                    );
                                                                                }}
                                                                                className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
                                                                            >
                                                                                {isGithubTask
                                                                                    ? "Submit GitHub Repository"
                                                                                    : "Submit Proof"}
                                                                            </button>

                                                                        </div>

                                                                    ) : (
                                                                        <span className="inline-flex items-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-500">
                                                                            🔒 Complete Previous Phase
                                                                        </span>

                                                                    )}

                                                                </div>

                                                            </div>

                                                        </div>
                                                    );
                                                })}

                                            </div>

                                        </div>


                                        {/* DETAILS */}

                                        <div className="mt-7 grid gap-4 md:grid-cols-2">


                                            {/* DURATION */}

                                            <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">

                                                <p className="text-xs font-semibold uppercase text-slate-500">
                                                    Estimated Duration
                                                </p>

                                                <p className="mt-1 font-semibold text-slate-800">
                                                    {phase.estimatedDuration}
                                                </p>

                                            </div>


                                            {/* WEEKLY HOURS */}

                                            <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">

                                                <p className="text-xs font-semibold uppercase text-slate-500">
                                                    Learning Hours
                                                </p>

                                                <p className="mt-1 font-semibold text-slate-800">
                                                    {phase.weeklyHours} hours per week
                                                </p>

                                            </div>

                                        </div>


                                        {/* SKILLS */}

                                        <div className="mt-6">

                                            <h3 className="font-bold text-slate-900">
                                                Skills You'll Learn
                                            </h3>


                                            <div className="mt-3 flex flex-wrap gap-2">

                                                {phase.skills.map(
                                                    (skill) => (

                                                        <span
                                                            key={skill}
                                                            className="rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-sm font-semibold text-blue-700"
                                                        >
                                                            {skill}
                                                        </span>

                                                    )
                                                )}

                                            </div>

                                        </div>
                                        
                                    </div>

                                );

                            }
                        )}

                    </div>

                </div>

                {achievementPopup && (
                    <MsgPopup
                        message={`🎉 Achievement Unlocked: ${achievementPopup.icon} ${achievementPopup.title}`}
                        type="success"
                        duration={5000}
                        onClose={() => setAchievementPopup(null)}
                    />
                )}

            </main>


            {/* ================= SUBMIT PROOF MODAL ================= */}

            {proofModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">

                        <div className="mb-6 flex items-start justify-between">

                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    Submit Task Evidence
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Submit evidence that you completed this roadmap task.
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setProofModalOpen(false);
                                    setProofFile(null);
                                    setProofError("");
                                    setProofMessage("");
                                }}
                                className="rounded-lg px-3 py-2 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                ×
                            </button>

                        </div>


                        {selectedPhaseIndex !== null &&
                            selectedTaskIndex !== null &&
                            selectedPhase?.tasks[selectedTaskIndex] && (
                                <div className="mt-4 mb-5 rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Selected Task
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-900">
                                        {selectedPhase.tasks[selectedTaskIndex].title}
                                    </p>

                                    <p className="mt-1 text-xs font-medium uppercase text-slate-400">
                                        {selectedPhase.tasks[selectedTaskIndex].type}
                                    </p>
                                </div>
                            )}


                        {evidenceType === "github" ? (
                            <div className="mb-5">

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Public GitHub Repository URL
                                </label>

                                <input
                                    type="url"
                                    value={repositoryUrl}
                                    onChange={(e) => {
                                        setRepositoryUrl(e.target.value);
                                        setProofError("");
                                    }}
                                    placeholder="https://github.com/owner/repository"
                                    className="w-full rounded-xl border border-slate-300 p-3 text-sm"
                                />

                                <p className="mt-2 text-xs text-slate-500">
                                    Gemini will evaluate the repository source code, README, and project structure against this task.
                                </p>

                            </div>
                        ) : (
                        <div className="mb-5">

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Upload Evidence
                            </label>

                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                    const file =
                                        e.target.files?.[0] || null;

                                    setProofFile(file);
                                    setProofError("");
                                }}
                                className="w-full rounded-xl border border-slate-300 p-3 text-sm"
                            />

                            <p className="mt-2 text-xs text-slate-500">
                                Accepted: PDF, JPG, JPEG, PNG. Maximum size: 10 MB.
                            </p>

                        </div>
                        )}


                        {proofFile && (
                            <div className="mb-5 rounded-xl bg-slate-50 p-4">

                                <p className="text-sm font-semibold text-slate-700">
                                    Selected file
                                </p>

                                <p className="mt-1 break-all text-sm text-slate-500">
                                    {proofFile.name}
                                </p>

                            </div>
                        )}


                        {proofError && (
                            <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">
                                {proofError}
                            </div>
                        )}


                        {proofMessage && (
                            <div className="mb-5 rounded-xl bg-green-50 p-4 text-sm text-green-700">
                                {proofMessage}
                            </div>
                        )}


                        <div className="flex gap-3">

                            <button
                                onClick={() => {
                                    setProofModalOpen(false);
                                    setProofFile(null);
                                    setProofError("");
                                    setProofMessage("");
                                }}
                                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>


                            <button
                                onClick={submitProof}
                                disabled={
                                    uploadingProof ||
                                    (evidenceType === "github"
                                        ? !repositoryUrl.trim()
                                        : !proofFile)
                                }
                                className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {uploadingProof
                                    ? "Uploading..."
                                    : "Submit Evidence"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>

    );
}