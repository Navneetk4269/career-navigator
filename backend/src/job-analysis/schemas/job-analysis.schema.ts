import {
    Prop,
    Schema,
    SchemaFactory,
} from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';

export type JobAnalysisDocument =
    HydratedDocument<JobAnalysis>;


@Schema({
    timestamps: true,
})
export class JobAnalysis {

    @Prop({
        required: true,
    })
    userId!: string;


    @Prop({
        required: true,
    })
    jobDescription!: string;


    @Prop({
        min: 0,
        max: 100,
    })
    matchScore!: number;


    @Prop({
        type: [String],
        default: [],
    })
    matchedSkills!: string[];


    @Prop({
        type: [String],
        default: [],
    })
    strengths!: string[];


    @Prop({
        type: [
            {
                skill: String,
                explanation: String,
            },
        ],
        default: [],
    })
    explanations!: {
        skill: string;
        explanation: string;
    }[];


    @Prop({
        type: [Object],
        default: [],
    })
    missingSkills!: {
        skill: string;
        priority: string;
        priorityScore: number;
        reason: string;
    }[];


    @Prop({
        type: [Object],
        default: [],
    })
    roadmap!: {
        phase: string;
        skills: string[];
        description: string;
        estimatedDuration: string;
        weeklyHours: number;
        tasks: string[];
    }[];
}


export const JobAnalysisSchema =
    SchemaFactory.createForClass(JobAnalysis);