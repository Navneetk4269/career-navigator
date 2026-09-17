"use client";

interface LearningResource {
    title: string;
    description: string;
    url: string;
    type: "Documentation" | "Course" | "Practice";
}

interface FreeLearningResourcesProps {
    skills: string[];
}

const RESOURCE_MAP: Record<string, LearningResource[]> = {
    html: [
        {
            title: "MDN — HTML",
            description:
                "Learn semantic HTML, elements, document structure, forms, links, images, and accessibility fundamentals.",
            url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content",
            type: "Documentation",
        },
        {
            title: "The Odin Project — HTML Foundations",
            description:
                "Learn HTML through practical lessons and projects.",
            url: "https://www.theodinproject.com/paths/foundations/courses/foundations/html-foundations",
            type: "Course",
        },
    ],

    css: [
        {
            title: "MDN — CSS Styling Basics",
            description:
                "Learn CSS syntax, selectors, styling, box model, and fundamental layout techniques.",
            url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics",
            type: "Documentation",
        },
        {
            title: "The Odin Project — CSS Foundations",
            description:
                "Learn CSS fundamentals, the cascade, box model, Flexbox, and responsive layouts.",
            url: "https://www.theodinproject.com/paths/foundations/courses/foundations/css-foundations",
            type: "Course",
        },
    ],

    javascript: [
        {
            title: "MDN — JavaScript",
            description:
                "Learn JavaScript fundamentals including variables, functions, events, DOM manipulation, and asynchronous programming.",
            url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting",
            type: "Documentation",
        },
        {
            title: "The Odin Project — JavaScript Basics",
            description:
                "Learn JavaScript through practical exercises and projects.",
            url: "https://www.theodinproject.com/paths/foundations/courses/foundations/javascript-basics",
            type: "Course",
        },
        {
            title: "freeCodeCamp — JavaScript",
            description:
                "Practice JavaScript concepts through interactive exercises and challenges.",
            url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/",
            type: "Practice",
        },
    ],

    react: [
        {
            title: "React — Learn",
            description:
                "Official React documentation covering components, JSX, state, events, hooks, and more.",
            url: "https://react.dev/learn",
            type: "Documentation",
        },
        {
            title: "freeCodeCamp",
            description:
                "Free interactive courses and projects for learning modern web development.",
            url: "https://www.freecodecamp.org/learn/",
            type: "Course",
        },
    ],

    typescript: [
        {
            title: "TypeScript — Handbook",
            description:
                "Official TypeScript documentation covering types, interfaces, functions, generics, and more.",
            url: "https://www.typescriptlang.org/docs/handbook/intro.html",
            type: "Documentation",
        },
    ],

    git: [
        {
            title: "The Odin Project — Git Basics",
            description:
                "Learn Git fundamentals, commits, branches, and working with repositories.",
            url: "https://www.theodinproject.com/paths/foundations/courses/foundations/advanced-html-and-css/git-basics",
            type: "Course",
        },
        {
            title: "GitHub Skills",
            description:
                "Interactive exercises for learning GitHub workflows and collaboration.",
            url: "https://skills.github.com/",
            type: "Practice",
        },
    ],

    "git/github": [
        {
            title: "GitHub Skills",
            description:
                "Interactive courses for learning GitHub and collaboration workflows.",
            url: "https://skills.github.com/",
            type: "Practice",
        },
    ],

    "node.js": [
        {
            title: "Node.js Learn",
            description:
                "Official Node.js learning resources covering the runtime, APIs, and development fundamentals.",
            url: "https://nodejs.org/en/learn",
            type: "Documentation",
        },
    ],

    node: [
        {
            title: "Node.js Learn",
            description:
                "Official Node.js learning resources and tutorials.",
            url: "https://nodejs.org/en/learn",
            type: "Documentation",
        },
    ],

    "rest apis": [
        {
            title: "MDN — HTTP",
            description:
                "Learn HTTP fundamentals, requests, responses, methods, headers, and status codes.",
            url: "https://developer.mozilla.org/en-US/docs/Web/HTTP",
            type: "Documentation",
        },
    ],

    apis: [
        {
            title: "MDN — Web APIs",
            description:
                "Explore browser APIs and learn how web applications interact with browser capabilities.",
            url: "https://developer.mozilla.org/en-US/docs/Web/API",
            type: "Documentation",
        },
    ],
};

function normalizeSkill(skill: string): string {
    return skill
        .toLowerCase()
        .replace(/[()[\],]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function getResourcesForSkill(
    skill: string,
): LearningResource[] {
    const normalized = normalizeSkill(skill);

    const resources: LearningResource[] = [];

    for (const [key, value] of Object.entries(
        RESOURCE_MAP,
    )) {
        if (
            normalized.includes(key) ||
            key.includes(normalized)
        ) {
            resources.push(...value);
        }
    }

    return resources;
}

export default function FreeLearningResources({
    skills,
}: FreeLearningResourcesProps) {
    const resources: LearningResource[] = [];

    for (const skill of skills) {
        const matchingResources =
            getResourcesForSkill(skill);

        resources.push(...matchingResources);
    }

    const uniqueResources =
        Array.from(
            new Map(
                resources.map((resource) => [
                    resource.url,
                    resource,
                ]),
            ).values(),
        );

    if (uniqueResources.length === 0) {
        return null;
    }

    return (
        <div className="mt-8">

            <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                    Free Learning Resources
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                    Curated free resources matched to
                    the skills in this phase.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">

                {uniqueResources.map(
                    (resource) => (
                        <a
                            key={resource.url}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
                        >

                            <div className="mb-3 flex items-center justify-between">

                                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                                    {resource.type}
                                </span>

                                <span className="text-slate-400 transition group-hover:text-orange-500">
                                    ↗
                                </span>

                            </div>

                            <h4 className="font-semibold text-slate-900">
                                {resource.title}
                            </h4>

                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                {resource.description}
                            </p>

                            <p className="mt-4 text-sm font-semibold text-orange-600">
                                Open Resource →
                            </p>

                        </a>
                    ),
                )}

            </div>

        </div>
    );
}