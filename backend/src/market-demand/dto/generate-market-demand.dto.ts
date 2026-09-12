import { IsOptional, IsString } from 'class-validator';

export class GenerateMarketDemandDto {

    @IsOptional()
    @IsString()
    career?: string;

}