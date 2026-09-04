import {
    Prop,
    Schema,
    SchemaFactory,
} from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';

export type ProfileDocument =
    HydratedDocument<Profile>;

@Schema({
    timestamps: true,
})
export class Profile {
    @Prop({
        required: true,
        unique: true,
    })
    userId!: string;

    @Prop()
    education!: string;

    @Prop()
    college!: string;

    @Prop()
    graduationYear!: number;

    @Prop({
        type: [String],
        default: [],
    })
    skills!: string[];

    @Prop({
        type: [String],
        default: [],
    })
    interests!: string[];

    @Prop({
        default: '',
    })
    careerGoal!: string;

    @Prop({
        default: 10,
    })
    learningHoursPerWeek!: number;
}

export const ProfileSchema =
    SchemaFactory.createForClass(Profile);