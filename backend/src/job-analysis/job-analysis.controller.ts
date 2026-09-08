import {
    Controller,
    Get,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';

import {
    JobAnalysisService,
} from './job-analysis.service';

// IMPORTANT:
// Copy the SAME JwtAuthGuard import
// used in your ProfilesController.

import {
    JwtAuthGuard,
} from '../auth/jwt-auth.guard';


@Controller('job-analysis')
@UseGuards(JwtAuthGuard)
export class JobAnalysisController {

    constructor(

        private readonly jobAnalysisService:
            JobAnalysisService,

    ) { }


    @Post('analyze')
    async analyzeJob(
        @Req() req: any,
    ) {

        return this.jobAnalysisService.analyzeJob(
            req.user.userId,
        );

    }

    @Get('latest')
    async getLatestAnalysis(
        @Req() req: any,
    ) {
        return this.jobAnalysisService.getLatestAnalysis(
            req.user.userId,
        );
    }

}