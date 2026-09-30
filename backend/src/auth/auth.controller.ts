import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

import { SignupDto } from './dto/signup.dto';

import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post('signup')
    signup(
        @Body() signupDto: SignupDto,
    ) {
        return this.authService.signup(
            signupDto,
        );
    }


    @Post('login')
    login(
        @Body() loginDto: LoginDto,
    ) {
        return this.authService.login(loginDto);
    }

    @Post('change-password')
    @UseGuards(JwtAuthGuard)
    changePassword(
        @Req() request: Request & { user: { userId: string } },
        @Body() dto: ChangePasswordDto,
    ) {
        return this.authService.changePassword(
            request.user.userId,
            dto,
        );
    }

    @Get(':provider')
    startOAuth(
        @Param('provider') provider: string,
        @Res() response: Response,
    ) {
        return this.authService.startOAuth(provider, response);
    }

    @Get(':provider/callback')
    finishOAuth(
        @Param('provider') provider: string,
        @Req() request: Request,
        @Res() response: Response,
        @Query('code') code?: string,
        @Query('state') state?: string,
    ) {
        return this.authService.finishOAuth(
            provider,
            request,
            response,
            code,
            state,
        );
    }


}