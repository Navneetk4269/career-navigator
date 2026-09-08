import {
    Body,
    Controller,
    Get,
    Patch,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';

import { CareersService } from './careers.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { SelectRoadmapDto } from './dto/select-roadmap.dto';


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
        @Request() req: any,
    ) {

        return this.careersService
            .recommendCareers(
                req.user.userId,
            );

    }


    // =====================================
    // GET LATEST RECOMMENDATIONS
    // =====================================

    @Get('latest')
    async getLatestRecommendation(
        @Request() req: any,
    ) {

        return this.careersService
            .getLatestRecommendation(
                req.user.userId,
            );

    }


    // =====================================
    // SELECT ROADMAP FOR MY ROADMAP PAGE
    // =====================================

    @Patch('select-roadmap')
    async selectRoadmap(
        @Request() req: any,

        @Body()
        selectRoadmapDto: SelectRoadmapDto,
    ) {

        return this.careersService
            .selectRoadmap(
                req.user.userId,
                selectRoadmapDto.recommendation,
            );

    }


    // =====================================
    // GET USER'S SELECTED ROADMAP
    // =====================================

    @Get('my-roadmap')
    async getMyRoadmap(
        @Request() req: any,
    ) {

        return this.careersService
            .getMyRoadmap(
                req.user.userId,
            );

    }

}