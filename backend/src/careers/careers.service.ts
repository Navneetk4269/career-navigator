import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { GoogleGenAI } from '@google/genai';

import {
    Career,
    CareerDocument,
} from './schemas/career.schema';

import {
    Profile,
    ProfileDocument,
} from '../profiles/schemas/profile.schema';

import {
    User,
    UserDocument,
} from '../users/schemas/user.schema';

import { AchievementsService } from '../achievements/achievements.service';

import * as path from 'path';

// ============================================================
// IBM SKILLSBUILD RESOURCE CATALOG
// ============================================================

const IBM_RESOURCES = [
    {
        title: 'IBM SkillsBuild — Front-End Web Development',
        keywords: [
            'frontend',
            'front-end',
            'web development',
            'html',
            'css',
            'javascript',
            'react',
            'typescript',
            'web developer',
            'frontend developer',
        ],
        url: 'https://skills.yourlearning.ibm.com/activity/PLAN-8749C02A78EC',
    },

    {
        title: 'IBM SkillsBuild — Software Engineering for Web Developers',
        keywords: [
            'full stack',
            'full-stack',
            'software engineering',
            'web developer',
            'backend',
            'back-end',
            'node',
            'node.js',
            'api',
            'database',
            'mongodb',
            'mysql',
        ],
        url: 'https://skillsbuild.org/learning-catalog?topic=software-development',
    },

    {
        title: 'IBM SkillsBuild — UX Design',
        keywords: [
            'ui',
            'ux',
            'ui/ux',
            'ui ux',
            'user experience',
            'user interface',
            'ux design',
            'ui design',
            'user research',
            'wireframe',
            'wireframing',
            'prototype',
            'prototyping',
            'usability',
            'usability testing',
            'design thinking',
        ],
        url: 'https://skills.yourlearning.ibm.com/activity/PLAN-3749C72117E2',
    },

    {
        title: 'IBM SkillsBuild — Data & Analytics',
        keywords: [
            'data analyst',
            'data analytics',
            'data analysis',
            'analytics',
            'data visualization',
            'statistics',
            'business intelligence',
            'bi',
            'excel',
            'sql',
            'data',
        ],
        url: 'https://skills.yourlearning.ibm.com/activity/PLAN-BC0FAEE8E439',
    },

    {
        title: 'IBM SkillsBuild — Artificial Intelligence Fundamentals',
        keywords: [
            'artificial intelligence',
            'artificial intelligence engineer',
            'ai',
            'machine learning',
            'ml',
            'deep learning',
            'nlp',
            'natural language processing',
            'computer vision',
            'neural network',
            'generative ai',
        ],
        url: 'https://skills.yourlearning.ibm.com/activity/PLAN-7913EE1DB030',
    },

    {
        title: 'IBM SkillsBuild — Cybersecurity Fundamentals',
        keywords: [
            'cybersecurity',
            'cyber security',
            'security',
            'information security',
            'ethical hacking',
            'penetration testing',
            'soc',
            'security analyst',
            'incident response',
            'threat analysis',
            'network security',
        ],
        url: 'https://skills.yourlearning.ibm.com/activity/ILB-DNRPWDGQGMMY7GGD',
    },

    {
        title: 'IBM SkillsBuild — Cloud Computing',
        keywords: [
            'cloud',
            'cloud computing',
            'cloud engineer',
            'devops',
            'dev ops',
            'aws',
            'azure',
            'docker',
            'kubernetes',
            'virtualization',
            'infrastructure',
            'deployment',
            'ci/cd',
        ],
        url: 'https://skills.yourlearning.ibm.com/activity/PLAN-2EC3A305F2C3',
    },

    {
        title: 'IBM SkillsBuild — IT & Cloud',
        keywords: [
            'information technology',
            'it support',
            'it specialist',
            'network',
            'networking',
            'computer networks',
            'systems',
            'system administrator',
            'technical support',
            'infrastructure',
        ],
        url: 'https://skills.yourlearning.ibm.com/activity/PLAN-3E2A749669E2',
    },

    {
        title: 'IBM SkillsBuild — Applied Data Science with Python',
        keywords: [
            'data scientist',
            'data science',
            'python',
            'pandas',
            'data analysis',
            'data visualization',
            'machine learning',
        ],
        url: 'https://skills.yourlearning.ibm.com/activity/PLAN-B6CBEFCA2BFD',
    },
];


// ============================================================
// FIND THE MOST RELEVANT IBM RESOURCE
// ============================================================

