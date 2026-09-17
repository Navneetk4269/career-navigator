import {
    Body,
    Controller,
    Get,
    Patch,
    Post,
    Request,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    BadRequestException,
    ParseFilePipeBuilder,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { CareersService } from './careers.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { SelectRoadmapDto } from './dto/select-roadmap.dto';

import { UpdateRoadmapProgressDto } from './dto/update-roadmap-progress.dto';

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


    // =====================================
    // SUBMIT ROADMAP COMPLETION EVIDENCE
    // =====================================

    @Post('roadmap-proof')
    @UseInterceptors(
        FileInterceptor('file', {
            dest: './uploads/roadmap-proof',
        }),
    )
    async submitRoadmapProof(
        @Request() req: any,

        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: /^image\/(jpeg|png)$|^application\/pdf$/,
                })
                .addMaxSizeValidator({
                    maxSize: 10 * 1024 * 1024,
                })
                .build({
                    errorHttpStatusCode: 400,
                }),
        )
        file: Express.Multer.File,

        @Body()
        body: {
            phaseIndex: string;
            evidenceType: 'certificate' | 'screenshot';
        },
    ) {
        const phaseIndex = Number(body.phaseIndex);

        if (Number.isNaN(phaseIndex)) {
            throw new BadRequestException('Invalid roadmap phase.');
        }

        if (!file) {
            throw new BadRequestException('Evidence file is required.');
        }

        return this.careersService.initializePhaseVerification(
            req.user.userId,
            phaseIndex,
            body.evidenceType,
            file.originalname,
            file.path,
        );
    }


    // =====================================
    // UPDATE ROADMAP PROGRESS
    // =====================================

    @Patch('roadmap-progress')
    async updateRoadmapProgress(
        @Request() req: any,

        @Body()
        updateRoadmapProgressDto:
            UpdateRoadmapProgressDto,
    ) {

        return this.careersService
            .updateRoadmapProgress(

                req.user.userId,

                updateRoadmapProgressDto.phaseIndex,

                updateRoadmapProgressDto.completed,

            );

    }
}