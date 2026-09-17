"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RoadmapProgress from "../components/RoadmapProgress";
import FreeLearningResources from "../components/FreeLearningResources";


interface RoadmapPhase {
    phase: string;
    skills: string[];
    description: string;
    estimatedDuration: string;
    weeklyHours: number;
    tasks: string[];
}


interface SelectedRoadmap {
    career: string;
    matchScore: number;
    description: string;
    roadmap: RoadmapPhase[];
}


interface RoadmapProgressItem {
    phaseIndex: number;
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
        | null;

    evidenceFileName: string | null;

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
}


export default function MyRoadmapPage() {

    const [roadmapData, setRoadmapData] =
        useState<MyRoadmapData | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [updatingPhase, setUpdatingPhase] =
        useState<number | null>(null);

    const [proofModalOpen, setProofModalOpen] = useState(false);
    const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number | null>(null);

    const [proofFile, setProofFile] = useState<File | null>(null);
    const [evidenceType, setEvidenceType] = useState<
        "certificate" | "screenshot"
    >("certificate");

    const [uploadingProof, setUploadingProof] = useState(false);
    const [proofMessage, setProofMessage] = useState("");
    const [proofError, setProofError] = useState("");


    // ==========================================
    // GET USER'S SELECTED ROADMAP
    // ==========================================

    const fetchRoadmap = async () => {

        try {

            setLoading(true);

            const token =
                localStorage.getItem("accessToken");


            const response = await fetch(
                "http://localhost:5000/careers/my-roadmap",
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


            const data =
                await response.json();

            setRoadmapData(data);

        } catch (error) {

            console.error(
                "Roadmap fetch error:",
                error
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchRoadmap();

    }, []);



    // ==========================================
    // COMPLETE ROADMAP PHASE
    // ==========================================

    const completePhase = async (
        phaseIndex: number
    ) => {

        // Prevent double clicking
        if (updatingPhase !== null) return;


        try {

            setUpdatingPhase(phaseIndex);

            const token =
                localStorage.getItem("accessToken");


            const response = await fetch(
                "http://localhost:5000/careers/roadmap-progress",
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        phaseIndex,
                        completed: true,
                    }),
                }
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to update roadmap progress"
                );

            }


            // Fetch updated data from backend
            await fetchRoadmap();

        } catch (error) {

            console.error(
                "Progress update error:",
                error
            );

        } finally {

            setUpdatingPhase(null);

        }

    };


    // ==========================================
    // SUBMIT ROADMAP COMPLETION PROOF
    // ==========================================

    const submitProof = async () => {
        if (selectedPhaseIndex === null) {
            return;
        }

        if (!proofFile) {
            setProofError("Please select a certificate or screenshot.");
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

            const response = await fetch(
                "http://localhost:5000/careers/roadmap-proof",
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
                data.verificationStatus ===
                "verified"
            ) {
                setProofMessage(
                    "Evidence verified successfully! This phase is now completed.",
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

        return roadmapData.roadmapProgress.some(
            (progress) =>
                progress.phaseIndex === phaseIndex &&
                progress.completed === true
        );

    };


    // ==========================================
    // GET PHASE PROGRESS
    // ==========================================

    const getPhaseProgress = (
        phaseIndex: number,
    ) => {
        return (
            roadmapData?.roadmapProgress?.find(
                (item) =>
                    item.phaseIndex === phaseIndex,
            ) || null
        );
    };


    // ==========================================
    // GET VERIFICATION STATUS
    // ==========================================

    const getVerificationStatus = (
        phaseIndex: number,
    ) => {
        return (
            getPhaseProgress(phaseIndex)
                ?.verificationStatus ||
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


                                            {/* COMPLETE / SUBMIT PROOF BUTTON */}

                                            {completed ? (
                                                <button
                                                    disabled
                                                    className="rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-white"
                                                >
                                                    ✓ Verified Evidence
                                                </button>
                                            ) : getVerificationStatus(index) ===
                                              "pending" ? (

                                                <button
                                                    disabled
                                                    className="cursor-wait rounded-xl bg-blue-100 px-5 py-3 text-sm font-semibold text-blue-700"
                                                >
                                                    ⏳ Verification Pending
                                                </button>

                                            ) : getVerificationStatus(index) ===
                                              "rejected" ? (

                                                <button
                                                    onClick={() => {
                                                        setSelectedPhaseIndex(index);
                                                        setProofModalOpen(true);
                                                        setProofFile(null);
                                                        setProofError("");
                                                        setProofMessage("");
                                                        setEvidenceType("certificate");
                                                    }}
                                                    className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
                                                >
                                                    Submit New Evidence
                                                </button>

                                            ) : isPhaseUnlocked(index) ? (

                                                <button
                                                    onClick={() => {
                                                        setSelectedPhaseIndex(index);
                                                        setProofModalOpen(true);
                                                        setProofFile(null);
                                                        setProofError("");
                                                        setProofMessage("");
                                                        setEvidenceType("certificate");
                                                    }}
                                                    className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
                                                >
                                                    Submit Completion Proof
                                                </button>

                                            ) : (

                                                <button
                                                    disabled
                                                    className="cursor-not-allowed rounded-xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-500"
                                                >
                                                    🔒 Complete Previous Phase First
                                                </button>

                                            )}

                                        </div>


                                        {/* VERIFICATION REJECTED REASON */}

                                        {getVerificationStatus(index) ===
                                            "rejected" &&
                                            getPhaseProgress(index)
                                                ?.verificationResult?.reason && (
                                                <div className="mt-4 rounded-xl bg-red-50 p-4">

                                                    <p className="text-sm font-semibold text-red-700">
                                                        Evidence was not verified
                                                    </p>

                                                    <p className="mt-1 text-sm text-red-600">
                                                        {
                                                            getPhaseProgress(index)
                                                                ?.verificationResult
                                                                ?.reason
                                                        }
                                                    </p>

                                                </div>
                                            )}


                                        {/* VERIFICATION PENDING INFO */}

                                        {getVerificationStatus(index) ===
                                            "pending" && (
                                            <div className="mt-4 rounded-xl bg-blue-50 p-4">

                                                <p className="text-sm font-semibold text-blue-700">
                                                    Evidence submitted
                                                </p>

                                                <p className="mt-1 text-sm text-blue-600">
                                                    Your evidence is being analyzed.
                                                    The phase will be completed only
                                                    after successful verification.
                                                </p>

                                            </div>
                                        )}


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

                                        <FreeLearningResources
                                            skills={phase.skills}
                                        />

                                        {/* TASKS */}

                                        <div className="mt-6">

                                            <h3 className="font-bold text-slate-900">
                                                Learning Tasks
                                            </h3>


                                            <ul className="mt-3 space-y-3">

                                                {phase.tasks.map(
                                                    (task, taskIndex) => (

                                                        <li
                                                            key={taskIndex}
                                                            className="flex gap-3 rounded-xl px-3 py-2 text-slate-600 transition hover:bg-slate-50"
                                                        >

                                                            <span className="font-bold text-orange-500">
                                                                →
                                                            </span>

                                                            {task}

                                                        </li>

                                                    )
                                                )}

                                            </ul>

                                        </div>


                                    </div>

                                );

                            }
                        )}

                    </div>

                </div>

            </main>


            {/* ================= SUBMIT PROOF MODAL ================= */}

            {proofModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">

                        <div className="mb-6 flex items-start justify-between">

                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    Submit Completion Proof
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Upload evidence that you completed this roadmap phase.
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


                        <div className="mb-5">

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Evidence Type
                            </label>

                            <select
                                value={evidenceType}
                                onChange={(e) =>
                                    setEvidenceType(
                                        e.target.value as
                                            | "certificate"
                                            | "screenshot",
                                    )
                                }
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500"
                            >
                                <option value="certificate">
                                    Certificate
                                </option>

                                <option value="screenshot">
                                    Screenshot
                                </option>
                            </select>

                        </div>


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
                                    !proofFile
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