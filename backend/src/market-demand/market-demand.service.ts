import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { GoogleGenAI } from '@google/genai';

import {
    MarketDemand,
    MarketDemandDocument,
} from './schemas/market-demand.schema';

import {
    Profile,
    ProfileDocument,
} from '../profiles/schemas/profile.schema';

import {
    Career,
    CareerDocument,
} from '../careers/schemas/career.schema';

@Injectable()
export class MarketDemandService {

    private readonly ai: GoogleGenAI;

    constructor(

        @InjectModel(MarketDemand.name)
        private readonly marketDemandModel:
            Model<MarketDemandDocument>,

        @InjectModel(Profile.name)
        private readonly profileModel:
            Model<ProfileDocument>,

        @InjectModel(Career.name)
        private readonly careerModel:
            Model<CareerDocument>,

    ) {

        this.ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

    }


    // ==================================================
    // GENERATE MARKET DEMAND
    // ==================================================

    async generateMarketDemand(
        userId: string,
    ) {

        const profile =
            await this.profileModel.findOne({
                userId,
            });

        if (!profile) {

            throw new NotFoundException(
                'Profile not found.',
            );

        }


        // ==============================================
        // GET CAREER EXPLORER ANALYSIS
        // ==============================================

        const careerAnalysis =
            await this.careerModel.findOne({
                userId,
            });

        const recommendations =
            careerAnalysis?.recommendations || [];


        const skills =
            profile.skills || [];

        const interests =
            profile.interests || [];

        const education =
            profile.education || '';

        const jobDescription =
            profile.jobDescription || '';


        // ==================================================
        // GEMINI PROMPT
        // ==================================================

        const prompt = `

You are the AI Market Demand Analysis system
for a career navigation application.

Your job is to analyze technology career demand
and provide useful career-market information
for a student.

USER PROFILE

Education:
${education}

Current Skills:
${skills.join(', ')}

Interests:
${interests.join(', ')}

Job Description:
${jobDescription}


IMPORTANT REQUIREMENTS

1. Generate AT LEAST 5 careers.

2. Generate between 5 and 8 careers.

3. Rank the careers according to their estimated
   current technology-market demand.

4. Each career must have:

   - rank
   - career
   - demandScore
   - growthPercentage
   - trend
   - description
   - averageSalary
   - salaryRange
   - whyInDemand
   - requiredSkills
   - changingMarket
   - commonJobTitles
   - userSkillMatch
   - roadmap
   - aiInsight

5. demandScore must be between 0 and 100.

6. growthPercentage should represent an
   AI-estimated market growth indicator.

7. trend must be one of:

   "Rapidly Growing"
   "Growing"
   "Stable"
   "Declining"

8. Provide estimated average salary and salary range.

9. Salary figures must be treated as estimates.
   Do not claim that they are guaranteed salaries.

10. Explain why each career is currently in demand.

11. Provide 5 to 10 important skills for each career.

12. Explain how the market is changing.

13. Include technologies and skills that are
    becoming more important.

14. Provide common job titles related to the career.

15. Compare the required skills with the user's
    current skills.

16. Put skills the user already has into:

    matchedSkills

17. Put skills the user does not have into:

    missingSkills

18. Calculate:

    matchPercentage

    based on matched required skills.

19. The roadmap MUST be personalized.

20. The roadmap must focus primarily on
    the user's missing skills.

21. Do NOT waste roadmap phases teaching
    skills the user already has.

22. Generate 3 to 5 roadmap phases.

23. Each roadmap phase must contain:

    phase
    skills
    description
    estimatedDuration
    weeklyHours
    tasks

24. Every roadmap task MUST be an object.

    Each task object MUST contain:

    title
    type
    resourceUrl

    The type MUST be exactly one of:

    "certificate"
    "project"
    "practice"

    Use:

    "certificate"
    for courses, certifications, or structured learning
    programs.

    Use:

    "project"
    for portfolio projects or substantial applications.

    Use:

    "practice"
    for hands-on exercises, coding practice, small
    implementations, or technical exercises.

    resourceUrl MUST be:

    - A verified resource URL when one is available.
    - null when no verified resource URL is available.

    Do NOT return tasks as plain strings.

    INCORRECT:

    "Learn Figma basics"

    CORRECT:

    {
        "title": "Learn Figma basics",
        "type": "practice",
        "resourceUrl": null
    }

    INCORRECT:

    "Build a responsive website"

    CORRECT:

    {
        "title": "Build a responsive website",
        "type": "project",
        "resourceUrl": null
    }

    INCORRECT:

    "Complete a TypeScript course"

    CORRECT:

    {
        "title": "Complete a TypeScript course",
        "type": "certificate",
        "resourceUrl": null
    }

25. Roadmap skills should come from
    missingSkills whenever possible.

26. Provide an AI career insight personalized
    to the user's current profile.

27. Do not generate duplicate careers.

28. Return ONLY valid JSON.

29. Do not return markdown.

30. Do not use code fences.

31. Do not include any explanation outside JSON.


RETURN EXACTLY THIS STRUCTURE:

{
  "careers": [
    {
      "rank": 1,
      "career": "Backend Developer",
      "demandScore": 92,
      "growthPercentage": 7,
      "trend": "Growing",
      "description": "Short career description.",
      "averageSalary": "₹8.5 LPA",
      "salaryRange": "₹4 LPA - ₹20+ LPA",
      "whyInDemand": [
        "Reason 1",
        "Reason 2",
        "Reason 3"
      ],
      "requiredSkills": [
        "Node.js",
        "NestJS",
        "MongoDB",
        "PostgreSQL",
        "Docker"
      ],
      "changingMarket": [
        {
          "technology": "Cloud Computing",
          "trend": "Growing",
          "reason": "Short explanation."
        }
      ],
      "commonJobTitles": [
        "Backend Developer",
        "Node.js Developer",
        "Software Engineer"
      ],
      "userSkillMatch": {
        "matchedSkills": [
          "Node.js",
          "MongoDB"
        ],
        "missingSkills": [
          "NestJS",
          "PostgreSQL",
          "Docker"
        ],
        "matchPercentage": 40
      },
      "roadmap": [
        {
          "phase": "Phase 1 - NestJS",
          "skills": [
            "NestJS"
          ],
          "description": "Learn NestJS fundamentals.",
          "estimatedDuration": "3 weeks",
          "weeklyHours": 10,
          "tasks": [
            {
              "title": "Learn NestJS modules and dependency injection",
              "type": "practice",
              "resourceUrl": null
            },
            {
              "title": "Learn NestJS controllers and routing",
              "type": "practice",
              "resourceUrl": null
            },
            {
              "title": "Build a REST API using NestJS",
              "type": "project",
              "resourceUrl": null
            }
          ]
        }
      ],
      "aiInsight": "Personalized career insight."
    }
  ]
}

`;


        try {

            // =====================================
            // CALL GEMINI WITH MODEL FALLBACK
            // =====================================

            let response: any = null;

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
                            await this.ai.models.generateContent({

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
                            error?.error?.code;

                        console.error(
                            `Gemini ${model} attempt ${attempt} failed:`,
                            error?.message,
                        );

                        // Only retry/fallback for temporary
                        // service availability or rate-limit errors.

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

                // Gemini succeeded.
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
            // PARSE GEMINI RESPONSE
            // =====================================

            const responseText =
                response.text;


            if (!responseText) {

                throw new Error(
                    'Gemini returned an empty response.',
                );

            }


            const parsed =
                JSON.parse(responseText);


            if (
                !parsed.careers ||
                !Array.isArray(parsed.careers)
            ) {

                throw new Error(
                    'Invalid market demand response.',
                );

            }


            if (parsed.careers.length < 5) {

                throw new Error(
                    'Market analysis must contain at least 5 careers.',
                );

            }


            // ==============================================
            // NORMALIZE CAREER NAMES
            // ==============================================

            const normalizeCareerName = (name: string) =>
                name
                    ?.toLowerCase()
                    .replace(/[^a-z0-9]/g, '') || '';

            const careerAliases: Record<string, string> = {
                // Frontend
                frontenddeveloper: 'frontenddeveloper',
                frontendengineer: 'frontenddeveloper',
                reactdeveloper: 'frontenddeveloper',
                reactjsdeveloper: 'frontenddeveloper',
                uideveloper: 'frontenddeveloper',
                webdeveloper: 'frontenddeveloper',
                frontendwebdeveloper: 'frontenddeveloper',

                // Backend
                backenddeveloper: 'backenddeveloper',
                backendengineer: 'backenddeveloper',
                nodejsdeveloper: 'backenddeveloper',
                nodejsengineer: 'backenddeveloper',
                nestjsdeveloper: 'backenddeveloper',

                // Full Stack
                fullstackdeveloper: 'fullstackdeveloper',
                fullstackengineer: 'fullstackdeveloper',
                fullstackwebdeveloper: 'fullstackdeveloper',

                // Data
                dataanalyst: 'dataanalyst',
                businessanalyst: 'dataanalyst',

                // Machine Learning / AI
                machinelearningengineer: 'machinelearningengineer',
                mlengineer: 'machinelearningengineer',
                aimlengineer: 'machinelearningengineer',
                aiengineer: 'machinelearningengineer',

                // Cybersecurity
                cybersecurityanalyst: 'cybersecurityanalyst',
                securityanalyst: 'cybersecurityanalyst',
                cybersecurityengineer: 'cybersecurityengineer',

                // DevOps / Cloud
                devopsengineer: 'devopsengineer',
                devopsdeveloper: 'devopsengineer',
                cloudengineer: 'cloudengineer',
            };

            const getCanonicalCareer = (name: string) => {
                const normalized = normalizeCareerName(name);

                return careerAliases[normalized] || normalized;
            };


            // ==============================================
            // NORMALIZE ROADMAP TASKS
            // ==============================================
            //
            // Gemini may sometimes return:
            //
            // "Learn TypeScript"
            //
            // instead of:
            //
            // {
            //     title: "Learn TypeScript",
            //     type: "practice",
            //     resourceUrl: null
            // }
            //
            // This function guarantees that MongoDB
            // always receives task objects.
            // ==============================================

            type RoadmapTask = {
                title: string;
                type: 'certificate' | 'project' | 'practice';
                resourceUrl: string | null;
            };

            const normalizeRoadmapTasks = (
                tasks: any[],
            ): RoadmapTask[] => {

                if (!Array.isArray(tasks)) {
                    return [];
                }

                return tasks
                    .map((task: any): RoadmapTask | null => {

                        // Gemini returned a plain string
                        if (typeof task === 'string') {
                            return {
                                title: task,
                                type: 'practice',
                                resourceUrl: null,
                            };
                        }

                        // Invalid task
                        if (
                            !task ||
                            typeof task !== 'object'
                        ) {
                            return null;
                        }

                        const validType:
                            'certificate' | 'project' | 'practice' =
                            task.type === 'certificate' ||
                            task.type === 'project' ||
                            task.type === 'practice'
                                ? task.type
                                : 'practice';

                        return {
                            title:
                                typeof task.title === 'string'
                                    ? task.title
                                    : '',

                            type: validType,

                            resourceUrl:
                                typeof task.resourceUrl === 'string' &&
                                task.resourceUrl.trim() !== ''
                                    ? task.resourceUrl
                                    : null,
                        };
                    })
                    .filter(
                        (task): task is RoadmapTask =>
                            task !== null &&
                            task.title.trim() !== '',
                    );
            };

            // ==============================================
            // NORMALIZE ENTIRE ROADMAP
            // ==============================================

            const normalizeRoadmap = (
                roadmap: any[],
            ) => {

                if (!Array.isArray(roadmap)) {
                    return [];
                }

                return roadmap.map(
                    (phase: any) => ({

                        phase:
                            phase?.phase || '',

                        skills:
                            Array.isArray(phase?.skills)
                                ? phase.skills
                                : [],

                        description:
                            phase?.description || '',

                        estimatedDuration:
                            phase?.estimatedDuration || '',

                        weeklyHours:
                            Number(
                                phase?.weeklyHours || 0,
                            ),

                        tasks:
                            normalizeRoadmapTasks(
                                phase?.tasks || [],
                            ),

                    }),
                );

            };


            // ==============================================
            // BUILD FINAL CAREERS
            // ==============================================

            const uniqueCareers: any[] = [];

            const seenCanonicalCareers = new Set<string>();

            for (const career of parsed.careers) {
                const canonicalCareer =
                    getCanonicalCareer(career.career);

                if (seenCanonicalCareers.has(canonicalCareer)) {
                    continue;
                }

                seenCanonicalCareers.add(canonicalCareer);

                uniqueCareers.push(career);

                if (uniqueCareers.length >= 8) {
                    break;
                }
            }

            const careers =
                uniqueCareers.map(
                        (
                            career: any,
                            index: number,
                        ) => {

                            // =================================
                            // FIND CAREER EXPLORER MATCH
                            // =================================

                            const recommendation =
                                recommendations.find(
                                    (item: any) =>
                                        getCanonicalCareer(item.career) ===
                                        getCanonicalCareer(career.career),
                                );


                            // =================================
                            // GET CAREER EXPLORER ROADMAP
                            // =================================

                            const recommendationRoadmap =
                                recommendation?.roadmap?.length
                                    ? recommendation.roadmap
                                    : [];


                            // =================================
                            // GET GEMINI ROADMAP FALLBACK
                            // =================================

                            const fallbackRoadmap =
                                career?.roadmap?.length
                                    ? career.roadmap
                                    : [];


                            // =================================
                            // FINAL ROADMAP
                            // =================================
                            //
                            // Career Explorer roadmap has
                            // priority because it is already
                            // personalized for the user.
                            //
                            // Gemini roadmap is only used
                            // when Career Explorer has no
                            // roadmap for this career.
                            // =================================

                            const finalRoadmap =
                                recommendationRoadmap.length
                                    ? recommendationRoadmap
                                    : fallbackRoadmap;


                            return {

                                // =================================
                                // BASIC MARKET DATA
                                // =================================

                                rank:
                                    index + 1,

                                career:
                                    career.career,

                                demandScore:
                                    Number(
                                        career.demandScore,
                                    ),

                                growthPercentage:
                                    Number(
                                        career.growthPercentage,
                                    ),

                                trend:
                                    career.trend,

                                description:
                                    career.description ||
                                    '',

                                averageSalary:
                                    career.averageSalary ||
                                    'Not available',

                                salaryRange:
                                    career.salaryRange ||
                                    'Not available',

                                whyInDemand:
                                    career.whyInDemand ||
                                    [],

                                requiredSkills:
                                    career.requiredSkills ||
                                    [],

                                changingMarket:
                                    career.changingMarket ||
                                    [],

                                commonJobTitles:
                                    career.commonJobTitles ||
                                    [],


                                // =================================
                                // USE CAREER EXPLORER MATCH
                                // =================================
                                //
                                // This guarantees that the same
                                // career has the same match score
                                // as Career Explorer.
                                // =================================

                                userSkillMatch:
                                    recommendation
                                        ? {

                                            matchedSkills:
                                                recommendation.strengthsUsed ||
                                                [],

                                            missingSkills:
                                                (
                                                    recommendation.missingSkills ||
                                                    []
                                                ).map(
                                                    (item: any) =>
                                                        typeof item === 'string'
                                                            ? item
                                                            : item?.skill,
                                                ),

                                            matchPercentage:
                                                Number(
                                                    recommendation.matchScore ||
                                                    0,
                                                ),

                                        }
                                        : (
                                            career.userSkillMatch ||
                                            {
                                                matchedSkills: [],
                                                missingSkills: [],
                                                matchPercentage: 0,
                                            }
                                        ),


                                // =================================
                                // USE CAREER EXPLORER ROADMAP
                                // =================================
                                //
                                // Normalize the roadmap before
                                // sending it to Mongoose.
                                // =================================

                                roadmap:
                                    normalizeRoadmap(
                                        finalRoadmap,
                                    ),


                                // =================================
                                // AI INSIGHT
                                // =================================

                                aiInsight:
                                    career.aiInsight ||
                                    '',

                            };

                        },
                    );


            // ==============================================
            // SAVE MARKET DEMAND
            // ==============================================

            const saved =
                await this.marketDemandModel.create({

                    userId,

                    generatedAt:
                        new Date(),

                    careers,

                });


            // ==============================================
            // RETURN RESULT
            // ==============================================

            return {

                message:
                    'Market demand analysis generated successfully.',

                marketDemand:
                    saved,

            };

        } catch (error) {

            console.error(
                'Market demand generation error:',
                error,
            );

            throw new InternalServerErrorException(
                'Failed to generate market demand analysis.',
            );

        }

    }


    // ==================================================
    // GET LATEST MARKET DEMAND
    // ==================================================

    async getLatestMarketDemand(
        userId: string,
    ) {

        const marketDemand =
            await this.marketDemandModel
                .findOne({
                    userId,
                })
                .sort({
                    createdAt: -1,
                });


        if (!marketDemand) {

            throw new NotFoundException(
                'Market demand analysis not found.',
            );

        }


        return {

            message:
                'Latest market demand retrieved successfully.',

            marketDemand,

        };

    }


    // ==================================================
    // GET INDIVIDUAL CAREER DETAILS
    // ==================================================

    async getCareerDetails(
        userId: string,
        careerName: string,
    ) {

        const marketDemand =
            await this.marketDemandModel
                .findOne({
                    userId,
                })
                .sort({
                    createdAt: -1,
                });


        if (!marketDemand) {

            throw new NotFoundException(
                'Market demand analysis not found.',
            );

        }


        const normalizeCareerName = (name: string) =>
            name
                ?.toLowerCase()
                .replace(/[^a-z0-9]/g, '') || '';

        const careerAliases: Record<string, string> = {
            frontenddeveloper: 'frontenddeveloper',
            frontendengineer: 'frontenddeveloper',
            reactdeveloper: 'frontenddeveloper',
            reactjsdeveloper: 'frontenddeveloper',
            uideveloper: 'frontenddeveloper',
            webdeveloper: 'frontenddeveloper',
            frontendwebdeveloper: 'frontenddeveloper',

            backenddeveloper: 'backenddeveloper',
            backendengineer: 'backenddeveloper',
            nodejsdeveloper: 'backenddeveloper',
            nodejsengineer: 'backenddeveloper',
            nestjsdeveloper: 'backenddeveloper',

            fullstackdeveloper: 'fullstackdeveloper',
            fullstackengineer: 'fullstackdeveloper',
            fullstackwebdeveloper: 'fullstackdeveloper',

            dataanalyst: 'dataanalyst',
            businessanalyst: 'dataanalyst',

            machinelearningengineer: 'machinelearningengineer',
            mlengineer: 'machinelearningengineer',
            aimlengineer: 'machinelearningengineer',
            aiengineer: 'machinelearningengineer',

            cybersecurityanalyst: 'cybersecurityanalyst',
            securityanalyst: 'cybersecurityanalyst',
            cybersecurityengineer: 'cybersecurityengineer',

            devopsengineer: 'devopsengineer',
            devopsdeveloper: 'devopsengineer',
            cloudengineer: 'cloudengineer',
        };

        const getCanonicalCareer = (name: string) => {
            const normalized = normalizeCareerName(name);
            return careerAliases[normalized] || normalized;
        };

        const requestedCareer = getCanonicalCareer(careerName);

        const career =
            marketDemand.careers.find(
                (item) =>
                    getCanonicalCareer(item.career) ===
                    requestedCareer,
            );


        if (!career) {

            throw new NotFoundException(
                'Career details not found.',
            );

        }


        return {

            message:
                'Career details retrieved successfully.',

            career,

        };

    }

}