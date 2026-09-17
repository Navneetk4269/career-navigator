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

import * as path from 'path';


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
    // INITIALIZE + VERIFY PHASE EVIDENCE
    // =====================================

    async initializePhaseVerification(
        userId: string,
        phaseIndex: number,
        evidenceType: 'certificate' | 'screenshot',
        evidenceFileName: string,
        evidenceFilePath: string,
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
                    item.phaseIndex === phaseIndex,
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

        // =====================================
        // SAVE EVIDENCE AS PENDING
        // =====================================

        const progressData = {
            phaseIndex,

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
                    item.phaseIndex === phaseIndex,
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

        // =====================================
        // VERIFY WITH GEMINI
        // =====================================

        try {

            const verificationResult =
                await this.verifyRoadmapEvidence(
                    userId,
                    roadmapPhase,
                    evidenceType,
                    evidenceFileName,
                    evidenceFilePath,
                );

            // =====================================
            // FIND PROGRESS AGAIN
            // =====================================

            const progressIndex =
                career.roadmapProgress.findIndex(
                    (item) =>
                        item.phaseIndex === phaseIndex,
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

                const completedPhases =
                    career.roadmapProgress.filter(
                        (item) =>
                            item.completed,
                    ).length;

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
                    completedPhases ===
                    totalPhases;

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
                };
            }

            // =====================================
            // REJECTED
            // =====================================

            career.roadmapProgress[
                progressIndex
            ] = {
                phaseIndex,

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
                        item.phaseIndex === phaseIndex,
                );

            if (progressIndex >= 0) {

                career.roadmapProgress[
                    progressIndex
                ] = {
                    phaseIndex,

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
        evidenceType:
            | 'certificate'
            | 'screenshot',
        evidenceFileName: string,
        evidenceFilePath: string,
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
        // CHECK FILE
        // =====================================

        const absoluteFilePath =
            path.resolve(evidenceFilePath);

        // =====================================
        // DETERMINE MIME TYPE
        // =====================================

        const extension =
            path.extname(
                evidenceFileName,
            ).toLowerCase();

        let mimeType = '';

        if (extension === '.pdf') {
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

        const uploadedFile =
            await this.gemini.files.upload({
                file: absoluteFilePath,
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

Your job is to determine whether the uploaded
certificate or screenshot provides reasonable
evidence that the learner completed the requested
roadmap phase.

IMPORTANT:

You are NOT determining whether the document is
legally authentic.

You are only determining whether the visible
information provides sufficient evidence of
completion.

The evidence may be a certificate or screenshot.

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

1. Does the document/screenshot appear to be
   related to learning or course completion?

2. Does it indicate that the learner completed
   or passed something?

3. Is there a learner name visible?

4. Is there a course/program name visible?

5. Is there a platform/provider visible?

6. Does the course or evidence reasonably relate
   to the roadmap phase?

7. Are the required skills reasonably related
   to the evidence?

8. Is there enough visible information to support
   completion?

9. If the evidence is clearly unrelated, reject it.

10. If the evidence does not indicate completion,
    reject it.

11. Do not reject simply because the certificate
    does not contain every required skill.

12. Do not claim that the certificate is
    cryptographically or legally authentic.

=================================
VERIFICATION DECISION
=================================

Set "verified" to true only when the evidence
provides reasonable evidence of completion of
the roadmap phase.

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
        // CALL GEMINI
        // =====================================

        const response =
            await this.gemini.models.generateContent({
                model: 'gemini-3.6-flash',

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