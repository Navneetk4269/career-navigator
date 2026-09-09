"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { usePopup } from "../components/PopupProvider";

export default function Signup() {
  const { showPopup } = usePopup();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const response = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showPopup(data.message || "Signup failed");
        return;
      }

      showPopup("Account created successfully!");

      router.push("/login");
    } catch (error) {
      console.error(error);
      showPopup("Unable to connect to the server.");
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-6 py-12">

      {/* Background glow */}
      <div className="pointer-events-none absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-orange-100/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[550px] w-[550px] rounded-full bg-blue-100/50 blur-3xl" />

      {/* Subtle dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(100,116,139,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(circle at center, black, transparent 70%)",
        }}
      />

      {/* Logo */}
      <Link
        href="/"
        className="absolute left-6 top-6 text-2xl font-black tracking-tight"
      >
        <span className="text-orange-500">CAREER</span>
        <span className="text-blue-600">NAVIGATOR</span>
      </Link>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[430px] rounded-2xl border border-slate-200/80 bg-white/90 px-9 py-9 shadow-[0_20px_60px_-15px_rgba(30,41,59,0.18)] backdrop-blur-sm">

        {/* Icon badge */}
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-400 shadow-lg shadow-orange-500/25">
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-white">
            <path
              d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
            <path
              d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-[30px] font-bold tracking-tight text-slate-900">
            Create Account
          </h1>

          <p className="mt-2 text-[15px] text-slate-500">
            Start your career journey today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="M20 21a8 8 0 1 0-16 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
            <input
              type="text"
              name="name"
              placeholder="Full Name *"
              required
              className="h-[52px] w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <input
              type="email"
              name="email"
              placeholder="Email *"
              required
              className="h-[52px] w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <rect x="4" y="11" width="16" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password *"
              required
              minLength={6}
              className="h-[52px] w-full rounded-xl border border-slate-300 bg-white pl-11 pr-12 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path
                    d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path
                    d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A9.5 9.5 0 0 1 12 5c6.5 0 10 7 10 7a13.6 13.6 0 0 1-3.1 3.9M6.6 6.6C4 8.3 2 12 2 12a13.6 13.6 0 0 0 5 5.4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Signup */}
          <button
            type="submit"
            className="group mt-2 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-orange-500 font-semibold text-white shadow-md shadow-orange-500/25 transition hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.99]"
          >
            Sign Up
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 transition group-hover:translate-x-0.5">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">OR</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Login button */}
        <Link
          href="/login"
          className="flex h-[46px] w-full items-center justify-center rounded-xl border border-orange-200 text-sm font-semibold text-orange-500 transition hover:border-orange-300 hover:bg-orange-50"
        >
          Sign In
        </Link>

        {/* Social login placeholders */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            type="button"
            aria-label="Continue with Google"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23Z" />
              <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.06H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94l3.66-2.85Z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85C6.71 7.31 9.14 5.38 12 5.38Z" />
            </svg>
          </button>

          <button
            type="button"
            aria-label="Continue with LinkedIn"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path fill="#0A66C2" d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.86 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
            </svg>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm font-semibold">
            <span className="text-orange-500">CAREER</span>
            <span className="text-blue-600">NAVIGATOR</span>
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Your gateway to a better career
          </p>
        </div>
      </div>
    </main>
  );
}