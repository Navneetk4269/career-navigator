import {
    Controller,
    Get,
    Post,
    UseGuards,
    Request,
} from '@nestjs/common';

import { CareersService } from './careers.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@Controller('careers')
@UseGuards(JwtAuthGuard)
export class CareersController {

    constructor(
        private readonly careersService:
            CareersService,
    ) { }


    // =====================================
    // GENERATE CAREER RECOMMENDATIONS
    // =====================================

    @Post('recommend')

    async recommendCareers(
        @Request() req,
    ) {

        return this.careersService
            .recommendCareers(
                req.user.userId,
            );

    }


    // =====================================
    // GET LATEST RECOMMENDATION
    // =====================================

    @Get('latest')

    async getLatestRecommendation(
        @Request() req,
    ) {

        return this.careersService
            .getLatestRecommendation(
                req.user.userId,
            );

    }

}