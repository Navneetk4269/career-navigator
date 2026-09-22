import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type JobAnalysisDocument = HydratedDocument<JobAnalysis>;

interface JobRoadmapTask {
    title: string;
    type: 'certificate' | 'project' | 'practice';
    resourceUrl?: string;
}

@Schema({ timestamps: true })
export class JobAnalysis {
    @Prop({ required: true })
    userId!: string;

    @Prop({ required: true })
    jobDescription!: string;

    // Career identified from the job description
    @Prop({ required: false })
    career!: string;

    // This will come from Market Demand / Career recommendation
    @Prop({ min: 0, max: 100 })
    matchScore!: number;

    @Prop({ type: [String], default: [] })
    matchedSkills!: string[];

    @Prop({ type: [String], default: [] })
    strengths!: string[];

    @Prop({
        type: [{ skill: String, explanation: String }],
        default: [],
    })
    explanations!: {
        skill: string;
        explanation: string;
    }[];

    @Prop({ type: [Object], default: [] })
    missingSkills!: {
        skill: string;
        priority: string;
        priorityScore: number;
        reason: string;
    }[];

    // Keep this for compatibility for now
    @Prop({ type: [Object], default: [] })
    roadmap!: {
        phase: string;
        skills: string[];
        description: string;
        estimatedDuration: string;
        weeklyHours: number;
        tasks: JobRoadmapTask[];
    }[];

    // Shared roadmap from Market Demand
    @Prop({ type: [Object], default: [] })
    generalRoadmap!: {
        phase: string;
        skills: string[];
        description: string;
        estimatedDuration: string;
        weeklyHours: number;
        tasks: JobRoadmapTask[];
    }[];
}

export const JobAnalysisSchema =
    SchemaFactory.createForClass(JobAnalysis);