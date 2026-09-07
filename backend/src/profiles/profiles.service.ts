import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import * as mammoth from 'mammoth';

import axios from 'axios';

import FormData from 'form-data';

import { ConfigService } from '@nestjs/config';

import {
    Profile,
    ProfileDocument,
} from './schemas/profile.schema';

import {
    User,
    UserDocument,
} from '../users/schemas/user.schema';

import {
    CreateProfileDto,
} from './dto/create-profile.dto';


@Injectable()
export class ProfilesService {

    constructor(

        @InjectModel(Profile.name)
        private readonly profileModel:
            Model<ProfileDocument>,

        @InjectModel(User.name)
        private readonly userModel:
            Model<UserDocument>,

        private readonly configService:
            ConfigService,


    ) { }


    /*
    ==========================================
    CREATE / UPDATE PROFILE
    ==========================================
    */

    async createProfile(
        userId: string,
        dto: CreateProfileDto,
    ) {

        const profile =
            await this.profileModel.findOneAndUpdate(

                {
                    userId,
                },

                {
                    userId,
                    ...dto,
                },

                {
                    new: true,
                    upsert: true,
                },

            );

        await this.userModel.findByIdAndUpdate(
            userId,
            {
                profileCompleted: true,
            },
        );

        return profile;
    }


    /*
    ==========================================
    GET PROFILE
    ==========================================
    */

    async getProfile(
        userId: string,
    ) {

        return this.profileModel.findOne({
            userId,
        });
    }


    /*
    ==========================================
    EXTRACT SKILLS FROM TEXT
    ==========================================
    */

    private extractSkillsFromText(
        text: string,
    ): string[] {

        const skills: string[] = [];

        const normalizedText =
            text
                .toLowerCase()
                .replace(/\s+/g, ' ');


        const skillPatterns = [

            /*
            FRONTEND
            */

            {
                skill: 'HTML',
                pattern: /\bhtml5?\b/i,
            },

            {
                skill: 'CSS',
                pattern: /\bcss3?\b/i,
            },

            {
                skill: 'JavaScript',
                pattern: /\bjavascript\b|\bjs\b/i,
            },

            {
                skill: 'TypeScript',
                pattern: /\btypescript\b|\bts\b/i,
            },

            {
                skill: 'React',
                pattern: /\breact\.?js\b|\breactjs\b|\breact\b/i,
            },

            {
                skill: 'Next.js',
                pattern: /\bnext\.?js\b|\bnextjs\b/i,
            },

            {
                skill: 'Angular',
                pattern: /\bangular\b/i,
            },

            {
                skill: 'Vue.js',
                pattern: /\bvue\.?js\b|\bvuejs\b|\bvue\b/i,
            },

            {
                skill: 'Redux',
                pattern: /\bredux\b/i,
            },

            {
                skill: 'Redux Toolkit',
                pattern: /\bredux toolkit\b|\brtk\b/i,
            },

            {
                skill: 'Tailwind CSS',
                pattern: /\btailwind\b|\btailwind css\b/i,
            },

            {
                skill: 'Bootstrap',
                pattern: /\bbootstrap\b/i,
            },


            /*
            BACKEND
            */

            {
                skill: 'Node.js',
                pattern: /\bnode\.?js\b|\bnodejs\b/i,
            },

            {
                skill: 'Express.js',
                pattern: /\bexpress\.?js\b|\bexpressjs\b|\bexpress\b/i,
            },

            {
                skill: 'NestJS',
                pattern: /\bnest\.?js\b|\bnestjs\b/i,
            },

            {
                skill: 'REST API',
                pattern: /\brest api\b|\brestful api\b/i,
            },

            {
                skill: 'GraphQL',
                pattern: /\bgraphql\b/i,
            },


            /*
            DATABASE
            */

            {
                skill: 'MongoDB',
                pattern: /\bmongodb\b|\bmongo db\b/i,
            },

            {
                skill: 'MySQL',
                pattern: /\bmysql\b/i,
            },

            {
                skill: 'PostgreSQL',
                pattern: /\bpostgresql\b|\bpostgres\b/i,
            },

            {
                skill: 'Firebase',
                pattern: /\bfirebase\b/i,
            },

            {
                skill: 'SQLite',
                pattern: /\bsqlite\b/i,
            },


            /*
            PROGRAMMING LANGUAGES
            */

            {
                skill: 'Python',
                pattern: /\bpython\b/i,
            },

            {
                skill: 'Java',
                pattern: /\bjava\b(?!script)/i,
            },

            {
                skill: 'C++',
                pattern: /\bc\+\+\b|\bc plus plus\b/i,
            },

            {
                skill: 'C#',
                pattern: /\bc#\b|\bc sharp\b/i,
            },

            {
                skill: 'C',
                pattern: /\bc programming\b|\blanguage c\b/i,
            },

            {
                skill: 'PHP',
                pattern: /\bphp\b/i,
            },

            {
                skill: 'Kotlin',
                pattern: /\bkotlin\b/i,
            },

            {
                skill: 'Swift',
                pattern: /\bswift\b/i,
            },

            {
                skill: 'Go',
                pattern: /\bgolang\b|\bgo programming\b/i,
            },

            {
                skill: 'Ruby',
                pattern: /\bruby\b/i,
            },


            /*
            TOOLS
            */

            {
                skill: 'Git',
                pattern: /\bgit\b/i,
            },

            {
                skill: 'GitHub',
                pattern: /\bgithub\b/i,
            },

            {
                skill: 'Docker',
                pattern: /\bdocker\b/i,
            },

            {
                skill: 'Kubernetes',
                pattern: /\bkubernetes\b|\bk8s\b/i,
            },

            {
                skill: 'Postman',
                pattern: /\bpostman\b/i,
            },


            /*
            CLOUD
            */

            {
                skill: 'AWS',
                pattern: /\baws\b|\bamazon web services\b/i,
            },

            {
                skill: 'Azure',
                pattern: /\bazure\b/i,
            },

            {
                skill: 'Google Cloud',
                pattern: /\bgoogle cloud\b|\bgcp\b/i,
            },


            /*
            DATA / AI
            */

            {
                skill: 'Machine Learning',
                pattern: /\bmachine learning\b/i,
            },

            {
                skill: 'Deep Learning',
                pattern: /\bdeep learning\b/i,
            },

            {
                skill: 'Data Analysis',
                pattern: /\bdata analysis\b|\bdata analytics\b/i,
            },

            {
                skill: 'Pandas',
                pattern: /\bpandas\b/i,
            },

            {
                skill: 'NumPy',
                pattern: /\bnumpy\b/i,
            },

            {
                skill: 'TensorFlow',
                pattern: /\btensorflow\b/i,
            },

            {
                skill: 'PyTorch',
                pattern: /\bpytorch\b/i,
            },


            /*
            DESIGN
            */

            {
                skill: 'Figma',
                pattern: /\bfigma\b/i,
            },

        ];


        for (
            const item of skillPatterns
        ) {

            if (
                item.pattern.test(
                    normalizedText,
                )
            ) {

                skills.push(
                    item.skill,
                );
            }
        }


        return [
            ...new Set(skills),
        ];
    }



