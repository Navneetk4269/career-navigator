import {
    Prop,
    Schema,
    SchemaFactory,
} from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';

export type MarketDemandDocument =
    HydratedDocument<MarketDemand>;

@Schema({
    timestamps: true,
})
export class MarketDemand {

    @Prop({
        required: true,
        index: true,
    })
    userId!: string;

    @Prop({
        required: true,
    })
    generatedAt!: Date;

    @Prop({
        type: [
            {
                rank: Number,

                career: String,

                demandScore: Number,

                growthPercentage: Number,

                trend: String,

                description: String,

                averageSalary: String,

                salaryRange: String,

                whyInDemand: [String],

                requiredSkills: [String],

                changingMarket: [
                    {
                        technology: String,
                        trend: String,
                        reason: String,
                    },
                ],

                commonJobTitles: [String],

                userSkillMatch: {
                    matchedSkills: [String],
                    missingSkills: [String],
                    matchPercentage: Number,
                },

                roadmap: [
                    {
                        phase: String,
                        skills: [String],
                        description: String,
                        estimatedDuration: String,
                        weeklyHours: Number,
                        tasks: [
                            {
                                title: String,
                                type: {
                                    type: String,
                                    enum: ['certificate', 'project', 'practice'],
                                },
                                resourceUrl: {
                                    type: String,
                                    default: null,
                                },
                            },
                        ],
                    },
                ],

                aiInsight: String,
            },
        ],
        default: [],
    })
    careers!: {
        rank: number;

        career: string;

        demandScore: number;

        growthPercentage: number;

        trend: string;

        description: string;

        averageSalary: string;

        salaryRange: string;

        whyInDemand: string[];

        requiredSkills: string[];

        changingMarket: {
            technology: string;
            trend: string;
            reason: string;
        }[];

        commonJobTitles: string[];

        userSkillMatch: {
            matchedSkills: string[];
            missingSkills: string[];
            matchPercentage: number;
        };

        roadmap: {
            phase: string;
            skills: string[];
            description: string;
            estimatedDuration: string;
            weeklyHours: number;

            tasks: {
                title: string;
                type: 'certificate' | 'project' | 'practice';
                resourceUrl?: string | null;
            }[];
        }[];

        aiInsight: string;
    }[];

    createdAt?: Date;

    updatedAt?: Date;
}

export const MarketDemandSchema =
    SchemaFactory.createForClass(MarketDemand);