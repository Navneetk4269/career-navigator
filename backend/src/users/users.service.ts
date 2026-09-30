import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import {
    User,
    UserDocument,
} from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
    ) { }

    async findByEmail(email: string) {
        return this.userModel.findOne({
            email,
        });
    }

    async findByOAuthId(
        providerField: 'googleId' | 'linkedinId',
        providerId: string,
    ) {
        return this.userModel.findOne({
            [providerField]: providerId,
        });
    }

    async createUser(
        name: string,
        email: string,
        password?: string,
    ) {
        const user = new this.userModel({
            name,
            email,
            password,
        });

        return user.save();
    }

    async createOAuthUser(
        name: string,
        email: string,
        providerField: 'googleId' | 'linkedinId',
        providerId: string,
    ) {
        const user = new this.userModel({
            name,
            email,
            [providerField]: providerId,
        });

        return user.save();
    }
}