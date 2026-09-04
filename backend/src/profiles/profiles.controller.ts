import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { ProfilesService } from './profiles.service';

import {
    CreateProfileDto,
} from './dto/create-profile.dto';

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
    constructor(
        private readonly profilesService:
            ProfilesService,
    ) { }

    @Post()
    createProfile(
        @Req() request: any,
        @Body() dto: CreateProfileDto,
    ) {
        return this.profilesService.createProfile(
            request.user.userId,
            dto,
        );
    }

    @Get('me')
    getMyProfile(
        @Req() request: any,
    ) {
        return this.profilesService.getProfile(
            request.user.userId,
        );
    }
}