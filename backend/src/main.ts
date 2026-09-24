import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import dns from 'node:dns';

dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') || 5000;

  const frontendUrl =
    configService.get<string>('FRONTEND_URL');

  const allowedOrigins = [
    'http://localhost:3000',
    frontendUrl,
  ].filter(Boolean);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  await app.listen(port, '0.0.0.0');

  console.log(`Backend running on port ${port}`);
}

bootstrap();