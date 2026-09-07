import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CareerDocument = HydratedDocument<Career>;

@Schema({
    timestamps: true,
})
export class Career {
    @Prop({
        required: true,
        index: true,
    })
    userId!: string;

    @Prop({
        type: [
            {
                career: String,
                matchScore: Number,
                description: String,
                whyRecommended: [String],
                strengthsUsed: [String],

                missingSkills: [
                    {
                        skill: String,
                        priority: String,
                        priorityScore: Number,
                        reason: String,
                    },
                ],

                roadmap: [
                    {
                        phase: String,
                        skills: [String],
                        description: String,
                        estimatedDuration: String,
                        weeklyHours: Number,
                        tasks: [String],
                    },
                ],
            },
        ],
        default: [],
    })
    recommendations!: {
        career: string;
        matchScore: number;
        description: string;
        whyRecommended: string[];
        strengthsUsed: string[];

        missingSkills: {
            skill: string;
            priority: string;
            priorityScore: number;
            reason: string;
        }[];

        roadmap: {
            phase: string;
            skills: string[];
            description: string;
            estimatedDuration: string;
            weeklyHours: number;
            tasks: string[];
        }[];
    }[];
}

export const CareerSchema =
    SchemaFactory.createForClass(Career);