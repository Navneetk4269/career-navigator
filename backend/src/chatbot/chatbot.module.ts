import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';

import {
  Profile,
  ProfileSchema,
} from '../profiles/schemas/profile.schema';

import {
  Career,
  CareerSchema,
} from '../careers/schemas/career.schema';

import {
  MarketDemand,
  MarketDemandSchema,
} from '../market-demand/schemas/market-demand.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Profile.name,
        schema: ProfileSchema,
      },
      {
        name: Career.name,
        schema: CareerSchema,
      },
      {
        name: MarketDemand.name,
        schema: MarketDemandSchema,
      },
    ]),
  ],

  controllers: [ChatbotController],

  providers: [ChatbotService],

  exports: [ChatbotService],
})
export class ChatbotModule { }