"use client";

import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    ReactNode,
} from "react";

import MsgPopup from "./msgpopup";
import ConfirmDialog from "./ConfirmDialog";

type PopupType = "success" | "error" | "warning" | "info";

type AchievementNotification = {
    id: string;
    title: string;
    icon: string;
};

type PopupContextType = {
    showPopup: (
        message: string,
        type?: PopupType
    ) => void;
    showConfirm: (options: ConfirmOptions) => Promise<boolean>;
};

type ConfirmOptions = {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
};

const PopupContext = createContext<
    PopupContextType | undefined
>(undefined);

export function PopupProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [popup, setPopup] = useState<{
        message: string;
        type: PopupType;
    } | null>(null);
    const [achievementQueue, setAchievementQueue] =
        useState<AchievementNotification[]>([]);
    const [confirmation, setConfirmation] =
        useState<ConfirmOptions | null>(null);
    const confirmationResolver =
        useRef<((confirmed: boolean) => void) | null>(null);

    useEffect(() => {
        const consumeAchievements = () => {
            const storedAchievements =
                sessionStorage.getItem("newAchievements");

            if (!storedAchievements) {
                return;
            }

            sessionStorage.removeItem("newAchievements");

            try {
                const parsed: unknown = JSON.parse(storedAchievements);
                if (!Array.isArray(parsed)) {
                    return;
                }

                const validAchievements = parsed.filter(
                    (achievement): achievement is AchievementNotification =>
                        typeof achievement?.id === "string" &&
                        typeof achievement?.title === "string" &&
                        typeof achievement?.icon === "string",
                );

                if (validAchievements.length > 0) {
                    setAchievementQueue((queue) => [
                        ...queue,
                        ...validAchievements,
                    ]);
                }
            } catch (error) {
                console.error("Failed to read achievement notifications:", error);
            }
        };

        consumeAchievements();
        window.addEventListener(
            "career-navigator-auth-change",
            consumeAchievements,
        );

        return () => {
            window.removeEventListener(
                "career-navigator-auth-change",
                consumeAchievements,
            );
        };
    }, []);

    const showPopup = (
        message: string,
        type: PopupType = "success"
    ) => {
        setPopup({
            message,
            type,
        });
    };

    const closePopup = () => {
        setPopup(null);
    };

    const showConfirm = (options: ConfirmOptions) =>
        new Promise<boolean>((resolve) => {
            if (confirmationResolver.current) {
                resolve(false);
                return;
            }

            confirmationResolver.current = resolve;
            setConfirmation(options);
        });

    const resolveConfirmation = (confirmed: boolean) => {
        confirmationResolver.current?.(confirmed);
        confirmationResolver.current = null;
        setConfirmation(null);
    };

    return (
        <PopupContext.Provider value={{ showPopup, showConfirm }}>
            {children}

            {popup && (
                <MsgPopup
                    message={popup.message}
                    type={popup.type}
                    onClose={closePopup}
                />
            )}

            {!popup && achievementQueue.length > 0 && (
                <MsgPopup
                    message={`🎉 Achievement Unlocked: ${achievementQueue[0].icon} ${achievementQueue[0].title}`}
                    type="success"
                    duration={5000}
                    onClose={() => setAchievementQueue((queue) => queue.slice(1))}
                />
            )}

            <ConfirmDialog
                isOpen={confirmation !== null}
                title={confirmation?.title || "Confirm action"}
                message={confirmation?.message || "Continue with this action?"}
                confirmLabel={confirmation?.confirmLabel}
                cancelLabel={confirmation?.cancelLabel}
                onConfirm={() => resolveConfirmation(true)}
                onCancel={() => resolveConfirmation(false)}
            />
        </PopupContext.Provider>
    );
}

export function usePopup() {
    const context = useContext(PopupContext);

    if (!context) {
        throw new Error(
            "usePopup must be used inside PopupProvider"
        );
    }

    return context;
}