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

        const skills =
            profile.skills || [];

        const interests =
            profile.interests || [];

        const education =
            profile.education || '';

        const jobDescription =
            profile.jobDescription || '';


        const prompt = `

You are the AI Market Demand Analysis system
for a career navigation application.

Your job is to analyze technology career demand
and provide useful career-market information for
a student.

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

24. Roadmap skills should come from
    missingSkills whenever possible.

25. Provide an AI career insight personalized
    to the user's current profile.

26. Do not generate duplicate careers.

27. Return ONLY valid JSON.

28. Do not return markdown.

29. Do not use code fences.

30. Do not include any explanation outside JSON.


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
            "Learn modules",
            "Learn controllers",
            "Build a REST API"
          ]
        }
      ],
      "aiInsight": "Personalized career insight."
    }
  ]
}

`;


        try {

            let response: any = null;

            const maxRetries = 3;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    response =
                        await this.ai.models.generateContent({
                            model:
                                process.env.GEMINI_MODEL ||
                                'gemini-3.6-flash',

                            contents: prompt,

                            config: {
                                responseMimeType:
                                    'application/json',
                            },
                        });

                    break;

                } catch (error: any) {

                    const status =
                        error?.status ||
                        error?.error?.code;

                    console.log(
                        `Gemini request failed. Attempt ${attempt}/${maxRetries}. Status: ${status}`,
                    );

                    // Retry only temporary server/rate-limit errors
                    if (
                        status !== 503 &&
                        status !== 429
                    ) {
                        throw error;
                    }

                    if (attempt === maxRetries) {
                        throw error;
                    }

                    const delay =
                        2000 * Math.pow(2, attempt - 1);

                    console.log(
                        `Retrying Gemini request in ${delay / 1000} seconds...`,
                    );

                    await new Promise(
                        (resolve) =>
                            setTimeout(resolve, delay),
                    );
                }
            }


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


            const careers =
                parsed.careers
                    .slice(0, 8)
                    .map(
                        (
                            career: any,
                            index: number,
                        ) => {

                            return {

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

                                userSkillMatch:
                                    career.userSkillMatch ||
                                    {
                                        matchedSkills: [],
                                        missingSkills: [],
                                        matchPercentage: 0,
                                    },

                                roadmap:
                                    career.roadmap ||
                                    [],

                                aiInsight:
                                    career.aiInsight ||
                                    '',

                            };

                        },
                    );


            const saved =
                await this.marketDemandModel.create({

                    userId,

                    generatedAt:
                        new Date(),

                    careers,

                });


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


        const career =
            marketDemand.careers.find(
                (item) =>
                    item.career.toLowerCase() ===
                    careerName.toLowerCase(),
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