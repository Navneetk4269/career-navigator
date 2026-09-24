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
        responseMimeType?: string,
    ): Promise<string> {

        const configuredModel =
            process.env.GEMINI_MODEL?.trim();

        const models: string[] = [
            ...(configuredModel
                ? [configuredModel]
                : []),

            "gemini-3.5-flash-lite",
            "gemini-3.6-flash",
            "gemini-3.7-flash",
            "gemini-3.8-flash",
        ];

        // Remove duplicate models
        const uniqueModels = [...new Set(models)];

        const maxRetriesPerModel = 2;

        let lastError: any = null;

        for (const model of uniqueModels) {

            console.log(
                `Trying Gemini chatbot model: ${model}`,
            );

            for (
                let attempt = 1;
                attempt <= maxRetriesPerModel;
                attempt++
            ) {
                try {

                    const response =
                        await this.gemini.models.generateContent({
                            model,
                            contents: prompt,
                            config: responseMimeType
                                ? {
                                    responseMimeType,
                                }
                                : undefined,
                        });

                    const text =
                        response.text?.trim();

                    if (!text) {
                        throw new Error(
                            "Gemini returned an empty response.",
                        );
                    }

                    console.log(
                        `Chatbot Gemini succeeded using model: ${model}`,
                    );

                    return text;

                } catch (error: any) {

                    lastError = error;

                    const status =
                        error?.status ||
                        error?.error?.code ||
                        error?.cause?.status;

                    const errorCode =
                        error?.code ||
                        error?.cause?.code ||
                        error?.cause?.cause?.code;

                    const message =
                        error?.message || "";

                    const isTransientError =
                        status === 503 ||
                        status === 429 ||
                        status === 500 ||
                        status === 408 ||
                        status === 504 ||
                        errorCode === "UND_ERR_HEADERS_TIMEOUT" ||
                        errorCode === "UND_ERR_BODY_TIMEOUT" ||
                        errorCode === "UND_ERR_CONNECT_TIMEOUT" ||
                        message.includes("fetch failed");

                    console.error(
                        `Chatbot Gemini ${model} attempt ${attempt} failed:`,
                        error,
                    );

                    // Don't retry permanent errors
                    // such as invalid API key or malformed request.
                    if (!isTransientError) {
                        throw error;
                    }

                    // Retry the same model once before
                    // moving to the next fallback.
                    if (attempt < maxRetriesPerModel) {

                        const delay =
                            attempt * 2000;

                        console.log(
                            `Retrying ${model} in ${delay}ms...`,
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

            console.log(
                `Gemini chatbot model ${model} failed. Trying next fallback...`,
            );
        }

        throw (
            lastError ||
            new Error(
                "All Gemini chatbot models failed.",
            )
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

            const responseText = response;

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
                response.trim();

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