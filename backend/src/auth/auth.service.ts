import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service';

import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,

        private readonly jwtService: JwtService,
    ) { }

    async signup(signupDto: SignupDto) {
        const existingUser =
            await this.usersService.findByEmail(
                signupDto.email,
            );

        if (existingUser) {
            throw new ConflictException(
                'Email already registered',
            );
        }

        const hashedPassword =
            await bcrypt.hash(
                signupDto.password,
                10,
            );

        const user =
            await this.usersService.createUser(
                signupDto.name,
                signupDto.email,
                hashedPassword,
            );

        return {
            message: 'Account created successfully',

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileCompleted:
                    user.profileCompleted,
            },
        };
    }

    async login(loginDto: LoginDto) {
        const user =
            await this.usersService.findByEmail(
                loginDto.email,
            );

        if (!user) {
            throw new UnauthorizedException(
                'Invalid email or password',
            );
        }

        const isPasswordValid =
            await bcrypt.compare(
                loginDto.password,
                user.password,
            );

        if (!isPasswordValid) {
            throw new UnauthorizedException(
                'Invalid email or password',
            );
        }
        const token =
            await this.jwtService.signAsync({
                sub: user._id.toString(),
                email: user.email,
            });

        return {
            message: 'Login successful',

            accessToken: token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileCompleted:
                    user.profileCompleted,
            },
        };
    }
}