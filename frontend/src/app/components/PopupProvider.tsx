"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
} from "react";

import MsgPopup from "./msgpopup";

type PopupType = "success" | "error" | "warning" | "info";

type PopupContextType = {
    showPopup: (
        message: string,
        type?: PopupType
    ) => void;
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

    return (
        <PopupContext.Provider value={{ showPopup }}>
            {children}

            {popup && (
                <MsgPopup
                    message={popup.message}
                    type={popup.type}
                    onClose={closePopup}
                />
            )}
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