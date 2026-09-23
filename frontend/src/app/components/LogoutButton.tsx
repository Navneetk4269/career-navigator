"use client";

import { usePopup } from "./PopupProvider";

export default function LogoutButton() {
  const { showPopup } = usePopup();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    showPopup("Logged out successfully!", "success");

    setTimeout(() => {
      window.location.href = "/";
    }, 800);
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      title="Logout"
      className="group hidden items-center gap-2 rounded-xl border border-transparent px-3.5 py-2.5 text-sm font-semibold text-slate-500 transition-all duration-200 hover:border-red-100 hover:bg-red-50 hover:text-red-600 md:flex"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-0.5"
      >
        <path
          d="M10 17l5-5-5-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 12H3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M14 5V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span>Logout</span>
    </button>
  );
}
