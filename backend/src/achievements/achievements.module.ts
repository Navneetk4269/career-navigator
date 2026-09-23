import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import {
    User,
    UserSchema,
} from '../users/schemas/user.schema';

import { AchievementsController } from './achievements.controller';

import { AchievementsService } from './achievements.service';

import {
    Career,
    CareerSchema,
} from '../careers/schemas/career.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: User.name,
                schema: UserSchema,
            },
            {
                name: Career.name,
                schema: CareerSchema,
            },
        ]),
    ],

    controllers: [
        AchievementsController,
    ],

    providers: [
        AchievementsService,
    ],

    exports: [
        AchievementsService,
    ],
})
export class AchievementsModule {}