import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import {
  MarketDemand,
  MarketDemandSchema,
} from './schemas/market-demand.schema';

import {
  Profile,
  ProfileSchema,
} from '../profiles/schemas/profile.schema';

import { MarketDemandController } from './market-demand.controller';

import { MarketDemandService } from './market-demand.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MarketDemand.name,
        schema: MarketDemandSchema,
      },
      {
        name: Profile.name,
        schema: ProfileSchema,
      },
    ]),
  ],

  controllers: [
    MarketDemandController,
  ],

  providers: [
    MarketDemandService,
  ],
})
export class MarketDemandModule { }