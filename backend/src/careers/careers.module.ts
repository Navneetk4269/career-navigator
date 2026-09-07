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
    ]),
  ],

  controllers: [
    CareersController,
  ],

  providers: [
    CareersService,
  ],
})
export class CareersModule { }