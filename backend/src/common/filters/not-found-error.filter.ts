import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { NotFoundError } from '../errors/not-found.error';

@Catch(NotFoundError)
export class NotFoundErrorFilter implements ExceptionFilter {
  catch(exception: NotFoundError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const httpException = new NotFoundException(exception.message);

    response
      .status(httpException.getStatus())
      .json(httpException.getResponse());
  }
}
