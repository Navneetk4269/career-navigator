import {
    Injectable,
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { GoogleGenAI } from '@google/genai';

import {
    Profile,
    ProfileDocument,
} from '../profiles/schemas/profile.schema';

import {
    Career,
    CareerDocument,
} from '../careers/schemas/career.schema';

import {
    MarketDemand,
    MarketDemandDocument,
} from '../market-demand/schemas/market-demand.schema';

@Injectable()
export class ChatbotService {
    private readonly gemini: GoogleGenAI;

    constructor(
        @InjectModel(Profile.name)
        private readonly profileModel: Model<ProfileDocument>,

        @InjectModel(Career.name)
        private readonly careerModel: Model<CareerDocument>,

        @InjectModel(MarketDemand.name)
        private readonly marketDemandModel: Model<MarketDemandDocument>,
    ) {
        this.gemini = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY!,
        });
    }

    // ============================================================
    // GEMINI GENERATION WITH RETRY
    // ============================================================

    private async generateWithRetry(
        prompt: string,
        responseMimeType: 'application/json' | 'text/plain',
    ) {
        const maxRetries = 3;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const response =
                    await this.gemini.models.generateContent({
                        model: 'gemini-3.6-flash',

                        contents: prompt,

                        config: {
                            responseMimeType,
                        },
                    });

                return response;
            } catch (error: any) {
                const status = error?.status;

                console.warn(
                    `Gemini chatbot attempt ${attempt + 1
                    }/${maxRetries} failed. Status: ${status}`,
                );

                // Retry only temporary Gemini availability errors
                if (
                    status !== 503 ||
                    attempt === maxRetries - 1
                ) {
                    throw error;
                }

                // Exponential backoff:
                // Attempt 1 -> wait 2 seconds
                // Attempt 2 -> wait 4 seconds
                const delay =
                    2000 * Math.pow(2, attempt);

                console.warn(
                    `Gemini temporarily unavailable. Retrying in ${delay / 1000
                    } seconds...`,
                );

                await new Promise((resolve) =>
                    setTimeout(resolve, delay),
                );
            }
        }

        throw new Error(
            'Unable to generate Gemini response.',
        );
    }

    // ============================================================
    // GET USER CONTEXT
    // ============================================================

    private async getUserContext(userId: string) {
        const profile =
            await this.profileModel.findOne({ userId });

        if (!profile) {
            throw new NotFoundException(
                'Profile not found. Please create your profile first.',
            );
        }

        const career =
            await this.careerModel.findOne({ userId });

        const marketDemand =
            await this.marketDemandModel
                .findOne({ userId })
                .sort({ generatedAt: -1 });

        return {
            profile: {
                education: profile.education || '',
                college: profile.college || '',
                graduationYear:
                    profile.graduationYear || '',
                skills: profile.skills || [],
                interests: profile.interests || [],
                learningHoursPerWeek:
                    profile.learningHoursPerWeek || 0,
                githubUsername:
                    profile.githubUsername || '',
                programmingLanguages:
                    profile.programmingLanguages || [],
                bio: profile.bio || '',
            },

            careerRecommendations:
                career?.recommendations || [],

            selectedRoadmap:
                career?.selectedRoadmap || null,

            roadmapProgress:
                career?.roadmapProgress || [],

            marketDemand:
                marketDemand?.careers || [],
        };
    }

    // ============================================================
    // GENERATE SUGGESTED QUESTIONS
    // ============================================================

    async getSuggestedQuestions(userId: string) {
        const context =
            await this.getUserContext(userId);

        const selectedCareer =
            context.selectedRoadmap?.career ||
            context.careerRecommendations?.[0]?.career ||
            'technology careers';

        const prompt = `
You are generating suggested questions for the
Career Navigator AI chatbot.

The user is a learner using Career Navigator.

USER INFORMATION:

Career:
${selectedCareer}

Skills:
${JSON.stringify(context.profile.skills)}

Interests:
${JSON.stringify(context.profile.interests)}

Programming Languages:
${JSON.stringify(
            context.profile.programmingLanguages,
        )}

Learning Hours Per Week:
${context.profile.learningHoursPerWeek}

IMPORTANT:

Generate EXACTLY 5 short questions.

The questions should focus mainly on:

1. Current technology trends
2. Skills currently in demand
3. Emerging technologies
4. Trends relevant to the user's career
5. What the user should learn next

The questions must be relevant to the user's
career and profile.

Examples:

"What technologies are trending right now?"

"Which skills are currently in demand for my career?"

"What emerging technologies should I learn?"

"Which trending skills match my profile?"

"What should I learn next to stay relevant?"

Do NOT generate questions about unrelated topics.

Return ONLY valid JSON:

{
  "questions": [
    "",
    "",
    "",
    "",
    ""
  ]
}
`;

        try {
            const response =
                await this.generateWithRetry(
                    prompt,
                    'application/json',
                );

            const responseText =
                response.text;

            if (!responseText) {
                throw new Error(
                    'Gemini returned an empty response.',
                );
            }

            const result =
                JSON.parse(responseText);

            if (
                !result.questions ||
                !Array.isArray(result.questions)
            ) {
                throw new Error(
                    'Invalid suggested questions response.',
                );
            }

            return {
                questions: result.questions
                    .filter(
                        (question: unknown) =>
                            typeof question === 'string' &&
                            question.trim().length > 0,
                    )
                    .slice(0, 5),
            };
        } catch (error) {
            console.error(
                'Chatbot suggested questions error:',
                error,
            );

            // Safe fallback
            return {
                questions: [
                    'What technologies are trending right now?',
                    'Which skills are currently in demand for my career?',
                    'What emerging technologies should I learn?',
                    'Which trending skills match my profile?',
                    'What should I learn next to stay relevant?',
                ],
            };
        }
    }

    // ============================================================
    // SEND CHAT MESSAGE
    // ============================================================

    async sendMessage(
        userId: string,
        message: string,
    ) {
        if (!message?.trim()) {
            throw new BadRequestException(
                'Message cannot be empty.',
            );
        }

        const context =
            await this.getUserContext(userId);

        const prompt = `
You are Career Navigator AI.

You are NOT a general-purpose chatbot.

Your purpose is to help the user with:

- Career Navigator
- Career development
- Career paths
- Skills
- Technology trends
- Skills in demand
- Emerging technologies
- Career recommendations
- User profile
- Skill gaps
- Roadmaps
- Roadmap progress
- Job Description Analysis
- Market Demand
- Courses
- Learning
- Roadmap phase verification
- Streaks
- Mini achievements
- GitHub/profile development
- Resume/profile improvement

You must NOT answer unrelated questions.

If the question is unrelated to Career Navigator
or career development, politely say:

"I can help only with Career Navigator and
career-development related questions."

==================================================
USER PROFILE
==================================================

Education:
${context.profile.education}

College:
${context.profile.college}

Graduation Year:
${context.profile.graduationYear}

Skills:
${JSON.stringify(context.profile.skills)}

Interests:
${JSON.stringify(context.profile.interests)}

Programming Languages:
${JSON.stringify(
            context.profile.programmingLanguages,
        )}

Learning Hours Per Week:
${context.profile.learningHoursPerWeek}

GitHub:
${context.profile.githubUsername}

==================================================
CAREER RECOMMENDATIONS
==================================================

${JSON.stringify(
            context.careerRecommendations,
            null,
            2,
        )}

==================================================
SELECTED ROADMAP
==================================================

${JSON.stringify(
            context.selectedRoadmap,
            null,
            2,
        )}

==================================================
ROADMAP PROGRESS
==================================================

${JSON.stringify(
            context.roadmapProgress,
            null,
            2,
        )}

==================================================
MARKET DEMAND
==================================================

${JSON.stringify(
            context.marketDemand,
            null,
            2,
        )}

==================================================
IMPORTANT RULES
==================================================

1. Use the user's actual profile whenever
   answering personalized questions.

2. Do not invent user's skills.

3. Do not invent roadmap progress.

4. Do not claim that a user completed something
   unless the provided data says so.

5. If information is unavailable, clearly say
   that the information is not currently available.

6. When discussing trends, distinguish between
   information available in Career Navigator's
   Market Demand data and general career guidance.

7. Do not invent precise market statistics.

8. Give practical and understandable answers.

9. If the user asks what they should learn next,
   consider:

   - current skills
   - missing skills
   - selected roadmap
   - roadmap progress
   - learning hours
   - career relevance

10. Keep answers concise but useful.

==================================================
USER QUESTION
==================================================

${message}

Answer the user's question now.
`;

        try {
            const response =
                await this.generateWithRetry(
                    prompt,
                    'text/plain',
                );

            const responseText =
                response.text?.trim();

            if (!responseText) {
                throw new Error(
                    'Gemini returned an empty response.',
                );
            }

            return {
                answer: responseText,
            };
        } catch (error: any) {
            console.error(
                'Career Navigator chatbot error:',
                error,
            );

            // Give a more useful error for Gemini 503
            if (error?.status === 503) {
                throw new InternalServerErrorException(
                    'The AI service is temporarily busy. Please try again in a few seconds.',
                );
            }

            throw new InternalServerErrorException(
                'Unable to generate chatbot response. Please try again.',
            );
        }
    }
}