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

import { MarketDemand, MarketDemandSchema } from '../market-demand/schemas/market-demand.schema';


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

      {
        name: MarketDemand.name,
        schema: MarketDemandSchema,
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