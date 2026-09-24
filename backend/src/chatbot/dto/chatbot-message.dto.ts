import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ChatbotMessageDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    message!: string;
}