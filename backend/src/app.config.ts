import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NotFoundErrorFilter } from './common/filters/not-found-error.filter';
import { japaneseValidationExceptionFactory } from './common/validation/japanese-validation-exception-factory';

export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: japaneseValidationExceptionFactory,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new NotFoundErrorFilter());
}
