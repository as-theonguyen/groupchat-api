import { NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { NotFoundExceptionFilter } from './exception-filters/not-found.exception-filter';

export const initialize = async (options?: NestApplicationOptions) => {
  const app = await NestFactory.create(AppModule, options);

  app.enableCors({
    origin: '*',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  app.useGlobalFilters(new NotFoundExceptionFilter());

  app.setGlobalPrefix('api');

  return app;
};
