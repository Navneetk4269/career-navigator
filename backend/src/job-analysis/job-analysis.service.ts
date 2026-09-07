import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';

import {
    InjectModel,
} from '@nestjs/mongoose';

import {
    Model,
} from 'mongoose';

import {
    GoogleGenAI,
} from '@google/genai';

import {
    Profile,
    ProfileDocument,
} from '../profiles/schemas/profile.schema';

import {
    JobAnalysis,
    JobAnalysisDocument,
} from './schemas/job-analysis.schema';


@Injectable()
export class JobAnalysisService {

    private readonly gemini: GoogleGenAI;


    constructor(

        @InjectModel(Profile.name)
        private readonly profileModel:
            Model<ProfileDocument>,


        @InjectModel(JobAnalysis.name)
        private readonly jobAnalysisModel:
            Model<JobAnalysisDocument>,

    ) {

        const apiKey =
            process.env.GEMINI_API_KEY;


        if (!apiKey) {

            throw new Error(
                'GEMINI_API_KEY is missing in the .env file.',
            );

        }


        this.gemini =
            new GoogleGenAI({
                apiKey,
            });

    }


    async analyzeJob(userId: string) {

        // ==========================================
        // STEP 1: GET USER PROFILE
        // ==========================================

        const profile =
            await this.profileModel.findOne({
                userId,
            });


        if (!profile) {

            throw new NotFoundException(
                'Profile not found. Please create your profile first.',
            );

        }


        // ==========================================
        // STEP 2: CHECK JOB DESCRIPTION
        // ==========================================

        if (
            !profile.jobDescription ||
            profile.jobDescription.trim() === ''
        ) {

            throw new BadRequestException(
                'Please add a Job Description to your profile first.',
            );

        }


        // ==========================================
        // STEP 3: COMBINE USER SKILLS
        // ==========================================

        const userSkills = [

            ...new Set([

                ...(profile.skills || []),

                ...(profile.programmingLanguages || []),

            ]),

        ];

        const learningHoursPerWeek =
            profile.learningHoursPerWeek || 7;

        const learningHoursPerDay =
            Math.round(
                (learningHoursPerWeek / 7) * 10,
            ) / 10;




        // ==========================================
        // STEP 4: CREATE GEMINI PROMPT
        // ==========================================

        const prompt = `
You are an AI-powered Career Navigator.

Your task is to compare a user's profile
with a target Job Description.

=================================
USER PROFILE
=================================

Skills:
${JSON.stringify(userSkills)}

Interests:
${JSON.stringify(profile.interests || [])}

Education:
${profile.education || 'Not provided'}

Bio:
${profile.bio || 'Not provided'}

GitHub Repositories:
${JSON.stringify(
            profile.githubRepositories || [],
        )}

Programming Languages:
${JSON.stringify(
            profile.programmingLanguages || [],
        )}


=================================
AVAILABLE LEARNING TIME
=================================

Learning Hours Per Week:
${learningHoursPerWeek}

Average Learning Hours Per Day:
${learningHoursPerDay}


=================================
TARGET JOB DESCRIPTION
=================================

${profile.jobDescription}

=================================
YOUR TASK
=================================

Analyze how well the user's profile
matches the Job Description.

Identify:

1. Overall match score from 0 to 100.

2. Skills already possessed by the user
that match the job requirements.

3. Missing skills.

4. User strengths.

5. Explainable AI explanations.

6. Priority for every missing skill.

7. A practical learning roadmap.

=================================
PRIORITY LEVELS
=================================

You must ONLY use:

CRITICAL
HIGH
MEDIUM
SUPPORTING

CRITICAL:
Fundamental skill required for the role.

HIGH:
Very important for job readiness.

MEDIUM:
Useful and commonly expected.

SUPPORTING:
Helpful but secondary.

=================================
IMPORTANT PRIORITY RULE
=================================

Core technologies should have higher
priority than supporting tools.

For example:

JavaScript → CRITICAL

React → CRITICAL or HIGH

TypeScript → HIGH

Git/GitHub → SUPPORTING

unless Git/GitHub is explicitly a major
requirement in the Job Description.

=================================
EXPLAINABLE AI
=================================

For every missing skill explain:

- Why the skill is required.
- Why it received its priority.
- How learning it improves job readiness.

Do not invent:

- Skills
- Experience
- Projects
- Qualifications

Only use information available in:

- User Profile
- User Skills
- Programming Languages
- GitHub Information
- Job Description

=================================
PERSONALIZED LEARNING ROADMAP
=================================

Create a realistic and personalized learning roadmap.

The roadmap must be based on:

1. Missing skills.
2. Skill priority.
3. The user's available learning time.

The user can study:

${learningHoursPerWeek} hours per week.

This is approximately:

${learningHoursPerDay} hours per day.

=================================
IMPORTANT ROADMAP RULES
=================================

1. CRITICAL skills must come first.

2. HIGH priority skills must come after
critical skills.

3. MEDIUM priority skills can be learned
after core requirements.

4. SUPPORTING skills should not delay
job readiness.

5. Do not overload the user with too many
skills in one phase.

6. The estimated duration MUST be realistic
based on ${learningHoursPerWeek} hours
available per week.

7. If the user has fewer learning hours,
increase the duration.

8. If the user has more learning hours,
the roadmap may progress faster.

9. Include practical projects and tasks
after learning important technologies.

=================================
ROADMAP PHASES
=================================

Use phases similar to:

Phase 1 - Critical Skills

Phase 2 - Core Technologies

Phase 3 - Projects and Practice

Phase 4 - Job Preparation

=================================
FOR EACH PHASE PROVIDE
=================================

1. Phase name

2. Skills to learn

3. Description

4. Estimated duration

5. Weekly learning hours

6. Practical tasks

=================================
RETURN ONLY VALID JSON
=================================

Return exactly this structure:

{
  "matchScore": 0,

  "matchedSkills": [],

  "strengths": [],

  "explanations": [
  {
      "skill": "",
      "explanation": ""
    }],

  "missingSkills": [
    {
      "skill": "",
      "priority": "CRITICAL",
      "priorityScore": 100,
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
`;


        try {

            // ==========================================
            // STEP 5: SEND DATA TO GEMINI
            // ==========================================

            let response;

            const maxRetries = 3;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {

                try {

                    response =
                        await this.gemini.models.generateContent({

                            model: 'gemini-3.6-flash',

                            contents: prompt,

                            config: {
                                responseMimeType: 'application/json',
                            },

                        });

                    // Success → exit the loop
                    break;

                } catch (error: any) {

                    console.error(
                        `Gemini attempt ${attempt} failed:`,
                        error?.message,
                    );

                    // If this is the last attempt, throw the error
                    if (attempt === maxRetries) {
                        throw error;
                    }

                    // Wait before retrying
                    const delay = attempt * 2000;

                    console.log(
                        `Retrying Gemini in ${delay / 1000} seconds...`,
                    );

                    await new Promise(
                        (resolve) => setTimeout(resolve, delay),
                    );

                }

            }


            const content =
                response.text;


            if (!content) {

                throw new Error(
                    'Gemini did not return a response.',
                );

            }


            // ==========================================
            // STEP 6: CONVERT GEMINI JSON
            // ==========================================

            const result =
                JSON.parse(content);


            // ==========================================
            // STEP 7: VALIDATE MATCH SCORE
            // ==========================================

            const matchScore =
                Math.min(
                    100,
                    Math.max(
                        0,
                        Number(result.matchScore) || 0,
                    ),
                );


            // ==========================================
            // STEP 8: SAVE ANALYSIS TO MONGODB
            // ==========================================

            const analysis =
                await this.jobAnalysisModel.create({

                    userId,

                    jobDescription:
                        profile.jobDescription,

                    matchScore,

                    matchedSkills:
                        result.matchedSkills || [],

                    strengths:
                        result.strengths || [],

                    explanations:
                        result.explanations || [],

                    missingSkills:
                        result.missingSkills || [],

                    roadmap:
                        result.roadmap || [],

                });


            // ==========================================
            // STEP 9: RETURN RESULT
            // ==========================================

            return {

                message:
                    'Job analysis completed successfully.',

                analysis,

            };


        } catch (error) {

            console.error(
                'Gemini Job Analysis Error:',
                error,
            );


            throw new InternalServerErrorException(
                'Failed to analyze the Job Description.',
            );

        }

    }

}