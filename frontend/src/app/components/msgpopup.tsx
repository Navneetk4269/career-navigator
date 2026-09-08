"use client";

import { useEffect } from "react";

type MsgPopupProps = {
    message: string;
    type?: "success" | "error" | "warning" | "info";
    onClose: () => void;
    duration?: number;
};

export default function MsgPopup({
    message,
    type = "success",
    onClose,
    duration = 3000,
}: MsgPopupProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const styles = {
        success: {
            container:
                "border-green-200 bg-green-50 text-green-800 shadow-green-500/10",
            icon: "bg-green-500",
        },

        error: {
            container:
                "border-red-200 bg-red-50 text-red-800 shadow-red-500/10",
            icon: "bg-red-500",
        },

        warning: {
            container:
                "border-orange-200 bg-orange-50 text-orange-800 shadow-orange-500/10",
            icon: "bg-orange-500",
        },

        info: {
            container:
                "border-blue-200 bg-blue-50 text-blue-800 shadow-blue-500/10",
            icon: "bg-blue-600",
        },
    };

    const currentStyle = styles[type];

    return (
        <div className="fixed right-5 top-5 z-[9999] w-[calc(100%-40px)] max-w-md animate-[slideIn_0.3s_ease-out]">
            <div
                className={`flex items-center gap-4 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${currentStyle.container}`}
            >
                {/* Icon */}

                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${currentStyle.icon}`}
                >
                    {type === "success" && (
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
                    )}

                    {type === "error" && (
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-5 w-5"
                        >
                            <path
                                d="M6 6l12 12M18 6 6 18"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    )}

                    {type === "warning" && (
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-5 w-5"
                        >
                            <path
                                d="M12 8v5M12 17h.01"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    )}

                    {type === "info" && (
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-5 w-5"
                        >
                            <circle
                                cx="12"
                                cy="12"
                                r="9"
                                stroke="currentColor"
                                strokeWidth="2"
                            />

                            <path
                                d="M12 11v5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />

                            <path
                                d="M12 8h.01"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </svg>
                    )}
                </div>

                {/* Message */}

                <div className="flex-1">
                    <p className="text-sm font-bold">
                        {message}
                    </p>
                </div>

                {/* Close Button */}

                <button
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-black/5 hover:text-slate-700"
                    aria-label="Close popup"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}