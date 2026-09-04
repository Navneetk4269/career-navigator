import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import {
    Profile,
    ProfileDocument,
} from './schemas/profile.schema';

import {
    User,
    UserDocument,
} from '../users/schemas/user.schema';

import {
    CreateProfileDto,
} from './dto/create-profile.dto';

@Injectable()
export class ProfilesService {
    constructor(
        @InjectModel(Profile.name)
        private readonly profileModel:
            Model<ProfileDocument>,

        @InjectModel(User.name)
        private readonly userModel:
            Model<UserDocument>,
    ) { }

    async createProfile(
        userId: string,
        dto: CreateProfileDto,
    ) {
        const profile =
            await this.profileModel.findOneAndUpdate(
                {
                    userId,
                },

                {
                    userId,
                    ...dto,
                },

                {
                    new: true,
                    upsert: true,
                },
            );

        await this.userModel.findByIdAndUpdate(
            userId,
            {
                profileCompleted: true,
            },
        );

        return profile;
    }

    async getProfile(
        userId: string,
    ) {
        return this.profileModel.findOne({
            userId,
        });
    }
}