    /*
    ==========================================
    EXTRACT PROGRAMMING LANGUAGES
    ==========================================
    */

    private extractProgrammingLanguages(
        skills: string[],
    ): string[] {

        const languages = [

            'JavaScript',
            'TypeScript',
            'Python',
            'Java',
            'C++',
            'C#',
            'C',
            'PHP',
            'Kotlin',
            'Swift',
            'Go',
            'Ruby',

        ];

        return skills.filter(
            (skill) =>
                languages.includes(skill),
        );
    }


    /*
    ==========================================
    EXTRACT OTHER RESUME INFORMATION
    ==========================================
    */

    private extractResumeInformation(
        text: string,
    ) {

        const result: {
            education?: string;
            college?: string;
            graduationYear?: number;
            bio?: string;
        } = {};


        const normalizedText =
            text.replace(/\s+/g, ' ');


        /*
        ------------------------------------------
        EDUCATION
        ------------------------------------------
        */

        const educationPatterns = [

            /Bachelor of Technology/i,

            /Bachelor of Engineering/i,

            /B\.?\s?Tech/i,

            /B\.?\s?E\.?/i,

            /Bachelor of Science/i,

            /B\.?\s?Sc/i,

            /Master of Technology/i,

            /M\.?\s?Tech/i,

            /Master of Science/i,

            /M\.?\s?Sc/i,

            /Master of Business Administration/i,

            /\bMBA\b/i,

            /Diploma/i,

        ];


        for (
            const pattern of educationPatterns
        ) {

            const match =
                normalizedText.match(pattern);

            if (match) {

                result.education =
                    match[0];

                break;
            }
        }


        /*
        ------------------------------------------
        GRADUATION YEAR
        ------------------------------------------
        */

        const years =
            normalizedText.match(
                /\b(19[8-9][0-9]|20[0-4][0-9])\b/g,
            );


        if (years?.length) {

            const yearNumbers =
                years.map(Number);

            result.graduationYear =
                Math.max(
                    ...yearNumbers,
                );
        }


        /*
        ------------------------------------------
        COLLEGE / UNIVERSITY
        ------------------------------------------
        */

        const collegePatterns = [

            /[A-Z][A-Za-z\s,&.-]{3,80}University/i,

            /[A-Z][A-Za-z\s,&.-]{3,80}College/i,

            /[A-Z][A-Za-z\s,&.-]{3,80}Institute of Technology/i,

            /[A-Z][A-Za-z\s,&.-]{3,80}Institute/i,

        ];


        for (
            const pattern of collegePatterns
        ) {

            const match =
                normalizedText.match(pattern);

            if (match) {

                result.college =
                    match[0]
                        .replace(/\s+/g, ' ')
                        .trim();

                break;
            }
        }


        /*
        ------------------------------------------
        BIO / SUMMARY
        ------------------------------------------
        */

        const summaryMatch =
            normalizedText.match(

                /(?:SUMMARY|PROFILE|ABOUT ME|OBJECTIVE|PROFESSIONAL SUMMARY)\s*[:\-]?\s*(.{40,500}?)(?=(?:EDUCATION|SKILLS|EXPERIENCE|PROJECTS|CERTIFICATIONS|TECHNICAL SKILLS|$))/i,

            );


        if (summaryMatch) {

            result.bio =
                summaryMatch[1]
                    .trim()
                    .substring(
                        0,
                        500,
                    );
        }


        return result;
    }


