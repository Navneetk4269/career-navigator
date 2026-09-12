import {
    Controller,
    Get,
    Param,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';

import { MarketDemandService } from './market-demand.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('market-demand')
@UseGuards(JwtAuthGuard)
export class MarketDemandController {

    constructor(
        private readonly marketDemandService:
            MarketDemandService,
    ) { }


    // ================================================
    // GENERATE MARKET DEMAND
    // ================================================

    @Post('generate')
    async generateMarketDemand(
        @Request() req: any,
    ) {

        return this.marketDemandService
            .generateMarketDemand(
                req.user.userId,
            );

    }


    // ================================================
    // GET LATEST ANALYSIS
    // ================================================

    @Get('latest')
    async getLatestMarketDemand(
        @Request() req: any,
    ) {

        return this.marketDemandService
            .getLatestMarketDemand(
                req.user.userId,
            );

    }


    // ================================================
    // GET ONE CAREER
    // ================================================

    @Get('career/:careerName')
    async getCareerDetails(
        @Request() req: any,

        @Param('careerName')
        careerName: string,
    ) {

        return this.marketDemandService
            .getCareerDetails(
                req.user.userId,
                careerName,
            );

    }

}