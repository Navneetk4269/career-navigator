import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
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


@Injectable()
export class CareersService {

    private readonly gemini: GoogleGenAI;


    constructor(

        @InjectModel(Career.name)
        private readonly careerModel: Model<CareerDocument>,

        @InjectModel(Profile.name)
        private readonly profileModel: Model<ProfileDocument>,

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

          "tasks": []
        }

      ]

    }

  ]
}

`;



            // =====================================
            // STEP 5: CALL GEMINI WITH RETRY
            // =====================================

            let response: any;

            const maxRetries = 3;


            for (
                let attempt = 1;
                attempt <= maxRetries;
                attempt++
            ) {

                try {

                    response =
                        await this.gemini.models.generateContent({

                            model: 'gemini-3.6-flash',

                            contents: prompt,

                            config: {
                                responseMimeType:
                                    'application/json',
                            },

                        });


                    // SUCCESS
                    break;

                } catch (error: any) {

                    console.error(
                        `Gemini Career attempt ${attempt} failed:`,
                        error?.message,
                    );


                    if (attempt === maxRetries) {
                        throw error;
                    }


                    const delay =
                        attempt * 2000;


                    console.log(
                        `Retrying Gemini in ${delay / 1000
                        } seconds...`,
                    );


                    await new Promise(
                        (resolve) =>
                            setTimeout(resolve, delay),
                    );

                }

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

            const result =
                JSON.parse(responseText);


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


    // =====================================
    // GET USER'S SELECTED ROADMAP
    // =====================================

    async getMyRoadmap(userId: string) {

        const career = await this.careerModel.findOne({
            userId,
        });


        // User has no career data
        if (!career) {

            return {
                message: 'No roadmap selected yet.',

                selectedRoadmap: null,

                selectedAt: null,

                roadmapProgress: [],

                totalPhases: 0,

                completedPhases: 0,

                progressPercentage: 0,
            };

        }


        // User has career data but has not selected a roadmap
        if (!career.selectedRoadmap) {

            return {
                message: 'No roadmap selected yet.',

                selectedRoadmap: null,

                selectedAt: null,

                roadmapProgress: [],

                totalPhases: 0,

                completedPhases: 0,

                progressPercentage: 0,
            };

        }


        // =====================================
        // ROADMAP EXISTS → CALCULATE PROGRESS
        // =====================================

        const totalPhases =
            career.selectedRoadmap.roadmap?.length || 0;


        const completedPhases =
            (career.roadmapProgress || []).filter(
                (item) => item.completed,
            ).length;


        const progressPercentage =
            totalPhases > 0
                ? Math.round(
                    (completedPhases / totalPhases) * 100,
                )
                : 0;

        const roadmapCompleted =
            totalPhases > 0 &&
            completedPhases === totalPhases;


        // =====================================
        // RETURN SELECTED ROADMAP + PROGRESS
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


        // Get total roadmap phases
        const totalPhases =
            career.selectedRoadmap.roadmap?.length || 0;


        // Validate phase index
        if (
            phaseIndex < 0 ||
            phaseIndex >= totalPhases
        ) {

            throw new NotFoundException(
                'Invalid roadmap phase.',
            );

        }


        // Find existing progress for this phase
        const existingProgressIndex =
            career.roadmapProgress.findIndex(
                (item) =>
                    item.phaseIndex === phaseIndex,
            );


        const progressData = {
            phaseIndex,

            completed,

            completedAt:
                completed
                    ? new Date()
                    : null,
        };


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


        // Calculate completed phases
        const completedPhases =
            career.roadmapProgress.filter(
                (item) => item.completed,
            ).length;


        // Calculate percentage
        const progressPercentage =
            totalPhases > 0
                ? Math.round(
                    (completedPhases / totalPhases) * 100,
                )
                : 0;

        const roadmapCompleted =
            totalPhases > 0 &&
            completedPhases === totalPhases;

        return {

            message:
                roadmapCompleted
                    ? `Congratulations! You have completed the ${career.selectedRoadmap.career} roadmap! 🎉`
                    : 'Roadmap progress updated successfully.',

            roadmapProgress:
                career.roadmapProgress,

            totalPhases,

            completedPhases,

            progressPercentage,

            roadmapCompleted,

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