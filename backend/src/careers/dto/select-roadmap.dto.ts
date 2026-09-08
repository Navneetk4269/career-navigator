import { IsNotEmpty, IsObject } from 'class-validator';

export class SelectRoadmapDto {
    @IsNotEmpty()
    @IsObject()
    recommendation!: any;
}