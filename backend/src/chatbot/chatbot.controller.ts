import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';

import { CareersService } from '../careers/careers.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatbotService } from './chatbot.service';
import { ChatbotMessageDto } from './dto/chatbot-message.dto';

@Controller('chatbot')
@UseGuards(JwtAuthGuard)
export class ChatbotController {
    constructor(
        private readonly chatbotService: ChatbotService,
    ) { }

    // ============================================================
    // GET SUGGESTED QUESTIONS
    // ============================================================

    @Get('suggestions')
    async getSuggestions(@Req() req: any) {
        return this.chatbotService.getSuggestedQuestions(
            req.user.userId,
        );
    }

    // ============================================================
    // SEND MESSAGE
    // ============================================================

    @Post('message')
    async sendMessage(
        @Req() req: any,
        @Body() dto: ChatbotMessageDto,
    ) {
        return this.chatbotService.sendMessage(
            req.user.userId,
            dto.message,
        );
    }
}