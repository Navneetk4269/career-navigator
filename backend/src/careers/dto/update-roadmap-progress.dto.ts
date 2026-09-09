import { IsBoolean, IsInt, Min } from 'class-validator';

export class UpdateRoadmapProgressDto {

    @IsInt()
    @Min(0)
    phaseIndex!: number;


    @IsBoolean()
    completed!: boolean;

}