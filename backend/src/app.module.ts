import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { JobAnalysisModule } from './job-analysis/job-analysis.module';
import { CareersModule } from './careers/careers.module';
import { MarketDemandModule } from './market-demand/market-demand.module';
import { AchievementsModule } from './achievements/achievements.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),

    UsersModule,

    AuthModule,

    ProfilesModule,

    JobAnalysisModule,

    CareersModule,

    MarketDemandModule,

    AchievementsModule,

  ],
  controllers: [],
})
export class AppModule { }