import {
    Controller,
    Get,
    Request,
    UseGuards,
} from '@nestjs/common';

import { AchievementsService } from './achievements.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class AchievementsController {
    constructor(
        private readonly achievementsService: AchievementsService,
    ) {}

    @Get('me')
    async getMyAchievements(
        @Request() req: any,
    ) {
        return this.achievementsService.getAchievements(
            req.user.userId,
        );
    }
}