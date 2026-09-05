"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

const CAREER_GOALS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "DevOps Engineer",
  "Mobile Developer",
  "UI/UX Designer",
  "Product Manager",
];

export default function Profile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [education, setEducation] = useState("");
  const [college, setCollege] = useState("");
  const [graduationYear, setGraduationYear] = useState("");

  const [bio, setBio] = useState("");
  const [github, setGithub] = useState("");

  const [careerGoal, setCareerGoal] = useState("");
  const [studyHours, setStudyHours] = useState("");

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load existing user/profile
  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      // Load basic user information from login
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);

          setName(user.name || "");
          setEmail(user.email || "");
        } catch (error) {
          console.error("Unable to read stored user:", error);
        }
      }

      // Load saved profile from backend
      try {
        const response = await fetch("http://localhost:5000/profiles/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const text = await response.text();

          const profile = text ? JSON.parse(text) : null;

          if (profile) {
            setEducation(profile.education || "");
            setCollege(profile.college || "");
            setGraduationYear(
              profile.graduationYear?.toString() || ""
            );
            setSkills(profile.skills || []);
            setInterests(profile.interests || []);
            setCareerGoal(profile.careerGoal || "");
            setStudyHours(
              profile.learningHoursPerWeek?.toString() || ""
            );
          }
        } else if (response.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return;
        }
      } catch (error) {
        console.error("Unable to load profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function addSkill() {
    const trimmed = skillInput.trim();

    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }

    setSkillInput("");
  }

  function handleSkillKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    } else if (
      e.key === "Backspace" &&
      skillInput === "" &&
      skills.length > 0
    ) {
      setSkills(skills.slice(0, -1));
    }
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  function addInterest() {
    const trimmed = interestInput.trim();

    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
    }

    setInterestInput("");
  }

  function handleInterestKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addInterest();
    } else if (
      e.key === "Backspace" &&
      interestInput === "" &&
      interests.length > 0
    ) {
      setInterests(interests.slice(0, -1));
    }
  }

  function removeInterest(interest: string) {
    setInterests(interests.filter((i) => i !== interest));
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setResumeFile(e.dataTransfer.files[0]);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("Please sign in first.");
      window.location.href = "/login";
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("http://localhost:5000/profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          education,
          college,
          graduationYear: Number(graduationYear),
          skills,
          interests,
          careerGoal,
          learningHoursPerWeek: studyHours
            ? Number(studyHours)
            : undefined,
        }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        alert(data?.message || "Failed to save profile");
        return;
      }

      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Profile save error:", error);
      alert("Unable to connect to the server.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 pb-20">

      {/* Background glow */}
      <div className="pointer-events-none absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-orange-100/50 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-[600px] h-[550px] w-[550px] rounded-full bg-blue-100/50 blur-3xl" />

      {/* Subtle dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(100,116,139,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 80% 50% at 50% 0%, black, transparent)",
        }}
      />

      {/* Navbar */}
      <nav className="relative z-10 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-black tracking-tight">
            <span className="text-orange-500">CAREER</span>
            <span className="text-blue-600">NAVIGATOR</span>
          </Link>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-blue-600 text-sm font-bold text-white">
            {name ? name.charAt(0).toUpperCase() : "?"}
          </div>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-10">

        {/* Profile header */}
        <div className="mb-8 flex flex-col items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/90 px-8 py-8 text-center shadow-[0_20px_60px_-15px_rgba(30,41,59,0.12)] backdrop-blur-sm sm:flex-row sm:text-left">

          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-blue-600 text-2xl font-bold text-white shadow-lg">
            {name ? name.charAt(0).toUpperCase() : "?"}

            <button
              type="button"
              className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-800 text-white shadow-sm transition hover:bg-slate-700"
              aria-label="Change avatar"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-3.5 w-3.5"
              >
                <path
                  d="M12 20h9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {name || "Your Profile"}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Complete your profile so we can build your personalized roadmap.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Personal Information */}
          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-7 shadow-sm backdrop-blur-sm">

            <SectionHeading
              title="Personal Information"
              subtitle="The basics — who you are."
              color="orange"
              icon={
                <path
                  d="M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              }
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <Field label="Full Name *">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className={inputClass}
                  disabled
                />
              </Field>

              <Field label="Email *">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className={inputClass}
                  disabled
                />
              </Field>

            </div>

            <Field label="Bio" className="mt-4">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A short summary about your background and interests..."
                rows={3}
                className={`${inputClass} h-auto resize-none py-3`}
              />
            </Field>

          </section>

          {/* Education */}
          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-7 shadow-sm backdrop-blur-sm">

            <SectionHeading
              title="Education"
              subtitle="Tell us about your academic background."
              color="blue"
              icon={
                <path
                  d="M3 10 12 5l9 5-9 5-9-5Zm0 0v6m4-4v4c0 1.1 2.24 3 5 3s5-1.9 5-3v-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              }
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

              <Field label="Education *">
                <input
                  type="text"
                  required
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="B.E. Computer Engineering"
                  className={inputClass}
                />
              </Field>

              <Field label="College *">
                <input
                  type="text"
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="Goa College of Engineering"
                  className={inputClass}
                />
              </Field>

              <Field label="Graduation Year *">
                <input
                  type="number"
                  required
                  min={1900}
                  max={2100}
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  placeholder="2027"
                  className={inputClass}
                />
              </Field>

            </div>
          </section>

          {/* Career Goal */}
          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-7 shadow-sm backdrop-blur-sm">

            <SectionHeading
              title="Career Goal"
              subtitle="What role are you working toward?"
              color="blue"
              icon={
                <path
                  d="M3 3v18h18M7 15l4-4 3 3 5-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              }
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <Field label="Target Role *">
                <select
                  required
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  className={inputClass}
                >
                  <option value="" disabled>
                    Select a career path
                  </option>

                  {CAREER_GOALS.map((goal) => (
                    <option key={goal} value={goal}>
                      {goal}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Weekly Study Hours">
                <input
                  type="number"
                  min={1}
                  max={80}
                  value={studyHours}
                  onChange={(e) => setStudyHours(e.target.value)}
                  placeholder="e.g. 10"
                  className={inputClass}
                />
              </Field>

            </div>

            <p className="mt-2 text-xs text-slate-400">
              Used to build your personalized, time-based learning roadmap.
            </p>
          </section>

          {/* Skills & Interests */}
          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-7 shadow-sm backdrop-blur-sm">

            <SectionHeading
              title="Skills & Interests"
              subtitle="Tell us what you know and what you're interested in."
              color="orange"
              icon={
                <path
                  d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              }
            />

            {/* GitHub */}
            <Field label="GitHub Username / URL">
              <div className="relative">

                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.5 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.22-3.37-1.22-.46-1.2-1.11-1.53-1.11-1.53-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 2.5-.35c.85 0 1.71.12 2.5.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .28.18.61.69.5A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
                  </svg>
                </span>

                <input
                  type="text"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="github.com/yourusername"
                  className={`${inputClass} pl-11`}
                />
              </div>

              <p className="mt-1.5 text-xs text-slate-400">
                GitHub integration will be connected separately.
              </p>
            </Field>

            {/* Skills */}
            <Field label="Skills" className="mt-5">

              <div className="flex min-h-[52px] w-full flex-wrap items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 transition focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 hover:border-slate-400">

                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                  >
                    {skill}

                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-blue-400 transition hover:text-blue-700"
                      aria-label={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  </span>
                ))}

                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  onBlur={addSkill}
                  placeholder={
                    skills.length === 0
                      ? "Type a skill and press Enter..."
                      : ""
                  }
                  className="min-w-[120px] flex-1 border-none bg-transparent px-1 py-1 text-[15px] text-slate-800 outline-none placeholder:text-slate-400"
                />

              </div>

              <p className="mt-1.5 text-xs text-slate-400">
                Add skills manually, or leave this to auto-fill from your resume and GitHub.
              </p>

            </Field>

            {/* Interests */}
            <Field label="Interests" className="mt-5">

              <div className="flex min-h-[52px] w-full flex-wrap items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 transition focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 hover:border-slate-400">

                {interests.map((interest) => (
                  <span
                    key={interest}
                    className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700"
                  >
                    {interest}

                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="text-orange-400 transition hover:text-orange-700"
                      aria-label={`Remove ${interest}`}
                    >
                      ×
                    </button>
                  </span>
                ))}

                <input
                  type="text"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={handleInterestKeyDown}
                  onBlur={addInterest}
                  placeholder={
                    interests.length === 0
                      ? "Type an interest and press Enter..."
                      : ""
                  }
                  className="min-w-[120px] flex-1 border-none bg-transparent px-1 py-1 text-[15px] text-slate-800 outline-none placeholder:text-slate-400"
                />

              </div>

              <p className="mt-1.5 text-xs text-slate-400">
                Add areas you are interested in exploring.
              </p>

            </Field>

            {/* Resume */}
            <Field label="Resume" className="mt-5">

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition ${
                  dragActive
                    ? "border-orange-400 bg-orange-50"
                    : "border-slate-300 bg-slate-50 hover:border-orange-300 hover:bg-orange-50/50"
                }`}
              >

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-8 w-8 text-orange-500"
                >
                  <path
                    d="M12 16V4m0 0L7 9m5-5 5 5M5 20h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {resumeFile ? (
                  <p className="text-sm font-medium text-slate-700">
                    {resumeFile.name}
                  </p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-slate-600">
                      Drag & drop your resume, or click to browse
                    </p>

                    <p className="text-xs text-slate-400">
                      PDF or Word, up to 10MB
                    </p>
                  </>
                )}
              </div>

              <p className="mt-1.5 text-xs text-slate-400">
                Resume upload will be connected to the backend separately.
              </p>

            </Field>

          </section>

          {/* Save bar */}
          <div className="flex items-center justify-end gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm">

            <Link
              href="/"
              className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="group flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Profile"}

              {!saving && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 transition group-hover:translate-x-0.5"
                >
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

          </div>

        </form>
      </div>
    </main>
  );
}

const inputClass =
  "h-[52px] w-full rounded-xl border border-slate-300 bg-white px-4 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function SectionHeading({
  title,
  subtitle,
  icon,
  color,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: "orange" | "blue";
}) {
  const bg = color === "orange" ? "bg-orange-50" : "bg-blue-50";
  const text = color === "orange" ? "text-orange-500" : "text-blue-600";

  return (
    <div className="mb-5 flex items-center gap-3">

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg} ${text}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
        >
          {icon}
        </svg>
      </div>

      <div>
        <h2 className="font-semibold text-slate-900">
          {title}
        </h2>

        <p className="text-xs text-slate-500">
          {subtitle}
        </p>
      </div>

    </div>
  );
}