import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Career,
  CareerSchema,
} from './schemas/career.schema';

import {
  Profile,
  ProfileSchema,
} from '../profiles/schemas/profile.schema';

import { CareersController } from './careers.controller';
import { CareersService } from './careers.service';

import { AchievementsModule } from '../achievements/achievements.module';
import {
    User,
    UserSchema,
} from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Career.name,
        schema: CareerSchema,
      },
      {
        name: Profile.name,
        schema: ProfileSchema,
      },
      {
          name: User.name,
          schema: UserSchema,
      },
    ]),
    AchievementsModule,
  ],

  controllers: [
    CareersController,
  ],

  providers: [
    CareersService,
  ],
})
export class CareersModule { }