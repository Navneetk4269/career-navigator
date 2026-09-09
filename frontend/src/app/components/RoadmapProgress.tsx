"use client";

interface RoadmapProgressProps {
    careerName: string;
    totalPhases: number;
    completedPhases: number;
    progressPercentage: number;
}

export default function RoadmapProgress({
    careerName,
    totalPhases,
    completedPhases,
    progressPercentage,
}: RoadmapProgressProps) {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg shadow-slate-200/50 backdrop-blur-sm md:p-8">

            {/* Background decoration */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-100/70 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-orange-100/70 blur-3xl" />

            <div className="relative">

                {/* Header */}
                <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5">
                            <span className="h-2 w-2 rounded-full bg-orange-500 shadow-sm shadow-orange-500/60" />

                            <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                                Learning Progress
                            </span>
                        </div>

                        <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                            {careerName}
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Track your journey and complete each phase step by step.
                        </p>
                    </div>

                    {/* Percentage */}
                    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white px-6 py-4 text-left shadow-sm sm:text-right">
                        <p className="text-4xl font-black tracking-tight text-blue-600">
                            {progressPercentage}%
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-500">
                            {completedPhases} of {totalPhases} phases completed
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative">

                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700">
                            Overall Progress
                        </span>

                        <span className="text-sm font-bold text-orange-500">
                            Keep going 🚀
                        </span>
                    </div>

                    <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/70">
                        <div
                            className="relative h-full rounded-full bg-gradient-to-r from-orange-500 via-orange-500 to-blue-600 transition-all duration-700 ease-out"
                            style={{
                                width: `${progressPercentage}%`,
                            }}
                        >
                            <div className="absolute inset-y-0 right-0 w-8 bg-white/20 blur-sm" />
                        </div>
                    </div>
                </div>

                {/* Phase indicators */}
                <div className="mt-8">

                    <div className="flex items-center justify-between gap-2">
                        {Array.from({ length: totalPhases }).map((_, index) => {
                            const completed = index < completedPhases;

                            return (
                                <div
                                    key={index}
                                    className="flex min-w-0 flex-1 flex-col items-center"
                                >

                                    {/* Connector */}
                                    <div className="relative flex w-full justify-center">

                                        {index !== totalPhases - 1 && (
                                            <div
                                                className={`absolute left-1/2 top-5 h-1 w-full ${completed
                                                        ? "bg-gradient-to-r from-orange-500 to-blue-600"
                                                        : "bg-slate-200"
                                                    }`}
                                            />
                                        )}

                                        {/* Circle */}
                                        <div
                                            className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 text-sm font-bold shadow-sm transition ${completed
                                                    ? "border-orange-100 bg-gradient-to-br from-orange-500 to-blue-600 text-white"
                                                    : "border-white bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                                                }`}
                                        >
                                            {completed ? "✓" : index + 1}
                                        </div>
                                    </div>

                                    {/* Label */}
                                    <span
                                        className={`mt-3 whitespace-nowrap text-xs font-semibold ${completed
                                                ? "text-blue-600"
                                                : "text-slate-400"
                                            }`}
                                    >
                                        Phase {index + 1}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}