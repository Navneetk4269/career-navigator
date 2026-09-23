import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import {
    User,
    UserDocument,
} from '../users/schemas/user.schema';

import {
    Career,
    CareerDocument,
} from '../careers/schemas/career.schema';

@Injectable()
export class AchievementsService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,

        @InjectModel(Career.name)
        private readonly careerModel: Model<CareerDocument>,
    ) {}

    // ==========================================
    // ACHIEVEMENT DEFINITIONS
    // ==========================================

    private readonly achievementDefinitions = [
        {
            id: 'first-login',
            title: 'First Login',
            description:
                'You logged into Career Navigator for the first time.',
            icon: '🔑',
        },

        {
            id: 'three-day-streak',
            title: '3 Day Streak',
            description:
                'You logged in for 3 consecutive days.',
            icon: '🔥',
        },

        {
            id: 'seven-day-streak',
            title: '7 Day Streak',
            description:
                'You logged in for 7 consecutive days.',
            icon: '🔥',
        },

        {
            id: 'fourteen-day-streak',
            title: '14 Day Streak',
            description:
                'You logged in for 14 consecutive days.',
            icon: '🚀',
        },

        {
            id: 'thirty-day-streak',
            title: '30 Day Streak',
            description:
                'You logged in for 30 consecutive days.',
            icon: '🏆',
        },

        {
            id: 'first-task',
            title: 'First Task',
            description:
                'You completed your first roadmap task.',
            icon: '✅',
        },

        {
            id: 'three-tasks',
            title: 'Getting Started',
            description:
                'You completed 3 roadmap tasks.',
            icon: '🎯',
        },

        {
            id: 'five-tasks',
            title: 'Making Progress',
            description:
                'You completed 5 roadmap tasks.',
            icon: '🏆',
        },

        {
            id: 'first-skill',
            title: 'First Skill',
            description:
                'You completed your first roadmap skill.',
            icon: '🧠',
        },

        {
            id: 'three-skills',
            title: 'Skill Builder',
            description:
                'You completed 3 roadmap skills.',
            icon: '🎯',
        },

        {
            id: 'five-skills',
            title: 'Skill Master',
            description:
                'You completed 5 roadmap skills.',
            icon: '🏆',
        },
    ];

    // ==========================================
    // GET ALL ACHIEVEMENTS
    // ==========================================

    async getAchievements(userId: string) {
        const user =
            await this.userModel.findById(userId);

        if (!user) {
            throw new NotFoundException(
                'User not found.',
            );
        }

        const unlockedIds = new Set(
            (user.achievements || []).map(
                (achievement) => achievement.id,
            ),
        );

        return {
            loginStreak: user.loginStreak || 0,

            achievements:
                this.achievementDefinitions.map(
                    (achievement) => ({
                        ...achievement,
                        unlocked:
                            unlockedIds.has(
                                achievement.id,
                            ),
                        unlockedAt:
                            user.achievements?.find(
                                (item) =>
                                    item.id ===
                                    achievement.id,
                            )?.unlockedAt || null,
                    }),
                ),
        };
    }

    // ==========================================
    // UNLOCK ACHIEVEMENT
    // ==========================================

    async unlockAchievement(
        user: UserDocument,
        achievementId: string,
    ) {
        const alreadyUnlocked =
            user.achievements?.some(
                (achievement) =>
                    achievement.id ===
                    achievementId,
            );

        if (alreadyUnlocked) {
            return null;
        }

        const definition =
            this.achievementDefinitions.find(
                (achievement) =>
                    achievement.id ===
                    achievementId,
            );

        if (!definition) {
            return null;
        }

        const unlockedAchievement = {
            ...definition,
            unlockedAt: new Date(),
        };

        user.achievements.push(
            unlockedAchievement,
        );

        return unlockedAchievement;
    }

    // ==========================================
    // CHECK LOGIN ACHIEVEMENTS
    // ==========================================

    async processLogin(user: UserDocument) {
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        let streak = user.loginStreak || 0;

        if (!user.lastLoginDate) {
            streak = 1;
        } else {
            const lastLogin =
                new Date(user.lastLoginDate);

            lastLogin.setHours(0, 0, 0, 0);

            const difference =
                today.getTime() -
                lastLogin.getTime();

            const oneDay =
                24 * 60 * 60 * 1000;

            if (difference === oneDay) {
                streak += 1;
            } else if (difference > oneDay) {
                streak = 1;
            }
        }

        user.loginStreak = streak;
        user.lastLoginDate = new Date();

        const newlyUnlocked: {
            id: string;
            title: string;
            description: string;
            icon: string;
            unlockedAt: Date;
        }[] = [];

        if (streak >= 1) {
            const achievement =
                await this.unlockAchievement(
                    user,
                    'first-login',
                );

            if (achievement) {
                newlyUnlocked.push(achievement);
            }
        }

        const streakAchievements = [
            {
                days: 3,
                id: 'three-day-streak',
            },
            {
                days: 7,
                id: 'seven-day-streak',
            },
            {
                days: 14,
                id: 'fourteen-day-streak',
            },
            {
                days: 30,
                id: 'thirty-day-streak',
            },
        ];

        for (const item of streakAchievements) {
            if (streak >= item.days) {
                const achievement =
                    await this.unlockAchievement(
                        user,
                        item.id,
                    );

                if (achievement) {
                    newlyUnlocked.push(
                        achievement,
                    );
                }
            }
        }

        await user.save();

        return newlyUnlocked;
    }

    async processRoadmapCompletion(userId: string) {
        const user = await this.userModel.findById(userId);

        if (!user) {
            throw new NotFoundException('User not found.');
        }

        const career = await this.careerModel.findOne({
            userId,
        });

        if (!career) {
            return [];
        }

        const newlyUnlocked: {
            id: string;
            title: string;
            description: string;
            icon: string;
            unlockedAt: Date;
        }[] = [];

        // ==========================================
        // COMPLETED TASKS
        // ==========================================

        const completedTasks = (
            career.roadmapProgress || []
        ).filter(
            (item) => item.completed === true,
        ).length;

        const taskAchievements = [
            {
                count: 1,
                id: 'first-task',
            },
            {
                count: 3,
                id: 'three-tasks',
            },
            {
                count: 5,
                id: 'five-tasks',
            },
        ];

        for (const item of taskAchievements) {
            if (completedTasks >= item.count) {
                const achievement =
                    await this.unlockAchievement(
                        user,
                        item.id,
                    );

                if (achievement) {
                    newlyUnlocked.push(
                        achievement,
                    );
                }
            }
        }

        // ==========================================
        // COMPLETED SKILLS
        // ==========================================

        const completedPhaseIndexes =
            new Set(
                (career.roadmapProgress || [])
                    .filter(
                        (item) =>
                            item.completed === true,
                    )
                    .map(
                        (item) =>
                            item.phaseIndex,
                    ),
            );

        const completedSkills =
            new Set<string>();

        const roadmap =
            career.selectedRoadmap?.roadmap || [];

        roadmap.forEach(
            (phase: any, phaseIndex: number) => {
                if (
                    completedPhaseIndexes.has(
                        phaseIndex,
                    )
                ) {
                    (phase.skills || []).forEach(
                        (skill: string) => {
                            if (
                                typeof skill ===
                                    'string' &&
                                skill.trim() !== ''
                            ) {
                                completedSkills.add(
                                    skill.trim(),
                                );
                            }
                        },
                    );
                }
            },
        );

        const skillCount =
            completedSkills.size;

        const skillAchievements = [
            {
                count: 1,
                id: 'first-skill',
            },
            {
                count: 3,
                id: 'three-skills',
            },
            {
                count: 5,
                id: 'five-skills',
            },
        ];

        for (const item of skillAchievements) {
            if (skillCount >= item.count) {
                const achievement =
                    await this.unlockAchievement(
                        user,
                        item.id,
                    );

                if (achievement) {
                    newlyUnlocked.push(
                        achievement,
                    );
                }
            }
        }

        await user.save();

        return newlyUnlocked;
    }
}