    /*
    ==========================================
    OCR.SPACE CLOUD OCR
    ==========================================
    */

    private async extractTextUsingCloudOCR(
        file: any,
    ): Promise<string> {

        console.log(
            '\n========== STARTING CLOUD OCR ==========\n',
        );

        const apiKey =
            this.configService.get<string>(
                'OCR_SPACE_API_KEY',
            );

        if (!apiKey) {

            throw new InternalServerErrorException(
                'OCR_SPACE_API_KEY is missing in .env file.',
            );
        }

        if (!file?.buffer) {

            throw new BadRequestException(
                'Uploaded resume buffer is missing.',
            );
        }


        console.log(
            'File:',
            file.originalname,
        );

        console.log(
            'Size:',
            file.size,
        );


        const formData =
            new FormData();


        /*
        ADD FILE
        */

        formData.append(
            'file',
            file.buffer,
            {
                filename:
                    file.originalname,
                contentType:
                    file.mimetype ||
                    'application/pdf',
            },
        );


        /*
        OCR OPTIONS
        */

        formData.append(
            'language',
            'eng',
        );

        formData.append(
            'OCREngine',
            '2',
        );

        formData.append(
            'detectOrientation',
            'true',
        );

        formData.append(
            'scale',
            'true',
        );


        try {

            const response =
                await axios.post(

                    'https://api.ocr.space/parse/image',

                    formData,

                    {
                        headers: {

                            ...formData.getHeaders(),

                            apikey:
                                apiKey,

                        },

                        timeout:
                            180000,

                        maxBodyLength:
                            Infinity,

                        maxContentLength:
                            Infinity,
                    },

                );


            console.log(
                '\n========== OCR RESPONSE ==========\n',
            );

            console.log(
                JSON.stringify(
                    response.data,
                    null,
                    2,
                ),
            );


            const data =
                response.data;


            /*
            CHECK API ERROR
            */

            if (
                data.IsErroredOnProcessing
            ) {

                throw new BadRequestException(

                    data.ErrorMessage ||
                    'OCR failed to process the resume.',

                );
            }


            /*
            GET ALL PAGES TEXT
            */

            const extractedText =
                (data.ParsedResults || [])

                    .map(
                        (page: any) =>
                            page.ParsedText || '',
                    )

                    .join('\n');


            if (
                !extractedText ||
                extractedText.trim().length < 5
            ) {

                throw new BadRequestException(
                    'OCR could not extract readable text from the resume.',
                );
            }


            console.log(
                '\n========== EXTRACTED OCR TEXT ==========\n',
            );

            console.log(
                extractedText,
            );


            console.log(
                '\n========== OCR TEXT LENGTH ==========\n',
            );

            console.log(
                extractedText.length,
            );


            return extractedText;

        } catch (error: any) {

            console.error(
                '\n========== CLOUD OCR ERROR ==========\n',
            );

            console.error(
                'Message:',
                error.message,
            );

            console.error(
                'Code:',
                error.code,
            );

            console.error(
                'Response:',
                error.response?.data,
            );


            if (
                error instanceof
                BadRequestException
            ) {

                throw error;
            }


            throw new InternalServerErrorException(
                error.message ||
                'Unable to extract text using Cloud OCR.',
            );
        }
    }


