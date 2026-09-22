"use client";

interface LearningResource {
    title: string;
    description: string;
    url: string;
    type: "IBM Course" | "IBM Learning Path";
    phaseKeywords: string[];
    skills: string[];
    credential?: boolean;
}

interface FreeLearningResourcesProps {
    skills: string[];
    phase?: string;
}

const IBM_RESOURCES: LearningResource[] = [
    {
        title: "IBM SkillsBuild — Web Development Basics",
        description:
            "Build foundational web-development knowledge covering HTML, CSS, JavaScript, and essential concepts needed to start developing for the web.",
        url: "https://skills.yourlearning.ibm.com/activity/MDL-261",
        type: "IBM Course",

        phaseKeywords: [
            "critical foundations",
            "foundations",
            "web fundamentals",
            "web foundation",
            "fundamentals",
            "basic web",
            "web basics",
        ],

        skills: [
            "html",
            "css",
            "javascript",
        ],

        credential: true,
    },

    {
        title: "IBM SkillsBuild — Front-End Web Development",
        description:
            "Develop frontend skills for building interactive and responsive web pages using HTML, CSS, JavaScript, and modern frontend development concepts.",
        url: "https://skillsbuild.org/learning-catalog",
        type: "IBM Course",

        phaseKeywords: [
            "frontend",
            "front end",
            "frontend technologies",
            "user interface",
            "ui development",
            "client side",
            "responsive",
            "web interface",
        ],

        skills: [
            "html",
            "css",
            "javascript",
            "react",
            "typescript",
        ],

        credential: true,
    },

    {
        title: "IBM SkillsBuild — Back-End Development",
        description:
            "Develop backend skills including Node.js, APIs, HTTP communication, and server-side application development.",
        url: "https://skillsbuild.org/learning-catalog",
        type: "IBM Learning Path",

        phaseKeywords: [
            "backend",
            "back end",
            "backend development",
            "server side",
            "server-side",
            "api development",
            "server development",
        ],

        skills: [
            "node",
            "node.js",
            "apis",
            "rest apis",
        ],

        credential: true,
    },

    {
        title: "IBM SkillsBuild — Software Engineering for Web Developers",
        description:
            "Build broader software-engineering skills for web applications, including frontend, backend, databases, testing, and modern development practices.",
        url: "https://skillsbuild.org/learning-catalog",
        type: "IBM Learning Path",

        phaseKeywords: [
            "advanced",
            "full stack",
            "fullstack",
            "software engineering",
            "advanced development",
            "application development",
            "professional development",
        ],

        skills: [
            "html",
            "css",
            "javascript",
            "react",
            "node",
            "node.js",
            "apis",
            "rest apis",
            "databases",
        ],

        credential: true,
    },
];

function normalize(value?: string): string {
    return (value ?? "")
        .toLowerCase()
        .replace(/[()[\],]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function calculateResourceScore(
    resource: LearningResource,
    phase: string,
    skills: string[],
): number {
    const normalizedPhase = normalize(phase);

    const normalizedSkills = skills.map(
        (skill) => normalize(skill),
    );

    let score = 0;

    /*
     * PHASE MATCHING
     *
     * Phase keywords are more important than individual
     * skills because different roadmap phases can contain
     * overlapping skills.
     */

    for (const keyword of resource.phaseKeywords) {
        const normalizedKeyword =
            normalize(keyword);

        if (
            normalizedPhase.includes(
                normalizedKeyword,
            )
        ) {
            score += 10;
        }
    }

    /*
     * SKILL MATCHING
     */

    for (const resourceSkill of resource.skills) {
        const normalizedResourceSkill =
            normalize(resourceSkill);

        for (const skill of normalizedSkills) {
            if (
                skill.includes(
                    normalizedResourceSkill,
                ) ||
                normalizedResourceSkill.includes(
                    skill,
                )
            ) {
                score += 2;
            }
        }
    }

    return score;
}

function getRecommendedResource(
    phase: string | undefined,
    skills: string[],
): LearningResource | null {

    if (!skills || skills.length === 0) {
        return null;
    }

    /*
     * Calculate a score for every IBM resource.
     */

    const scoredResources =
        IBM_RESOURCES.map((resource) => ({
            resource,
            score: calculateResourceScore(
                resource,
                phase ?? "",
                skills,
            ),
        }));

    /*
     * Sort highest score first.
     */

    scoredResources.sort(
        (a, b) => b.score - a.score,
    );

    /*
     * If nothing matches either the phase or skills,
     * don't display a recommendation.
     */

    if (
        scoredResources.length === 0 ||
        scoredResources[0].score === 0
    ) {
        return null;
    }

    return scoredResources[0].resource;
}

export default function FreeLearningResources({
    skills,
    phase,
}: FreeLearningResourcesProps) {

    const recommendedResource =
        getRecommendedResource(
            phase,
            skills,
        );

    if (!recommendedResource) {
        return null;
    }

    return (
        <div className="mt-8">

            {/* Section heading */}

            <div className="mb-5">

                <h3 className="text-lg font-bold text-slate-900">
                    Recommended IBM Credential
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                    A free IBM SkillsBuild learning
                    resource selected for this roadmap
                    phase.
                </p>

            </div>

            {/* Resource card */}

            <a
                href={recommendedResource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
            >

                <div className="flex items-start justify-between gap-4">

                    <div>

                        <div className="mb-3 flex flex-wrap gap-2">

                            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                                {recommendedResource.type}
                            </span>

                            {recommendedResource.credential && (
                                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                    🏆 Digital Credential
                                </span>
                            )}

                        </div>

                        <h4 className="text-lg font-bold text-slate-900">
                            {recommendedResource.title}
                        </h4>

                    </div>

                    <span className="text-xl text-slate-400 transition group-hover:text-orange-500">
                        ↗
                    </span>

                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                    {recommendedResource.description}
                </p>

                {/* Skills from this roadmap phase */}

                <div className="mt-4 flex flex-wrap gap-2">

                    {skills.map((skill) => (
                        <span
                            key={skill}
                            className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                        >
                            {skill}
                        </span>
                    ))}

                </div>

                {/* CTA */}

                <div className="mt-5 flex items-center justify-between">

                    <span className="text-sm font-semibold text-orange-600">
                        Explore on IBM SkillsBuild →
                    </span>

                    <span className="text-slate-400 transition group-hover:text-orange-500">
                        ↗
                    </span>

                </div>

            </a>

        </div>
    );
}