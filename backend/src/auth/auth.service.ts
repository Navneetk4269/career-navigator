import {
    ConflictException,
    Injectable,
} from '@nestjs/common';

import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service';

import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
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
}