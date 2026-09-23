import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
export class UserAchievement {
    @Prop({ required: true })
    id!: string;

    @Prop({ required: true })
    title!: string;

    @Prop({ required: true })
    description!: string;

    @Prop({ required: true })
    icon!: string;

    @Prop({ required: true })
    unlockedAt!: Date;
}

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, trim: true })
    name!: string;

    @Prop({
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    })
    email!: string;

    @Prop({ required: true })
    password!: string;

    @Prop({ default: false })
    profileCompleted!: boolean;

    // ==============================
    // LOGIN STREAK
    // ==============================

    @Prop({ default: 0 })
    loginStreak!: number;

    @Prop({ type: Date, default: null })
    lastLoginDate!: Date | null;

    // ==============================
    // ACHIEVEMENTS
    // ==============================

    @Prop({
        type: [UserAchievement],
        default: [],
    })
    achievements!: UserAchievement[];
}

export const UserSchema =
    SchemaFactory.createForClass(User);