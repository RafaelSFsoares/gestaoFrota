import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { snapshot: true });
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.use(helmet());
  app.enableCors({ origin: true, credentials: true });
  app.use(
    rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_TTL || '60', 10) * 1000,
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Gestão de Frota API')
    .setDescription('API de Gestão de Frota com autenticação JWT, cache Redis e auditoria.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT || 3000);
  console.log(`Listening on ${process.env.PORT || 3000}`);
}

bootstrap();
