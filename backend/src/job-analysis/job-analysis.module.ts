import {
  Module,
} from '@nestjs/common';

import {
  MongooseModule,
} from '@nestjs/mongoose';

import {
  JobAnalysisController,
} from './job-analysis.controller';

import {
  JobAnalysisService,
} from './job-analysis.service';

import {
  JobAnalysis,
  JobAnalysisSchema,
} from './schemas/job-analysis.schema';

import {
  Profile,
  ProfileSchema,
} from '../profiles/schemas/profile.schema';


@Module({

  imports: [

    MongooseModule.forFeature([

      {
        name: JobAnalysis.name,
        schema: JobAnalysisSchema,
      },

      {
        name: Profile.name,
        schema: ProfileSchema,
      },

    ]),

  ],


  controllers: [
    JobAnalysisController,
  ],


  providers: [
    JobAnalysisService,
  ],

})
export class JobAnalysisModule { }