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

import { memoryStorage } from 'multer';

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
    // SUBMIT ROADMAP TASK EVIDENCE
    // =====================================

    @Post('roadmap-proof')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            limits: {
                fileSize: 10 * 1024 * 1024,
            },
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
            taskIndex: string;
            evidenceType: 'certificate' | 'screenshot';
        },
    ) {

        const phaseIndex = Number(body.phaseIndex);
        const taskIndex = Number(body.taskIndex);

        // =====================================
        // VALIDATE PHASE
        // =====================================

        if (Number.isNaN(phaseIndex)) {
            throw new BadRequestException(
                'Invalid roadmap phase.',
            );
        }


        // =====================================
        // VALIDATE TASK
        // =====================================

        if (Number.isNaN(taskIndex)) {
            throw new BadRequestException(
                'Invalid roadmap task.',
            );
        }


        // =====================================
        // VALIDATE FILE
        // =====================================

        if (!file) {
            throw new BadRequestException(
                'Evidence file is required.',
            );
        }


        // =====================================
        // START VERIFICATION
        // =====================================

        return this.careersService
            .initializePhaseVerification(
                req.user.userId,

                phaseIndex,

                body.evidenceType,

                file.originalname,

                file,

                false,

                taskIndex,
            );
    }


    // =====================================
    // SUBMIT GITHUB REPOSITORY
    // =====================================

    @Post('roadmap-github-repo')
    async submitRoadmapGithubRepo(
        @Request() req: any,

        @Body()
        body: {
            phaseIndex: number;
            taskIndex: number;
            repositoryUrl: string;
        },
    ) {

        return this.careersService
            .submitGithubRepository(
                req.user.userId,

                Number(body.phaseIndex),

                Number(body.taskIndex),

                body.repositoryUrl,
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