    /*
    ==========================================
    RESUME EXTRACTION
    + AUTOMATIC DATABASE UPDATE
    ==========================================
    */

    async extractResumeAndUpdateProfile(
        userId: string,
        file: any,
    ) {

        /*
        CHECK FILE
        */

        if (!file) {

            throw new BadRequestException(
                'Resume file is required.',
            );
        }


        /*
        CHECK FILE TYPE
        */

        const extension =
            file.originalname
                .split('.')
                .pop()
                ?.toLowerCase();


        if (
            extension !== 'pdf' &&
            extension !== 'docx'
        ) {

            throw new BadRequestException(
                'Only PDF and DOCX files are supported.',
            );
        }


        let extractedText = '';


        /*
        ======================================
        PDF → CLOUD OCR
        ======================================
        */

        if (
            extension === 'pdf'
        ) {

            console.log(
                '\nResume is a PDF.',
            );

            console.log(
                'Sending PDF to Cloud OCR...',
            );


            extractedText =
                await this.extractTextUsingCloudOCR(
                    file,
                );
        }


        /*
        ======================================
        DOCX → MAMMOTH
        ======================================
        */

        if (
            extension === 'docx'
        ) {

            console.log(
                '\nResume is a DOCX file.',
            );


            if (!file.buffer) {

                throw new BadRequestException(
                    'Unable to read DOCX file.',
                );
            }


            const result =
                await mammoth.extractRawText({

                    buffer:
                        file.buffer,

                });


            extractedText =
                result.value;
        }


        /*
        ======================================
        CHECK EXTRACTED TEXT
        ======================================
        */

        if (
            !extractedText ||
            extractedText.trim().length < 5
        ) {

            throw new BadRequestException(
                'Unable to extract readable text from this resume.',
            );
        }


        /*
        ======================================
        EXTRACT SKILLS
        ======================================
        */

        const extractedSkills =
            this.extractSkillsFromText(
                extractedText,
            );


        console.log(
            '\n========== DETECTED SKILLS ==========\n',
        );

        console.log(
            extractedSkills,
        );


        /*
        ======================================
        EXTRACT PROGRAMMING LANGUAGES
        ======================================
        */

        const extractedLanguages =
            this.extractProgrammingLanguages(
                extractedSkills,
            );


        console.log(
            '\n========== PROGRAMMING LANGUAGES ==========\n',
        );

        console.log(
            extractedLanguages,
        );


        /*
        ======================================
        EXTRACT OTHER INFORMATION
        ======================================
        */

        const extractedData =
            this.extractResumeInformation(
                extractedText,
            );


        console.log(
            '\n========== DETECTED RESUME DATA ==========\n',
        );

        console.log(
            extractedData,
        );


        /*
        ======================================
        FIND PROFILE
        ======================================
        */

        const profile =
            await this.profileModel.findOne({

                userId,

            });


        if (!profile) {

            throw new NotFoundException(
                'Profile not found. Please create your profile first.',
            );
        }


        /*
        ======================================
        MERGE SKILLS
        ======================================
        */

        profile.skills = [

            ...new Set([

                ...(profile.skills || []),

                ...extractedSkills,

            ]),

        ];


        /*
        ======================================
        MERGE PROGRAMMING LANGUAGES
        ======================================
        */

        profile.programmingLanguages = [

            ...new Set([

                ...(profile.programmingLanguages || []),

                ...extractedLanguages,

            ]),

        ];


        /*
        ======================================
        UPDATE EDUCATION
        ONLY IF CURRENTLY EMPTY
        ======================================
        */

        if (
            extractedData.education &&
            !profile.education
        ) {

            profile.education =
                extractedData.education;
        }


        /*
        ======================================
        UPDATE COLLEGE
        ONLY IF CURRENTLY EMPTY
        ======================================
        */

        if (
            extractedData.college &&
            !profile.college
        ) {

            profile.college =
                extractedData.college;
        }


        /*
        ======================================
        UPDATE GRADUATION YEAR
        ======================================
        */

        if (
            extractedData.graduationYear &&
            (
                !profile.graduationYear ||
                profile.graduationYear === 0
            )
        ) {

            profile.graduationYear =
                extractedData.graduationYear;
        }


        /*
        ======================================
        UPDATE BIO
        ONLY IF CURRENTLY EMPTY
        ======================================
        */

        if (
            extractedData.bio &&
            !profile.bio
        ) {

            profile.bio =
                extractedData.bio;
        }


        /*
        ======================================
        SAVE RESUME FILE NAME
        ======================================
        */

        profile.resumeFileName =
            file.originalname;


        /*
        ======================================
        SAVE TO MONGODB
        ======================================
        */

        const updatedProfile =
            await profile.save();


        /*
        ======================================
        RESPONSE
        ======================================
        */

        return {

            message:
                'Resume analyzed and profile updated successfully.',

            extractedSkills,

            extractedLanguages,

            extractedData,

            profile:
                updatedProfile,

        };
    }


