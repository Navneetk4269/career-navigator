import {
    IsNotEmpty,
    IsString,
} from 'class-validator';


export class GithubSyncDto {

    @IsString()
    @IsNotEmpty()
    githubUrl!: string;

}