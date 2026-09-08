"use client";

interface RoadmapPhase {
    phase: string;
    skills: string[];
    description: string;
    estimatedDuration: string;
    weeklyHours: number;
    tasks: string[];
}

interface Recommendation {
    career: string;
    roadmap: RoadmapPhase[];
}

interface RoadmapModalProps {
    recommendation: Recommendation | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function RoadmapModal({
    recommendation,
    isOpen,
    onClose,
}: RoadmapModalProps) {
    if (!isOpen || !recommendation) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={onClose}
        >
            {/* MODAL */}
            <div
                className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ================= HEADER ================= */}

                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {recommendation.career}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Your Learning Roadmap
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl font-semibold text-gray-600 transition hover:bg-gray-200 hover:text-gray-900"
                        aria-label="Close roadmap"
                    >
                        ✕
                    </button>
                </div>

                {/* ================= ROADMAP CONTENT ================= */}

                <div className="p-6">
                    {recommendation.roadmap?.length === 0 ? (
                        <div className="py-10 text-center text-gray-500">
                            No roadmap available.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {recommendation.roadmap.map((phase, index) => (
                                <div key={index} className="relative flex gap-4">
                                    {/* PHASE NUMBER */}

                                    <div className="flex flex-col items-center">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                                            {index + 1}
                                        </div>

                                        {index !== recommendation.roadmap.length - 1 && (
                                            <div className="mt-2 h-full min-h-10 w-0.5 bg-blue-200" />
                                        )}
                                    </div>

                                    {/* PHASE CARD */}

                                    <div className="mb-2 flex-1 rounded-xl border border-gray-200 bg-gray-50 p-5">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {phase.phase}
                                        </h3>

                                        <p className="mt-2 leading-relaxed text-gray-600">
                                            {phase.description}
                                        </p>

                                        {/* DURATION + HOURS */}

                                        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div className="rounded-lg bg-white p-4 shadow-sm">
                                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                    Estimated Duration
                                                </p>

                                                <p className="mt-1 font-semibold text-gray-900">
                                                    {phase.estimatedDuration}
                                                </p>
                                            </div>

                                            <div className="rounded-lg bg-white p-4 shadow-sm">
                                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                    Weekly Learning Hours
                                                </p>

                                                <p className="mt-1 font-semibold text-gray-900">
                                                    {phase.weeklyHours} hrs/week
                                                </p>
                                            </div>
                                        </div>

                                        {/* SKILLS */}

                                        <div className="mt-6">
                                            <h4 className="text-sm font-semibold text-gray-900">
                                                Skills to Learn
                                            </h4>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {phase.skills?.map((skill, skillIndex) => (
                                                    <span
                                                        key={skillIndex}
                                                        className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* TASKS */}

                                        <div className="mt-6">
                                            <h4 className="text-sm font-semibold text-gray-900">
                                                Tasks
                                            </h4>

                                            <ul className="mt-3 space-y-2">
                                                {phase.tasks?.map((task, taskIndex) => (
                                                    <li
                                                        key={taskIndex}
                                                        className="flex items-start gap-3 text-sm text-gray-600"
                                                    >
                                                        <span className="mt-0.5 font-bold text-blue-600">
                                                            ✓
                                                        </span>

                                                        <span>{task}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ================= FOOTER ================= */}

                <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-gray-200 bg-white px-6 py-5 sm:flex-row sm:justify-end">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                        Close
                    </button>

                    <button
                        className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
                    >
                        Select as My Roadmap
                    </button>
                </div>
            </div>
        </div>
    );
}