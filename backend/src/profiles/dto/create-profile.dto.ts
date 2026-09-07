
import {
    IsArray,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateProfileDto {

    /*
        EDUCATION
    */

    @IsOptional()
    @IsString()
    education?: string;

    @IsOptional()
    @IsString()
    college?: string;

    @IsOptional()
    @IsInt()
    graduationYear?: number;


    /*
        SKILLS
    */

    @IsOptional()
    @IsArray()
    skills?: string[];

    @IsOptional()
    @IsArray()
    interests?: string[];


    /*
       job description
    */

    @IsOptional()
    @IsString()
    jobDescription?: string;

    @IsOptional()
    @IsInt()
    learningHoursPerWeek?: number;


    /*
        GITHUB
    */

    @IsOptional()
    @IsString()
    githubUsername?: string;

    @IsOptional()
    @IsArray()
    githubRepositories?: string[];

    @IsOptional()
    @IsArray()
    programmingLanguages?: string[];


    /*
        RESUME
    */

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    resumeFileName?: string;
}