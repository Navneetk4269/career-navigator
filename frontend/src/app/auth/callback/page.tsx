"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get("error");
    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get("accessToken");
    const userJson = params.get("user");

    if (error || !accessToken || !userJson) {
      router.replace(
        `/login?oauthError=${encodeURIComponent(error || "provider_error")}`,
      );
      return;
    }

    try {
      const user = JSON.parse(userJson);
      const achievements = JSON.parse(
        params.get("achievementsUnlocked") || "[]",
      );

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      if (achievements.length > 0) {
        sessionStorage.setItem("newAchievements", JSON.stringify(achievements));
      }
      window.dispatchEvent(new Event("career-navigator-auth-change"));
      router.replace(user.profileCompleted ? "/" : "/profile");
    } catch {
      router.replace("/login?oauthError=provider_error");
    }
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <p className="text-sm font-medium text-slate-600">Signing you in...</p>
    </main>
  );
}