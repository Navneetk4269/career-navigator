import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    ServiceUnavailableException,
    UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service';

import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

import { AchievementsService } from '../achievements/achievements.service';

import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { Request, Response } from 'express';
import type { UserDocument } from '../users/schemas/user.schema';

type OAuthProvider = 'google' | 'linkedin';

type OAuthProfile = {
    sub: string;
    email: string;
    email_verified: boolean;
    name?: string;
};

const OAUTH_COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/api/auth',
    maxAge: 10 * 60 * 1000,
};

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly usersService: UsersService,

        private readonly jwtService: JwtService,

        private readonly achievementsService: AchievementsService,
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

        const isPasswordValid = user.password &&
            await bcrypt.compare(
                loginDto.password,
                user.password,
            );

        if (!isPasswordValid) {
            throw new UnauthorizedException(
                'Invalid email or password',
            );
        }

        return this.createLoginResult(user);
    }

    async changePassword(userId: string, dto: ChangePasswordDto) {
        const user = await this.usersService.findById(userId);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (user.password) {
            if (!dto.currentPassword) {
                throw new BadRequestException(
                    'Enter your current password',
                );
            }

            const isCurrentPasswordValid = await bcrypt.compare(
                dto.currentPassword,
                user.password,
            );

            if (!isCurrentPasswordValid) {
                throw new UnauthorizedException(
                    'Current password is incorrect',
                );
            }

            const isSamePassword = await bcrypt.compare(
                dto.newPassword,
                user.password,
            );

            if (isSamePassword) {
                throw new BadRequestException(
                    'New password must be different from your current password',
                );
            }
        }

        user.password = await bcrypt.hash(dto.newPassword, 10);
        await user.save();

        return { message: 'Password updated successfully' };
    }

    startOAuth(providerName: string, response: Response) {
        const provider = this.getProvider(providerName);
        const config = this.getOAuthConfig(provider);
        const state = randomBytes(32).toString('hex');
        const verifier = provider === 'google'
            ? randomBytes(32).toString('base64url')
            : undefined;
        const challenge = verifier
            ? createHash('sha256')
                .update(verifier)
                .digest('base64url')
            : undefined;

        const secure = config.redirectUri.startsWith('https://');
        response.cookie('oauth_state', state, {
            ...OAUTH_COOKIE_OPTIONS,
            secure,
        });
        if (verifier) {
            response.cookie('oauth_verifier', verifier, {
                ...OAUTH_COOKIE_OPTIONS,
                secure,
            });
        }

        const authorizationUrl = new URL(config.authorizationUrl);
        const authorizationParams = new URLSearchParams({
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            response_type: 'code',
            scope: 'openid profile email',
            state,
        });
        if (challenge) {
            authorizationParams.set('code_challenge', challenge);
            authorizationParams.set('code_challenge_method', 'S256');
        }
        authorizationUrl.search = authorizationParams.toString();

        return response.redirect(authorizationUrl.toString());
    }

    async finishOAuth(
        providerName: string,
        request: Request,
        response: Response,
        code?: string,
        state?: string,
    ) {
        const frontendUrl = this.getFrontendUrl();
        const provider = this.getProvider(providerName);
        let failureCode = 'provider_error';

        try {
            const config = this.getOAuthConfig(provider);
            const cookies = this.parseCookies(request.headers.cookie);
            const savedState = cookies.oauth_state;
            const verifier = cookies.oauth_verifier;

            response.clearCookie('oauth_state', {
                ...OAUTH_COOKIE_OPTIONS,
                secure: config.redirectUri.startsWith('https://'),
            });
            response.clearCookie('oauth_verifier', {
                ...OAUTH_COOKIE_OPTIONS,
                secure: config.redirectUri.startsWith('https://'),
            });

            failureCode = 'state_error';
            if (!code || !state || !savedState ||
                (provider === 'google' && !verifier) ||
                !this.safeEqual(state, savedState)) {
                throw new UnauthorizedException('Invalid OAuth state');
            }

            failureCode = 'token_exchange_failed';
            const tokenParams: Record<string, string> = {
                grant_type: 'authorization_code',
                code,
                redirect_uri: config.redirectUri,
                client_id: config.clientId,
                client_secret: config.clientSecret,
            };
            if (provider === 'google' && verifier) {
                tokenParams.code_verifier = verifier;
            }

            const tokenResponse = await axios.post<{
                access_token: string;
            }>(
                config.tokenUrl,
                new URLSearchParams(tokenParams).toString(),
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    timeout: 10_000,
                },
            );

            failureCode = 'profile_fetch_failed';
            const profileResponse = await axios.get<OAuthProfile>(
                config.userInfoUrl,
                {
                    headers: {
                        Authorization: `Bearer ${tokenResponse.data.access_token}`,
                    },
                    timeout: 10_000,
                },
            );
            const profile = profileResponse.data;

            failureCode = 'profile_missing';
            if (!profile.sub) {
                throw new UnauthorizedException(
                    'Provider did not return a member identifier',
                );
            }

            failureCode = 'account_lookup_failed';
            const providerField = provider === 'google'
                ? 'googleId'
                : 'linkedinId';
            let user = await this.usersService.findByOAuthId(
                providerField,
                profile.sub,
            );

            if (!user) {
                failureCode = 'email_not_shared';
                if (!profile.email) {
                    throw new UnauthorizedException(
                        'Provider did not share an email address',
                    );
                }

                user = await this.usersService.findByEmail(profile.email);
                if (user) {
                    failureCode = 'email_unverified';
                    if (profile.email_verified !== true) {
                        throw new UnauthorizedException(
                            'Cannot link an existing account without a verified provider email',
                        );
                    }

                    if (user.password) {
                        failureCode = 'account_conflict';
                        throw new ConflictException(
                            'An account with this email already exists. Sign in using its existing method; it will not be linked automatically.',
                        );
                    }

                    if (user[providerField] && user[providerField] !== profile.sub) {
                        failureCode = 'account_conflict';
                        throw new ConflictException(
                            'This email is linked to a different social account',
                        );
                    }
                    user[providerField] = profile.sub;
                    await user.save();
                } else {
                    failureCode = 'account_creation_failed';
                    user = await this.usersService.createOAuthUser(
                        profile.name?.trim() || profile.email.split('@')[0],
                        profile.email,
                        providerField,
                        profile.sub,
                    );
                }
            }

            failureCode = 'session_creation_failed';
            if (!user) {
                throw new UnauthorizedException('Unable to find or create user');
            }

            const result = await this.createLoginResult(user);
            const fragment = new URLSearchParams({
                accessToken: result.accessToken,
                user: JSON.stringify(result.user),
                achievementsUnlocked: JSON.stringify(
                    result.achievementsUnlocked,
                ),
            });
            return response.redirect(
                `${frontendUrl}/auth/callback#${fragment.toString()}`,
            );
        } catch (error) {
            const status = axios.isAxiosError(error)
                ? error.response?.status
                : undefined;
            this.logger.warn(
                `OAuth ${provider} callback failed (${failureCode}; ${error instanceof Error ? error.name : 'Unknown error'}; status ${status ?? 'unknown'})`,
            );
            return response.redirect(
                `${frontendUrl}/auth/callback?error=${failureCode}`,
            );
        }
    }

    private async createLoginResult(user: UserDocument) {
        const newlyUnlocked =
            await this.achievementsService.processLogin(user);
        const token = await this.jwtService.signAsync({
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
                profileCompleted: user.profileCompleted,
            },
            achievementsUnlocked: newlyUnlocked,
        };
    }

    private getProvider(provider: string): OAuthProvider {
        if (provider !== 'google' && provider !== 'linkedin') {
            throw new UnauthorizedException('Unsupported OAuth provider');
        }
        return provider;
    }

    private getOAuthConfig(provider: OAuthProvider) {
        const prefix = provider === 'google' ? 'GOOGLE' : 'LINKEDIN';
        const clientId = process.env[`${prefix}_CLIENT_ID`];
        const clientSecret = process.env[`${prefix}_CLIENT_SECRET`];
        const backendUrl = (process.env.BACKEND_URL ||
            `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, '');
        const redirectUri = process.env[`${prefix}_REDIRECT_URI`] ||
            `${backendUrl}/api/auth/${provider}/callback`;

        if (!clientId || !clientSecret) {
            throw new ServiceUnavailableException(
                `${provider} login is not configured`,
            );
        }

        return {
            clientId,
            clientSecret,
            redirectUri,
            authorizationUrl: provider === 'google'
                ? 'https://accounts.google.com/o/oauth2/v2/auth'
                : 'https://www.linkedin.com/oauth/v2/authorization',
            tokenUrl: provider === 'google'
                ? 'https://oauth2.googleapis.com/token'
                : 'https://www.linkedin.com/oauth/v2/accessToken',
            userInfoUrl: provider === 'google'
                ? 'https://openidconnect.googleapis.com/v1/userinfo'
                : 'https://api.linkedin.com/v2/userinfo',
        };
    }

    private getFrontendUrl() {
        return (process.env.FRONTEND_URL || 'http://localhost:3000')
            .replace(/\/$/, '');
    }

    private parseCookies(cookieHeader?: string) {
        return Object.fromEntries(
            (cookieHeader || '').split(';').map((part) => {
                const separator = part.indexOf('=');
                if (separator < 0) return ['', ''];
                return [
                    part.slice(0, separator).trim(),
                    decodeURIComponent(part.slice(separator + 1).trim()),
                ];
            }),
        );
    }

    private safeEqual(first: string, second: string) {
        const firstBuffer = Buffer.from(first);
        const secondBuffer = Buffer.from(second);
        return firstBuffer.length === secondBuffer.length &&
            timingSafeEqual(firstBuffer, secondBuffer);
    }
}