function findBestIbmResource(
    career: string,
    phase: any,
) {
    const searchText = [
        career || '',
        phase?.phase || '',
        phase?.description || '',
        ...(Array.isArray(phase?.skills)
            ? phase.skills
            : []),
    ]
        .join(' ')
        .toLowerCase();

    let bestResource: any = null;
    let bestScore = 0;

    for (const resource of IBM_RESOURCES) {

        let score = 0;

        for (const keyword of resource.keywords) {

            if (searchText.includes(keyword.toLowerCase())) {
                score++;
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestResource = resource;
        }
    }

    return bestResource;
}


// ============================================================
// ADD THE MOST RELEVANT IBM RESOURCE AS A REQUIRED TASK
// ============================================================

function addRequiredIbmCourseTasks(
    roadmap: any[],
    career: string,
) {
    if (!Array.isArray(roadmap)) {
        return roadmap;
    }

    let resourceAdded = false;

    return roadmap.map((phase: any) => {
        let tasks = Array.isArray(phase?.tasks)
            ? [...phase.tasks]
            : [];

        const resource = findBestIbmResource(
            career,
            phase,
        );

        if (!resource) {
            return {
                ...phase,
                tasks,
            };
        }

        // Find any IBM SkillsBuild task Gemini may
        // have generated itself.
        const existingIbmIndex = tasks.findIndex(
            (task: any) =>
                typeof task !== 'string' &&
                task?.type === 'certificate' &&
                typeof task?.title === 'string' &&
                task.title
                    .toLowerCase()
                    .includes('ibm skillsbuild'),
        );

        // If an IBM task already exists, replace it
        // with our verified resource.
        if (existingIbmIndex !== -1) {
            if (!resourceAdded) {
                tasks[existingIbmIndex] = {
                    title: `Complete ${resource.title}`,
                    type: 'certificate',
                    resourceUrl: resource.url,
                };

                resourceAdded = true;
            } else {
                // Remove duplicate IBM tasks
                tasks = tasks.filter(
                    (_task: any, index: number) =>
                        index === existingIbmIndex ||
                        !(
                            typeof _task !== 'string' &&
                            _task?.type === 'certificate' &&
                            typeof _task?.title === 'string' &&
                            _task.title
                                .toLowerCase()
                                .includes('ibm skillsbuild')
                        ),
                );
            }

            return {
                ...phase,
                tasks,
            };
        }

        // Add our IBM resource if one hasn't
        // been added to the roadmap yet.
        if (!resourceAdded) {
            const certificateTask = {
                title: `Complete ${resource.title}`,
                type: 'certificate',
                resourceUrl: resource.url,
            };

            resourceAdded = true;

            return {
                ...phase,
                tasks: [
                    certificateTask,
                    ...tasks,
                ],
            };
        }

        return {
            ...phase,
            tasks,
        };
    });
}


@Injectable()
export class CareersService {

    private readonly gemini: GoogleGenAI;


    constructor(

        @InjectModel(Career.name)
        private readonly careerModel: Model<CareerDocument>,

        @InjectModel(Profile.name)
        private readonly profileModel: Model<ProfileDocument>,

        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,

        private readonly achievementsService: AchievementsService,

    ) {

        this.gemini = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY!,
        });

    }


    async recommendCareers(userId: string) {

        try {

            // =====================================
            // STEP 1: GET USER PROFILE
            // =====================================

            const profile =
                await this.profileModel.findOne({
                    userId,
                });


            if (!profile) {

                throw new NotFoundException(
                    'Profile not found. Please create your profile first.',
                );

            }


            // =====================================
            // STEP 2: COLLECT USER SKILLS
            // =====================================

            const userSkills = [

                ...new Set([

                    ...(profile.skills || []),

                    ...(profile.programmingLanguages || []),

                ]),

            ];


            // =====================================
            // STEP 3: GET LEARNING HOURS ⭐
            // =====================================

            const learningHoursPerWeek =
                profile.learningHoursPerWeek || 7;


            const learningHoursPerDay =
                Math.round(
                    (learningHoursPerWeek / 7) * 10,
                ) / 10;


            // =====================================
            // STEP 4: CREATE GEMINI PROMPT
            // =====================================

            const prompt = `

You are an AI Career Recommendation System.

Your task is to analyze the user's profile and recommend
the most suitable technology careers.

You must provide Explainable AI reasoning.

Do not recommend careers randomly.

Recommendations must be based on the user's actual:

- Skills
- Programming languages
- Interests
- Education
- Bio
- GitHub projects
- Available learning time


=================================
USER PROFILE
=================================

Skills:

${JSON.stringify(userSkills, null, 2)}


Programming Languages:

${JSON.stringify(
                profile.programmingLanguages || [],
                null,
                2,
            )}


Interests:

${JSON.stringify(
                profile.interests || [],
                null,
                2,
            )}


Education:

${profile.education || 'Not provided'}


College:

${profile.college || 'Not provided'}


Graduation Year:

${profile.graduationYear || 'Not provided'}


Bio:

${profile.bio || 'Not provided'}


GitHub Username:

${profile.githubUsername || 'Not connected'}


GitHub Repositories:

${JSON.stringify(
                profile.githubRepositories || [],
                null,
                2,
            )}


=================================
AVAILABLE LEARNING TIME ⭐
=================================

The user entered this while creating their profile:

Learning Hours Per Week:

${learningHoursPerWeek}


Average Learning Hours Per Day:

${learningHoursPerDay}


IMPORTANT:

The user does NOT enter learning hours again.

This value comes directly from their profile.

You MUST use this available learning time when
creating the learning roadmap.


=================================
YOUR TASK
=================================

Recommend the TOP 3 most suitable career paths.

Possible examples include:

- Frontend Developer
- Backend Developer
- Full Stack Developer
- Mobile App Developer
- Data Analyst
- Data Scientist
- Machine Learning Engineer
- DevOps Engineer
- Cloud Engineer
- UI/UX Developer

You are not limited to these examples.

Choose careers based on the actual user profile.


=================================
EXPLAINABLE AI REQUIREMENTS
=================================

For every recommended career explain:

1. Why the career matches the user.

2. Which existing skills helped the recommendation.

3. Which interests helped the recommendation.

4. Which GitHub/project evidence supports the recommendation.

5. What skills are missing.

6. Why each missing skill is important.

7. Why the skill received its priority.


=================================
PRIORITY SYSTEM
=================================

Use these priority levels:

CRITICAL

HIGH

MEDIUM

SUPPORTING


Priority rules:


CRITICAL:

Skills that are essential for becoming job-ready
for the recommended career.


HIGH:

Important skills frequently required in jobs
for that career.


MEDIUM:

Useful skills that improve opportunities
but are not immediately required.


SUPPORTING:

Helpful tools or additional knowledge that
should not delay job readiness.


Do NOT give high priority to every skill.

For example:

For a Frontend Developer:

React → CRITICAL

JavaScript → CRITICAL

TypeScript → HIGH

GitHub → SUPPORTING

GitHub should generally not receive the same
priority as core development technologies unless
there is a strong reason.


=================================
PERSONALIZED ROADMAP ⭐
=================================

Create a realistic roadmap based on:

1. Missing skills.

2. Skill priorities.

3. The user's available learning time.


The user can study:

${learningHoursPerWeek} hours per week.


This is approximately:

${learningHoursPerDay} hours per day.


IMPORTANT ROADMAP RULES:

1. CRITICAL skills must be learned first.

2. HIGH priority skills come after critical skills.

3. MEDIUM skills can be learned later.

4. SUPPORTING skills should not delay job readiness.

5. The roadmap duration must be realistic.

6. Base the roadmap speed on
${learningHoursPerWeek} hours per week.

7. If the user has fewer hours,
the roadmap should take longer.

8. If the user has more hours,
the roadmap can progress faster.

9. Include practical projects.

10. Do not overload one phase with too many skills.

11. REQUIRED LEARNING ACTIVITIES:

If a relevant IBM SkillsBuild course or learning path is
appropriate for a roadmap phase, identify the learning
activity by its specific course/path name.

The backend application will assign the verified IBM
SkillsBuild URL after Gemini returns the roadmap.

Therefore, Gemini MUST NOT generate or guess IBM SkillsBuild URLs.


12. A required IBM SkillsBuild course or learning path MUST
be represented inside that phase's "tasks" array.


13. A required IBM SkillsBuild course or learning path MUST use:

"type": "certificate"


14. Do NOT place a required IBM SkillsBuild course only
in an informational recommendation.


15. The certificate task must have a specific title such as:

"Complete IBM SkillsBuild — Front-End Web Development"

or

"Complete IBM SkillsBuild — Software Engineering for Web Developers"


16. Use "certificate" for courses, certifications,
and structured learning activities where completion can
be demonstrated using a certificate, credential,
or completion screenshot.


17. Use "project" for portfolio projects.


18. Use "practice" for hands-on coding activities
that can be demonstrated through a public GitHub repository.


19. A phase may contain a mixture of certificate,
project, and practice tasks.


20. Only recommend an IBM SkillsBuild course or learning path
when it is genuinely relevant to the skills being learned
in that phase.


21. IBM SkillsBuild URLs MUST NOT be generated by Gemini.

Do NOT use:

"https://skillsbuild.org/learning-catalog"

Do NOT use:

"https://skillsbuild.org/"

Do NOT invent "skills.yourlearning.ibm.com" activity IDs.

Do NOT guess activity IDs.

The backend will add the verified resourceUrl.


22. If an IBM SkillsBuild learning activity is appropriate,
provide only its specific title in the task.

The backend will automatically attach the verified URL.


=================================
ROADMAP FORMAT
=================================

Create phases such as:

Phase 1 - Critical Foundations

Phase 2 - Core Technologies

Phase 3 - Projects and Practice

Phase 4 - Job Preparation


For every phase provide:

- phase
- skills
- description
- estimatedDuration
- weeklyHours
- tasks

Each task must be an object with:

- title: a specific, testable learning activity
- type: exactly one of "certificate", "project", or "practice"
- resourceUrl: optional URL for non-IBM learning resources only


IMPORTANT RESOURCE URL RULE:

For IBM SkillsBuild tasks, DO NOT provide resourceUrl.

The backend application will automatically add the
verified IBM SkillsBuild URL after Gemini returns the roadmap.

For certificate tasks:

- Include resourceUrl when the task is based on a specific
online course, certification, or learning resource.

- Use a real, relevant URL.

- Do not invent URLs.

For project and practice tasks:

- resourceUrl may be omitted.

Use "project" for portfolio projects.

Use "practice" for hands-on coding work that can be
demonstrated through a public GitHub repository.

Use "certificate" for required courses, certifications,
or structured learning activities where the user can
provide completion evidence.

IMPORTANT:

If an IBM SkillsBuild course is included in a phase,
the course MUST be represented as a certificate task.

Example:

{
    "title": "Complete IBM SkillsBuild — Front-End Web Development",
    "type": "certificate"
}

The backend will automatically attach the verified
IBM SkillsBuild resourceUrl to this task.

The user must complete this course and submit a certificate
or completion screenshot.

The IBM course MUST NOT be represented only as an
informational recommendation.

=================================
RETURN FORMAT
=================================

Return ONLY valid JSON.

Do not include markdown.

Return exactly this structure:


{
  "recommendations": [

    {
      "career": "",

      "matchScore": 0,

      "description": "",

      "whyRecommended": [],

      "strengthsUsed": [],

      "missingSkills": [

        {
          "skill": "",

          "priority": "",

          "priorityScore": 0,

          "reason": ""
        }

      ],

      "roadmap": [

        {
          "phase": "",

          "skills": [],

          "description": "",

          "estimatedDuration": "",

          "weeklyHours": 0,

          "tasks": [
            {
              "title": "",
              "type": "certificate",
              "resourceUrl": ""
            }
          ]
        }

      ]

    }

  ]
}

`;



            // =====================================
            // STEP 5: CALL GEMINI WITH RETRY
            // =====================================

            // =====================================
            // STEP 5: CALL GEMINI WITH MODEL FALLBACK
            // =====================================

            let response: any;

            const models = [
                'gemini-3.8-flash',
                'gemini-3.7-flash',
                'gemini-3.5-flash-lite',
            ];

            const maxRetriesPerModel = 2;

            let lastError: any = null;

            for (const model of models) {

                console.log(
                    `Trying Gemini model: ${model}`,
                );

                for (
                    let attempt = 1;
                    attempt <= maxRetriesPerModel;
                    attempt++
                ) {

                    try {

                        response =
                            await this.gemini.models.generateContent({

                                model,

                                contents: prompt,

                                config: {
                                    responseMimeType:
                                        'application/json',
                                },

                            });

                        console.log(
                            `Gemini succeeded using model: ${model}`,
                        );

                        break;

                    } catch (error: any) {

                        lastError = error;

                        const status =
                            error?.status ||
                            error?.code;

                        console.error(
                            `Gemini ${model} attempt ${attempt} failed:`,
                            error?.message,
                        );

                        // Only retry/fallback for temporary
                        // rate-limit or service availability errors.
                        if (
                            status !== 503 &&
                            status !== 429
                        ) {
                            throw error;
                        }

                        if (
                            attempt < maxRetriesPerModel
                        ) {

                            const delay =
                                attempt * 2000;

                            console.log(
                                `Retrying ${model} in ${
                                    delay / 1000
                                } seconds...`,
                            );

                            await new Promise(
                                (resolve) =>
                                    setTimeout(
                                        resolve,
                                        delay,
                                    ),
                            );

                        }

                    }

                }

                // Stop if Gemini succeeded.
                if (response) {
                    break;
                }

                console.log(
                    `${model} unavailable. Trying next Gemini model...`,
                );
            }

            if (!response) {
                throw lastError ||
                    new Error(
                        'All Gemini models failed.',
                    );
            }

            // =====================================
            // STEP 6: GET GEMINI RESPONSE
            // =====================================

            const responseText =
                response.text;


            if (!responseText) {

                throw new Error(
                    'Gemini returned an empty response.',
                );

            }


            // =====================================
            // STEP 7: PARSE JSON
            // =====================================

            const result = JSON.parse(responseText);

            result.recommendations =
                result.recommendations.map(
                    (recommendation: any) => ({
                        ...recommendation,
                        roadmap:
                            addRequiredIbmCourseTasks(
                                recommendation.roadmap || [],
                                recommendation.career || '',
                            ),
                    }),
                );


            // =====================================
            // STEP 8: VALIDATE RESPONSE
            // =====================================

            if (
                !result.recommendations ||
                !Array.isArray(
                    result.recommendations,
                )
            ) {

                throw new Error(
                    'Invalid career recommendation format from Gemini.',
                );

            }


            // =====================================
            // STEP 9: SAVE TO DATABASE
            // =====================================

            const careerAnalysis =
                await this.careerModel.findOneAndUpdate(
                    {
                        userId,
                    },
                    {
                        $set: {
                            recommendations:
                                result.recommendations,
                        },
                        $setOnInsert: {
                            userId,
                        },
                    },
                    {
                        returnDocument: 'after',
                        upsert: true,
                    }
                );


            // =====================================
            // STEP 10: RETURN RESULT
            // =====================================

            return {

                message:
                    'Career recommendations generated successfully.',

                learningHoursPerWeek,

                recommendations:
                    careerAnalysis.recommendations,

            };

        } catch (error: any) {

            console.error(
                'Career Recommendation Error:',
                error,
            );


            if (
                error instanceof NotFoundException
            ) {

                throw error;

            }


            throw new InternalServerErrorException(
                'Failed to generate career recommendations.',
            );

        }

    }

    async selectRoadmap(
        userId: string,
        recommendation: any,
    ) {
        const career = await this.careerModel.findOne({
            userId,
        });

        if (!career) {
            throw new NotFoundException(
                'Career recommendations not found. Please generate recommendations first.',
            );
        }

        career.selectedRoadmap = recommendation;

        career.selectedAt = new Date();

        // ⭐ Reset phase progress when user selects a roadmap
        career.roadmapProgress = [];

        await career.save();

        return {
            message: 'Roadmap selected successfully.',
            selectedRoadmap: career.selectedRoadmap,
            selectedAt: career.selectedAt,
        };
    }


    async submitGithubRepository(
        userId: string,
        phaseIndex: number,
        taskIndex: number,
        repositoryUrl: string,
    ) {
        let parsedUrl: URL;

        try {
            parsedUrl = new URL(repositoryUrl);
        } catch {
            throw new BadRequestException(
                'Enter a valid public GitHub repository URL.',
            );
        }

        const pathParts = parsedUrl.pathname
            .split('/')
            .filter(Boolean);

        if (
            parsedUrl.hostname !== 'github.com' ||
            pathParts.length !== 2
        ) {
            throw new BadRequestException(
                'Use a public repository URL such as https://github.com/owner/repository.',
            );
        }

        const career = await this.careerModel.findOne({ userId });
        const roadmapPhase =
            career?.selectedRoadmap?.roadmap?.[phaseIndex];

        if (!roadmapPhase) {
            throw new BadRequestException('Invalid roadmap phase.');
        }

        const task = roadmapPhase.tasks?.[taskIndex];

        if (
            !task ||
            typeof task === 'string' ||
            !['project', 'practice'].includes(task.type)
        ) {
            throw new BadRequestException(
                'Select a project or practice task for GitHub verification.',
            );
        }

        const [owner, repository] = pathParts;
        const apiUrl =
            `https://api.github.com/repos/${owner}/${repository}`;
        const response = await fetch(apiUrl, {
            headers: {
                Accept: 'application/vnd.github+json',
            },
        });

        if (!response.ok) {
            throw new BadRequestException(
                'The GitHub repository could not be found or is not public.',
            );
        }

        const repo = await response.json() as {
            full_name: string;
            description: string | null;
            html_url: string;
            language: string | null;
            topics?: string[];
            default_branch: string;
        };

        let readme = '';
        const readmeResponse = await fetch(`${apiUrl}/readme`, {
            headers: { Accept: 'application/vnd.github+json' },
        });

        if (readmeResponse.ok) {
            const readmeData = await readmeResponse.json() as {
                content?: string;
            };
            readme = Buffer.from(
                readmeData.content || '',
                'base64',
            ).toString('utf8').slice(0, 50000);
        }

        const treeResponse = await fetch(
            `${apiUrl}/git/trees/${repo.default_branch}?recursive=1`,
            { headers: { Accept: 'application/vnd.github+json' } },
        );
        const sourceFiles: { path: string; content: string }[] = [];

        if (treeResponse.ok) {
            const treeData = await treeResponse.json() as {
                tree?: { path: string; type: string; size?: number }[];
            };
            const codeFiles = (treeData.tree || [])
                .filter((file) =>
                    file.type === 'blob' &&
                    (file.size || 0) <= 50000 &&
                    /(^|\/)(package\.json|README\.md)$|\.(ts|tsx|js|jsx|py|java|go|rb|php|html|css)$/i.test(file.path),
                )
                .slice(0, 12);

            for (const file of codeFiles) {
                const fileResponse = await fetch(
                    `https://raw.githubusercontent.com/${owner}/${repository}/${repo.default_branch}/${file.path}`,
                );

                if (fileResponse.ok) {
                    sourceFiles.push({
                        path: file.path,
                        content: (await fileResponse.text()).slice(0, 8000),
                    });
                }
            }
        }

        const repositoryEvidence = Buffer.from(
            JSON.stringify(
                {
                    repository: repo.full_name,
                    url: repo.html_url,
                    description: repo.description,
                    language: repo.language,
                    topics: repo.topics || [],
                    readme,
                    sourceFiles,
                },
                null,
                2,
            ),
            'utf8',
        );

        return this.initializePhaseVerification(
            userId,
            phaseIndex,
            'github',
            repositoryUrl,
            {
                buffer: repositoryEvidence,
                originalname: `${owner}-${repository}.txt`,
                mimetype: 'text/plain',
                size: repositoryEvidence.length,
            } as Express.Multer.File,
            false,
            taskIndex,
            task.title,
        );
    }


    private calculateRoadmapProgress(
        career: CareerDocument,
    ) {
        const roadmap =
            career.selectedRoadmap?.roadmap || [];

        const progress =
            career.roadmapProgress || [];

        const completedPhases =
            roadmap.filter(
                (phase: any, phaseIndex: number) => {

                    const tasks =
                        phase.tasks || [];

                    // A phase with no tasks cannot be completed.
                    if (tasks.length === 0) {
                        return false;
                    }

                    // Every task in the phase must be verified.
                    return tasks.every(
                        (
                            _task: any,
                            taskIndex: number,
                        ) =>
                            progress.some(
                                (item) =>
                                    item.phaseIndex ===
                                        phaseIndex &&
                                    item.taskIndex ===
                                        taskIndex &&
                                    item.completed === true,
                            ),
                    );
                },
            ).length;

        const totalPhases =
            roadmap.length;

        const progressPercentage =
            totalPhases > 0
                ? Math.round(
                    (completedPhases /
                        totalPhases) *
                        100,
                )
                : 0;

        const roadmapCompleted =
            totalPhases > 0 &&
            completedPhases === totalPhases;

        return {
            totalPhases,
            completedPhases,
            progressPercentage,
            roadmapCompleted,
        };
    }


    // =====================================
    // GET USER'S SELECTED ROADMAP
    // =====================================

    async getMyRoadmap(
        userId: string,
    ) {

        const career =
            await this.careerModel.findOne({
                userId,
            });

        const user =
            await this.userModel.findById(userId);


        // =====================================
        // USER HAS NO CAREER DATA
        // =====================================

        if (!career) {

            return {
                message:
                    'No roadmap selected yet.',

                selectedRoadmap: null,

                selectedAt: null,

                roadmapProgress: [],

                totalPhases: 0,

                completedPhases: 0,

                progressPercentage: 0,

                roadmapCompleted: false,

                achievements: user?.achievements || [],
            };

        }


        // =====================================
        // USER HAS NOT SELECTED A ROADMAP
        // =====================================

        if (!career.selectedRoadmap) {

            return {
                message:
                    'No roadmap selected yet.',

                selectedRoadmap: null,

                selectedAt: null,

                roadmapProgress: [],

                totalPhases: 0,

                completedPhases: 0,

                progressPercentage: 0,

                roadmapCompleted: false,

                achievements: user?.achievements || [],
            };

        }


        // =====================================
        // CALCULATE TASK-BASED PROGRESS
        // =====================================

        const {
            totalPhases,
            completedPhases,
            progressPercentage,
            roadmapCompleted,
        } =
            this.calculateRoadmapProgress(
                career,
            );


        // =====================================
        // RETURN ROADMAP + PROGRESS
        // =====================================

        return {

            message:
                'Selected roadmap retrieved successfully.',

            selectedRoadmap:
                career.selectedRoadmap,

            selectedAt:
                career.selectedAt,

            roadmapProgress:
                career.roadmapProgress || [],

            totalPhases,

            completedPhases,

            progressPercentage,

            roadmapCompleted,

            achievements: user?.achievements || [],

        };
    }


    // =====================================
    // INITIALIZE + VERIFY PHASE EVIDENCE
    // =====================================

    async initializePhaseVerification(
        userId: string,
        phaseIndex: number,
        evidenceType: 'certificate' | 'screenshot' | 'github',
        evidenceFileName: string,
        evidenceFile: Express.Multer.File,
        verifyInBackground = false,
        taskIndex: number | null = null,
        taskTitle: string | null = null,
    ) {
        // Evidence is intentionally held only in memory for this request.
        const evidenceFilePath = null;
        const career =
            await this.careerModel.findOne({
                userId,
            });

        if (!career) {
            throw new NotFoundException(
                'Career data not found.',
            );
        }

        if (!career.selectedRoadmap) {
            throw new NotFoundException(
                'No roadmap selected.',
            );
        }

        const totalPhases =
            career.selectedRoadmap.roadmap?.length || 0;

        // =====================================
        // VALIDATE PHASE
        // =====================================

        if (
            phaseIndex < 0 ||
            phaseIndex >= totalPhases
        ) {
            throw new BadRequestException(
                'Invalid roadmap phase.',
            );
        }

        // =====================================
        // GET EXISTING PROGRESS
        // =====================================

        const existingProgress =
            career.roadmapProgress.find(
                (item) =>
                    item.phaseIndex === phaseIndex &&
                    (item.taskIndex ?? null) === taskIndex,
            );

        if (existingProgress?.completed) {
            throw new BadRequestException(
                'This roadmap phase has already been verified and completed.',
            );
        }

        // =====================================
        // GET ROADMAP PHASE
        // =====================================

        const roadmapPhase =
            career.selectedRoadmap
                .roadmap[phaseIndex];

        if (!roadmapPhase) {
            throw new BadRequestException(
                'Roadmap phase not found.',
            );
        }

        const task =
            taskIndex !== null
                ? roadmapPhase.tasks?.[taskIndex]
                : null;

        if (!task) {
            throw new BadRequestException(
                'Roadmap task not found.',
            );
        }

        if (
            evidenceType === 'github' &&
            !['project', 'practice'].includes(task.type)
        ) {
            throw new BadRequestException(
                'GitHub evidence can only be submitted for project or practice tasks.',
            );
        }

        if (
            evidenceType !== 'github' &&
            task.type !== 'certificate'
        ) {
            throw new BadRequestException(
                'Certificate or screenshot evidence can only be submitted for certificate tasks.',
            );
        }

        const resolvedTaskTitle =
            task.title ?? taskTitle ?? null;

        // =====================================
        // SAVE EVIDENCE AS PENDING
        // =====================================

        const progressData = {
            phaseIndex,

            taskIndex,

            taskTitle: resolvedTaskTitle,

            completed: false,

            completedAt: null,

            verificationStatus:
                'pending' as const,

            evidenceType,

            evidenceFileName,

            evidenceFilePath,

            verificationResult: null,
        };

        const existingProgressIndex =
            career.roadmapProgress.findIndex(
                (item) =>
                    item.phaseIndex === phaseIndex &&
                    (item.taskIndex ?? null) === taskIndex,
            );

        if (existingProgressIndex >= 0) {

            career.roadmapProgress[
                existingProgressIndex
            ] = progressData;

        } else {

            career.roadmapProgress.push(
                progressData,
            );

        }

        await career.save();

        if (!verifyInBackground) {
            void this.initializePhaseVerification(
                userId,
                phaseIndex,
                evidenceType,
                evidenceFileName,
                evidenceFile,
                true,
                taskIndex,
                taskTitle,
            ).catch((error) => {
                console.error(
                    'Roadmap evidence background verification error:',
                    error,
                );
            });

            return {
                message:
                    'Evidence submitted. Verification is in progress.',
                phaseIndex,
                verificationStatus: 'pending',
                completed: false,
            };
        }

        // =====================================
        // VERIFY WITH GEMINI
        // =====================================

        try {
            const verificationResult =
                await this.verifyRoadmapEvidence(
                    userId,
                    roadmapPhase,
                    task,
                    evidenceType,
                    evidenceFileName,
                    evidenceFile,
                );

            // =====================================
            // FIND PROGRESS AGAIN
            // =====================================

            const progressIndex =
                career.roadmapProgress.findIndex(
                    (item) =>
                        item.phaseIndex === phaseIndex &&
                        (item.taskIndex ?? null) === taskIndex,
                );

            if (progressIndex === -1) {
                throw new Error(
                    'Roadmap progress entry not found.',
                );
            }

            // =====================================
            // VERIFIED
            // =====================================

            if (
                verificationResult.verified
            ) {

                career.roadmapProgress[
                    progressIndex
                ] = {
                phaseIndex,

                taskIndex,

                taskTitle: resolvedTaskTitle,

                completed: true,

                    completedAt:
                        new Date(),

                    verificationStatus:
                        'verified',

                    evidenceType,

                    evidenceFileName,

                    evidenceFilePath,

                    verificationResult: {
                        confidence:
                            verificationResult.confidence,

                        learnerName:
                            verificationResult.learnerName,

                        courseName:
                            verificationResult.courseName,

                        platform:
                            verificationResult.platform,

                        completionStatus:
                            verificationResult.completionStatus,

                        relevantSkills:
                            verificationResult.relevantSkills,

                        reason:
                            verificationResult.reason,
                    },
                };
                await career.save();

                const newlyUnlocked =
                    await this.achievementsService.processRoadmapCompletion(
                        userId,
                    );
                // =====================================
                // ADD VERIFIED PHASE SKILLS
                // TO USER PROFILE
                // =====================================

                const profile =
                    await this.profileModel.findOne({
                        userId,
                    });

                if (!profile) {
                    throw new NotFoundException(
                        'Profile not found.',
                    );
                }

                const phaseSkills =
                    roadmapPhase.skills || [];

                profile.skills = [
                    ...new Set([
                        ...(profile.skills || []),
                        ...phaseSkills,
                    ]),
                ];

                await profile.save();

                await career.save();

                // =====================================
                // CALCULATE PROGRESS
                // =====================================

                const {
                    totalPhases,
                    completedPhases,
                    progressPercentage,
                    roadmapCompleted,
                } = this.calculateRoadmapProgress(career);
                return {
                    message:
                        roadmapCompleted
                            ? 'Evidence verified. Congratulations! You have completed the roadmap! 🎉'
                            : 'Evidence verified successfully. The next roadmap phase is now unlocked.',

                    phaseIndex,

                    verificationStatus:
                        'verified',

                    completed: true,

                    verificationResult,

                    completedPhases,

                    totalPhases,

                    progressPercentage,

                    roadmapCompleted,

                    updatedSkills:
                        profile.skills,

                    achievementsUnlocked: newlyUnlocked,
                };
            }

            // =====================================
            // REJECTED
            // =====================================

            career.roadmapProgress[
                progressIndex
            ] = {
                phaseIndex,

                taskIndex,

                taskTitle: resolvedTaskTitle,

                completed: false,

                completedAt: null,

                verificationStatus:
                    'rejected',

                evidenceType,

                evidenceFileName,

                evidenceFilePath,

                verificationResult: {
                    confidence:
                        verificationResult.confidence,

                    learnerName:
                        verificationResult.learnerName,

                    courseName:
                        verificationResult.courseName,

                    platform:
                        verificationResult.platform,

                    completionStatus:
                        verificationResult.completionStatus,

                    relevantSkills:
                        verificationResult.relevantSkills,

                    reason:
                        verificationResult.reason,
                },
            };

            await career.save();

            return {
                message:
                    'The submitted evidence could not be verified. Please submit better evidence.',

                phaseIndex,

                verificationStatus:
                    'rejected',

                completed: false,

                verificationResult,
            };

        } catch (error: any) {

            console.error(
                'Roadmap Evidence Verification Error:',
                error,
            );

            // Keep evidence pending if Gemini itself failed.
            const progressIndex =
            career.roadmapProgress.findIndex(
                (item) =>
                    item.phaseIndex === phaseIndex &&
                    (item.taskIndex ?? null) === taskIndex,
                );

            if (progressIndex >= 0) {

                career.roadmapProgress[
                    progressIndex
                ] = {
                    phaseIndex,

                    taskIndex,

                    taskTitle: resolvedTaskTitle,

                    completed: false,

                    completedAt: null,

                    verificationStatus:
                        'pending',

                    evidenceType,

                    evidenceFileName,

                    evidenceFilePath,

                    verificationResult: {
                        reason:
                            'Evidence was uploaded, but automatic verification could not be completed. Please try again.',
                    },
                };

                await career.save();
            }

            throw new InternalServerErrorException(
                'Evidence was uploaded, but verification could not be completed. Please try again.',
            );
        }
    }


    // =====================================
    // VERIFY ROADMAP EVIDENCE WITH GEMINI
    // =====================================

    private async verifyRoadmapEvidence(
        userId: string,
        roadmapPhase: any,
        task: any,
        evidenceType:
            | 'certificate'
            | 'screenshot'
            | 'github',
        evidenceFileName: string,
        evidenceFile: Express.Multer.File,
    ) {
        // =====================================
        // GET USER PROFILE
        // =====================================

        const profile =
            await this.profileModel.findOne({
                userId,
            });

        if (!profile) {
            throw new NotFoundException(
                'Profile not found.',
            );
        }

        // =====================================
        // DETERMINE MIME TYPE
        // =====================================

        const extension =
            path.extname(
                evidenceFileName,
            ).toLowerCase();

        let mimeType = '';

        if (evidenceType === 'github') {
            mimeType = 'text/plain';
        } else if (extension === '.pdf') {
            mimeType =
                'application/pdf';
        } else if (
            extension === '.jpg' ||
            extension === '.jpeg'
        ) {
            mimeType =
                'image/jpeg';
        } else if (
            extension === '.png'
        ) {
            mimeType =
                'image/png';
        } else {
            throw new BadRequestException(
                'Unsupported evidence file type.',
            );
        }

        // =====================================
        // UPLOAD FILE TO GEMINI
        // =====================================

        const evidenceBytes =
            evidenceFile.buffer.buffer.slice(
                evidenceFile.buffer.byteOffset,
                evidenceFile.buffer.byteOffset +
                    evidenceFile.buffer.byteLength,
            ) as ArrayBuffer;

        const evidenceBlob = new Blob(
            [evidenceBytes],
            { type: mimeType },
        );

        const uploadedFile =
            await this.gemini.files.upload({
                file: evidenceBlob,
                config: {
                    mimeType,
                },
            });

        if (
            !uploadedFile.uri ||
            !uploadedFile.mimeType
        ) {
            throw new Error(
                'Gemini file upload failed.',
            );
        }

        // =====================================
        // CREATE VERIFICATION PROMPT
        // =====================================

        const prompt = `

    You are an evidence verification system
    for a learning roadmap.

    Your job is to determine whether the submitted
    evidence provides reasonable evidence that the
    learner completed the specific roadmap task.

    The roadmap phase is provided as context, but
    the verification decision must be based primarily
    on the specific task being submitted.

    IMPORTANT:

    You are NOT determining whether the document is
    legally authentic.

    You are only determining whether the visible
    information provides sufficient evidence of
    completion.

    The evidence may be a certificate, screenshot,
    or public GitHub repository summary.

    For GitHub evidence, evaluate the repository
    content, README, source code, and project structure
    against the specific task requirements.

    =================================
    LEARNER INFORMATION
    =================================

    Learner name:
    ${profile.bio || 'Not provided'}

    =================================
    ROADMAP PHASE
    =================================

    Phase:
    ${roadmapPhase.phase || 'Not provided'}

    Required skills:
    ${JSON.stringify(
        roadmapPhase.skills || [],
        null,
        2,
    )}

    Phase description:
    ${roadmapPhase.description || 'Not provided'}

    Learning tasks:
    ${JSON.stringify(
        roadmapPhase.tasks || [],
        null,
        2,
    )}

    =================================
    SPECIFIC TASK BEING VERIFIED
    =================================

    Task title:
    ${task.title || 'Not provided'}

    Task type:
    ${task.type || 'Not provided'}

    Task details:
    ${JSON.stringify(task, null, 2)}

    The evidence must provide reasonable support that
    this specific task was completed.

    Do not consider the entire roadmap phase completed
    just because the evidence is related to the phase.

    =================================
    EVIDENCE INFORMATION
    =================================

    Evidence type:
    ${evidenceType}

    File name:
    ${evidenceFileName}

    =================================
    VERIFICATION RULES
    =================================

    Analyze the uploaded evidence carefully.

    Check:

    1. Does the submitted evidence appear related to
    learning, course completion, or the requested project/practice work?

    2. Does it indicate that the learner completed
    or implemented something relevant?

    3. Is there a learner name visible?

    4. Is there a course/program name visible?

    5. Is there a platform/provider visible?

    6. Does the evidence reasonably relate to the
    specific roadmap task?

    7. Does the evidence demonstrate the skills,
    activity, project, or learning outcome expected
    by the specific task?

    8. Is there enough information to support completion
    of this specific task?

    9. If the evidence is clearly unrelated to the
    specific task, reject it.

    10. If the evidence does not indicate completion
        of the specific task, reject it.

    11. Do not reject simply because the certificate
        does not contain every required skill.

    12. Do not claim that the certificate is
        cryptographically or legally authentic.

    =================================
    VERIFICATION DECISION
    =================================

    Set "verified" to true only when the evidence
    provides reasonable evidence that the specific
    roadmap task was completed.

    Do not mark the task as verified merely because
    the evidence is related to the roadmap phase.

    Otherwise set "verified" to false.

    Confidence must be between 0 and 1.

    =================================
    RETURN ONLY JSON
    =================================

    {
        "verified": false,
        "confidence": 0,
        "learnerName": "",
        "courseName": "",
        "platform": "",
        "completionStatus": "",
        "relevantSkills": [],
        "reason": ""
    }

    `;

        // =====================================
        // CALL GEMINI WITH MODEL FALLBACK
        // =====================================

        let response: any = null;
        let lastError: any = null;

        const models: string[] = [
            'gemini-3.5-flash-lite',
            'gemini-3.8-flash',
            'gemini-3.7-flash',
            'gemini-3.6-flash',
        ];

        const maxRetriesPerModel = 2;

        for (const model of models) {

            console.log(
                `Trying Gemini evidence verification model: ${model}`,
            );

            for (
                let attempt = 1;
                attempt <= maxRetriesPerModel;
                attempt++
            ) {
                try {

                    response =
                        await this.gemini.models.generateContent({

                            model,

                            contents: [
                                {
                                    text: prompt,
                                },
                                {
                                    fileData: {
                                        fileUri:
                                            uploadedFile.uri,

                                        mimeType:
                                            uploadedFile.mimeType,
                                    },
                                },
                            ],

                            config: {
                                responseMimeType:
                                    'application/json',
                            },
                        });

                    console.log(
                        `Roadmap evidence verification succeeded using model: ${model}`,
                    );

                    break;

                } catch (error: any) {

                    lastError = error;

                    const status =
                        error?.status ||
                        error?.code ||
                        error?.error?.code;

                    console.error(
                        `Gemini evidence verification ${model} attempt ${attempt} failed:`,
                        error?.message,
                    );

                    // Only retry/fallback for temporary
                    // service/rate-limit errors.
                    if (
                        status !== 503 &&
                        status !== 429 &&
                        status !== 500 &&
                        status !== 408 &&
                        status !== 504
                    ) {
                        throw error;
                    }

                    if (
                        attempt < maxRetriesPerModel
                    ) {

                        // Exponential backoff:
                        // attempt 1 -> 2 seconds
                        // attempt 2 -> 4 seconds
                        const delay =
                            2000 *
                            Math.pow(
                                2,
                                attempt - 1,
                            );

                        console.log(
                            `Retrying ${model} in ${
                                delay / 1000
                            } seconds...`,
                        );

                        await new Promise(
                            (resolve) =>
                                setTimeout(
                                    resolve,
                                    delay,
                                ),
                        );
                    }
                }
            }

            // Stop if Gemini succeeded.
            if (response) {
                break;
            }

            console.log(
                `${model} unavailable. Trying next Gemini model...`,
            );
        }

        // =====================================
        // ALL MODELS FAILED
        // =====================================

        if (!response) {
            throw (
                lastError ||
                new Error(
                    'All Gemini models failed during evidence verification.',
                )
            );
        }

        // =====================================
        // GET RESPONSE
        // =====================================

        const responseText =
            response.text;

        if (!responseText) {
            throw new Error(
                'Gemini returned an empty verification response.',
            );
        }

        // =====================================
        // PARSE JSON
        // =====================================

        let result: any;

        try {

            result =
                JSON.parse(
                    responseText,
                );

        } catch {

            throw new Error(
                'Gemini returned invalid verification JSON.',
            );
        }

        // =====================================
        // VALIDATE RESPONSE
        // =====================================

        if (
            typeof result.verified !==
            'boolean'
        ) {
            throw new Error(
                'Invalid verification result from Gemini.',
            );
        }

        if (
            typeof result.confidence !==
            'number'
        ) {
            result.confidence = 0;
        }

        return {
            verified:
                result.verified,

            confidence:
                Math.max(
                    0,
                    Math.min(
                        1,
                        result.confidence,
                    ),
                ),

            learnerName:
                result.learnerName ||
                '',

            courseName:
                result.courseName ||
                '',

            platform:
                result.platform ||
                '',

            completionStatus:
                result.completionStatus ||
                '',

            relevantSkills:
                Array.isArray(
                    result.relevantSkills,
                )
                    ? result.relevantSkills
                    : [],

            reason:
                result.reason ||
                '',
        };
    }


    // =====================================
    // UPDATE ROADMAP PHASE PROGRESS
    // =====================================

    async updateRoadmapProgress(
        userId: string,
        phaseIndex: number,
        completed: boolean,
    ) {
        if (completed) {
            throw new BadRequestException(
                'Roadmap phases can only be completed after evidence verification.',
            );
        }

        const career =
            await this.careerModel.findOne({
                userId,
            });

        if (!career) {
            throw new NotFoundException(
                'Career data not found.',
            );
        }

        if (!career.selectedRoadmap) {
            throw new NotFoundException(
                'No roadmap selected.',
            );
        }

        const totalPhases =
            career.selectedRoadmap.roadmap?.length || 0;

        if (
            phaseIndex < 0 ||
            phaseIndex >= totalPhases
        ) {
            throw new BadRequestException(
                'Invalid roadmap phase.',
            );
        }

        const existingProgress =
            career.roadmapProgress.find(
                (item) =>
                    item.phaseIndex === phaseIndex,
            );

        if (existingProgress?.completed) {
            throw new BadRequestException(
                'Completed phases cannot be unchecked.',
            );
        }

        return {
            message:
                'No roadmap progress update was required.',
            roadmapProgress:
                career.roadmapProgress,
        };
    }


    // =====================================
    // GET LATEST CAREER RECOMMENDATIONS
    // =====================================

    async getLatestRecommendation(
        userId: string,
    ) {

        const career =
            await this.careerModel.findOne({
                userId,
            });


        if (!career) {

            throw new NotFoundException(
                'No career recommendations found.',
            );

        }


        return {

            recommendations:
                career.recommendations,

            generatedAt:
                career.updatedAt,

        };

    }

}