    /*
    ==========================================
    UPDATE PROFILE USING GITHUB DATA
    ==========================================

    Keep this for the GitHub feature later.
    */

    async updateProfileFromGithub(
        userId: string,

        githubData: {

            githubUsername: string;

            repositories: string[];

            languages: string[];

            skills: string[];

        },
    ) {


        const profile =
            await this.profileModel.findOne({

                userId,

            });


        if (!profile) {

            throw new NotFoundException(
                'Profile not found. Please create your profile first.',
            );
        }


        /*
        MERGE SKILLS
        */

        profile.skills = [

            ...new Set([

                ...(profile.skills || []),

                ...(githubData.skills || []),

            ]),

        ];


        /*
        MERGE PROGRAMMING LANGUAGES
        */

        profile.programmingLanguages = [

            ...new Set([

                ...(profile.programmingLanguages || []),

                ...(githubData.languages || []),

            ]),

        ];


        /*
        UPDATE GITHUB USERNAME
        */

        profile.githubUsername =
            githubData.githubUsername;


        /*
        UPDATE REPOSITORIES
        */

        profile.githubRepositories =
            githubData.repositories || [];


        const updatedProfile =
            await profile.save();


        return {

            message:
                'GitHub analyzed and profile updated successfully.',

            extractedData:
                githubData,

            profile:
                updatedProfile,

        };
    }
    private extractGithubUsername(
        githubUrl: string,
    ): string {

        let username =
            githubUrl.trim();


        /*
            REMOVE FULL URL
        */

        username =
            username.replace(
                /^https?:\/\/(www\.)?github\.com\//i,
                '',
            );


        /*
            REMOVE TRAILING SLASH
        */

        username =
            username.replace(
                /\/$/,
                '',
            );


        /*
            HANDLE @username
        */

        username =
            username.replace(
                /^@/,
                '',
            );


        /*
            IF USER PASTES A REPOSITORY URL
    
            github.com/user/repository
    
            TAKE ONLY USERNAME
        */

        username =
            username.split('/')[0];


        return username;
    }
    /*skill maping */
    private getSkillsFromGithubLanguages(
        languages: string[],
    ): string[] {

        const languageSkillMap:
            Record<string, string[]> = {

            JavaScript: [
                'JavaScript',
            ],

            TypeScript: [
                'TypeScript',
            ],

            Python: [
                'Python',
            ],

            Java: [
                'Java',
            ],

            'C++': [
                'C++',
            ],

            'C#': [
                'C#',
            ],

            PHP: [
                'PHP',
            ],

            Ruby: [
                'Ruby',
            ],

            Go: [
                'Go',
            ],

            Kotlin: [
                'Kotlin',
            ],

            Swift: [
                'Swift',
            ],

            HTML: [
                'HTML',
            ],

            CSS: [
                'CSS',
            ],

            Vue: [
                'Vue.js',
            ],

            Dart: [
                'Dart',
            ],

            Rust: [
                'Rust',
            ],

        };


        const skills =
            languages.flatMap(
                (language) =>
                    languageSkillMap[
                    language
                    ] || [],
            );


        return [
            ...new Set(skills),
        ];
    }

