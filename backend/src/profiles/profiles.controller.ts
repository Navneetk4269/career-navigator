import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';

import {
    FileInterceptor,
} from '@nestjs/platform-express';

import {
    memoryStorage,
} from 'multer';

import {
    JwtAuthGuard,
} from '../auth/jwt-auth.guard';

import {
    ProfilesService,
} from './profiles.service';

import {
    CreateProfileDto,
} from './dto/create-profile.dto';

import {
    GithubSyncDto,
} from './dto/github-sync.dto';


@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {

    constructor(
        private readonly profilesService:
            ProfilesService,
    ) { }


    /*
    ======================================
    CREATE PROFILE
    ======================================
    */

    @Post()
    createProfile(

        @Req()
        request: any,

        @Body()
        dto: CreateProfileDto,

    ) {

        return this.profilesService.createProfile(

            request.user.userId,

            dto,

        );
    }


    /*
    ======================================
    GET MY PROFILE
    ======================================
    */

    @Get('me')
    getMyProfile(

        @Req()
        request: any,

    ) {

        return this.profilesService.getProfile(

            request.user.userId,

        );
    }


    /*
    ======================================
    UPLOAD + EXTRACT RESUME
    ======================================
    */

    @Post('resume/extract')

    @UseInterceptors(

        FileInterceptor(

            'resume',

            {
                storage:
                    memoryStorage(),

                limits: {

                    fileSize:
                        10 * 1024 * 1024,

                },

            },

        ),

    )

    async extractResume(

        @Req()
        request: any,

        @UploadedFile()
        file: any,

    ) {

        return this.profilesService.extractResumeAndUpdateProfile(

            request.user.userId,

            file,

        );

    }


    /*
    ======================================
    GITHUB SYNC + EXTRACTION
    ======================================
    */

    @Post('github/sync')
    async syncGithub(

        @Req()
        request: any,

        @Body()
        dto: GithubSyncDto,

    ) {

        return this.profilesService.syncGithubProfile(

            request.user.userId,

            dto.githubUrl,

        );
    }

}