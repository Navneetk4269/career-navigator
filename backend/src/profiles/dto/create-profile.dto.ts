import {
    IsArray,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateProfileDto {
    @IsString()
    @IsNotEmpty()
    education!: string;

    @IsString()
    @IsNotEmpty()
    college!: string;

    @IsInt()
    graduationYear!: number;

    @IsArray()
    skills!: string[];

    @IsArray()
    interests!: string[];

    @IsString()
    @IsNotEmpty()
    careerGoal!: string;

    @IsOptional()
    @IsInt()
    learningHoursPerWeek?: number;
}