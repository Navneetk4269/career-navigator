
import {
    ArrayMaxSize,
    IsArray,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class CreateProfileDto {

    /*
        EDUCATION
    */

    @IsOptional()
    @IsString()
    @MaxLength(200)
    education?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    college?: string;

    @IsOptional()
    @IsInt()
    graduationYear?: number;


    /*
        SKILLS
    */

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(50)
    @IsString({ each: true })
    @MaxLength(50, { each: true })
    skills?: string[];

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(50)
    @IsString({ each: true })
    @MaxLength(50, { each: true })
    interests?: string[];


    /*
       job description
    */

    @IsOptional()
    @IsString()
    @MaxLength(5000)
    jobDescription?: string;

    @IsOptional()
    @IsInt()
    learningHoursPerWeek?: number;


    /*
        GITHUB
    */

    @IsOptional()
    @IsString()
    @MaxLength(39)
    githubUsername?: string;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(50)
    @IsString({ each: true })
    @MaxLength(200, { each: true })
    githubRepositories?: string[];

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(50)
    @IsString({ each: true })
    @MaxLength(50, { each: true })
    programmingLanguages?: string[];


    /*
        RESUME
    */

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    bio?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    resumeFileName?: string;
}