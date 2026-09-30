import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';

import { SignupDto } from './dto/signup.dto';

import { LoginDto } from './dto/login.dto';

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