    /*github sync method*/
    async syncGithubProfile(
        userId: string,
        githubUrl: string,
    ) {

        console.log(
            '\n========== GITHUB SYNC STARTED ==========\n',
        );


        /*
            EXTRACT USERNAME
        */

        const githubUsername =
            this.extractGithubUsername(
                githubUrl,
            );


        if (!githubUsername) {

            throw new BadRequestException(
                'Invalid GitHub username or URL.',
            );
        }


        console.log(
            'GitHub Username:',
            githubUsername,
        );


        try {

            /*
                GET USER INFORMATION
            */

            const userResponse =
                await axios.get(
                    `https://api.github.com/users/${githubUsername}`,
                    {
                        headers: {
                            Accept:
                                'application/vnd.github+json',
                        },
                    },
                );


            const githubUser =
                userResponse.data;


            /*
                GET REPOSITORIES
            */

            const repositoriesResponse =
                await axios.get(
                    `https://api.github.com/users/${githubUsername}/repos`,
                    {
                        params: {
                            per_page: 100,
                            sort: 'updated',
                        },

                        headers: {
                            Accept:
                                'application/vnd.github+json',
                        },
                    },
                );


            const repositories =
                repositoriesResponse.data;


            /*
                REPOSITORY NAMES
            */

            const repositoryNames =
                repositories.map(
                    (repository: any) =>
                        repository.name,
                );


            /*
                STORE LANGUAGES
            */

            const languageSet =
                new Set<string>();


            /*
                GET LANGUAGE DATA
                FOR EVERY REPOSITORY
            */

            for (
                const repository
                of repositories
            ) {

                try {

                    const languageResponse =
                        await axios.get(
                            repository.languages_url,
                            {
                                headers: {
                                    Accept:
                                        'application/vnd.github+json',
                                },
                            },
                        );


                    const languages =
                        Object.keys(
                            languageResponse.data,
                        );


                    languages.forEach(
                        (language) => {

                            languageSet.add(
                                language,
                            );

                        },
                    );

                } catch (error) {

                    console.log(
                        `Could not get languages for ${repository.name}`,
                    );
                }
            }


            const programmingLanguages =
                Array.from(
                    languageSet,
                );


            /*
                CONVERT LANGUAGES TO SKILLS
            */

            const githubSkills =
                this.getSkillsFromGithubLanguages(
                    programmingLanguages,
                );


            /*
                GET EXISTING PROFILE
            */

            let profile =
                await this.profileModel.findOne({
                    userId,
                });


            /*
                CREATE PROFILE IF IT DOES NOT EXIST
            */

            if (!profile) {

                profile =
                    await this.profileModel.create({

                        userId,

                        githubUsername,

                        githubRepositories:
                            repositoryNames,

                        programmingLanguages,

                        skills:
                            githubSkills,

                        bio:
                            githubUser.bio || '',

                    });

            } else {

                /*
                    MERGE EXISTING SKILLS
                    WITH GITHUB SKILLS
                */

                const mergedSkills =
                    Array.from(
                        new Set([
                            ...profile.skills,
                            ...githubSkills,
                        ]),
                    );


                /*
                    MERGE LANGUAGES
                */

                const mergedLanguages =
                    Array.from(
                        new Set([
                            ...profile.programmingLanguages,
                            ...programmingLanguages,
                        ]),
                    );


                /*
                    UPDATE PROFILE
                */

                profile.githubUsername =
                    githubUsername;

                profile.githubRepositories =
                    repositoryNames;

                profile.programmingLanguages =
                    mergedLanguages;

                profile.skills =
                    mergedSkills;


                /*
                    UPDATE BIO ONLY
                    IF PROFILE BIO IS EMPTY
                */

                if (
                    !profile.bio &&
                    githubUser.bio
                ) {

                    profile.bio =
                        githubUser.bio;
                }


                await profile.save();
            }


            /*
                MARK PROFILE COMPLETED
            */

            await this.userModel.findByIdAndUpdate(
                userId,
                {
                    profileCompleted:
                        true,
                },
            );


            console.log(
                '\n========== GITHUB SYNC COMPLETED ==========\n',
            );


            console.log(
                'Repositories:',
                repositoryNames,
            );


            console.log(
                'Languages:',
                programmingLanguages,
            );


            console.log(
                'Skills:',
                githubSkills,
            );


            return {

                message:
                    'GitHub profile synced successfully.',

                githubUsername,

                repositories:
                    repositoryNames,

                extractedLanguages:
                    programmingLanguages,

                extractedSkills:
                    githubSkills,

                profile,

            };

        } catch (error: any) {

            console.error(
                '\n========== GITHUB SYNC ERROR ==========\n',
            );

            console.error(
                error.response?.data ||
                error.message,
            );


            if (
                error.response?.status === 404
            ) {

                throw new NotFoundException(
                    'GitHub user not found.',
                );
            }


            throw new InternalServerErrorException(
                'Unable to sync GitHub profile.',
            );
        }
    }
}