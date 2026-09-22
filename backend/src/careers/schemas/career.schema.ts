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
                        tasks: [
                            {
                                title: String,

                                type: {
                                    type: String,
                                    enum: [
                                        'certificate',
                                        'project',
                                        'practice',
                                    ],
                                },

                                resourceUrl: {
                                    type: String,
                                    default: null,
                                },
                            },
                        ],
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
            tasks: {
                title: string;
                type: 'certificate' | 'project' | 'practice';
                resourceUrl?: string;
            }[];
        }[];
    }[];


    // =====================================
    // SELECTED ROADMAP
    // =====================================

    @Prop({
        type: Object,
        default: null,
    })
    selectedRoadmap!: any;


    @Prop({
        type: Date,
        default: null,
    })
    selectedAt!: Date | null;


    // =====================================
    // ROADMAP PHASE PROGRESS ⭐ NEW
    // =====================================

    // =====================================
// ROADMAP PHASE PROGRESS
// =====================================

    @Prop({
        type: [
            {
                phaseIndex: {
                    type: Number,
                    required: true,
                },

                taskIndex: {
                    type: Number,
                    default: null,
                },

                taskTitle: {
                    type: String,
                    default: null,
                },

                completed: {
                    type: Boolean,
                    default: false,
                },

                completedAt: {
                    type: Date,
                    default: null,
                },

                // =====================================
                // COMPLETION VERIFICATION
                // =====================================

                verificationStatus: {
                    type: String,
                    enum: [
                        'not_submitted',
                        'pending',
                        'verified',
                        'rejected',
                    ],
                    default: 'not_submitted',
                },

                evidenceType: {
                    type: String,
                    enum: [
                        'certificate',
                        'screenshot',
                        'github',
                    ],
                    default: null,
                },

                evidenceFileName: {
                    type: String,
                    default: null,
                },

                evidenceFilePath: {
                    type: String,
                    default: null,
                },

                verificationResult: {
                    type: Object,
                    default: null,
                },
            },
        ],
        default: [],
    })
    roadmapProgress!: {
        phaseIndex: number;

        taskIndex: number | null;

        taskTitle: string | null;

        completed: boolean;

        completedAt: Date | null;

        verificationStatus:
            | 'not_submitted'
            | 'pending'
            | 'verified'
            | 'rejected';

        evidenceType:
            | 'certificate'
            | 'screenshot'
            | 'github'
            | null;

        evidenceFileName: string | null;
        
        evidenceFilePath: string | null;

        verificationResult: {
            confidence?: number;
            learnerName?: string;
            courseName?: string;
            platform?: string;
            completionStatus?: string;
            relevantSkills?: string[];
            reason?: string;
        } | null;
    }[];


    // Automatically managed by Mongoose
    // because timestamps: true is enabled

    createdAt?: Date;

    updatedAt?: Date;
}

export const CareerSchema =
    SchemaFactory.createForClass(Career);
