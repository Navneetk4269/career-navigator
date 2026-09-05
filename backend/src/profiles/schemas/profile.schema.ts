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

    /*
        USER
    */

    @Prop({
        required: true,
        unique: true,
    })
    userId!: string;


    /*
        EDUCATION
    */

    @Prop({
        default: '',
    })
    education!: string;

    @Prop({
        default: '',
    })
    college!: string;

    @Prop({
        default: 0,
    })
    graduationYear!: number;


    /*
        SKILLS
    */

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


    /*
        CAREER INFORMATION
    */

    @Prop({
        default: '',
    })
    careerGoal!: string;

    @Prop({
        default: 10,
    })
    learningHoursPerWeek!: number;


    /*
        GITHUB INFORMATION
    */

    @Prop({
        default: '',
    })
    githubUsername!: string;

    @Prop({
        type: [String],
        default: [],
    })
    githubRepositories!: string[];

    @Prop({
        type: [String],
        default: [],
    })
    programmingLanguages!: string[];


    /*
        RESUME INFORMATION
    */

    @Prop({
        default: '',
    })
    bio!: string;

    @Prop({
        default: '',
    })
    resumeFileName!: string;
}

export const ProfileSchema =
    SchemaFactory.createForClass(Profile);