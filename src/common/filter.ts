import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as moment from 'moment';
import { ResponseDto } from './dto';
import { PostgresError } from 'postgres';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp(),
      response = ctx.getResponse<any>(),
      request = ctx.getRequest<Request>();

    let message: string = '';
    let code: number = 400;
    let data: object = null;
    if (
      exception instanceof HttpException ||
      exception instanceof BadRequestException ||
      exception instanceof UnauthorizedException ||
      exception instanceof NotFoundException ||
      exception instanceof ForbiddenException
    ) {
      message = exception.message;
      code = exception.getStatus();
    } else if (exception instanceof PostgresError) {
      this.errorLog(
        `Route: ${request.method} ${moment().format()} ${request.url}\nError: ${
          exception.stack
        }`,
      );
      message = Object.values(exception['errors'])[0]['message'];
      if (process.env.NODE_ENV === 'production')
        message = 'something went wrong! Please try again later';
    } else if (exception instanceof HttpException) {
      this.errorLog(
        `Route: ${request.method} ${moment().format()} ${request.url}\nError: ${
          exception.stack
        }`,
      );
      message = exception.message;
      code = exception.getStatus();
    } else {
      this.errorLog(
        `CRITICAL Route: ${request.method} ${moment().format()} ${
          request.url
        }\nError: ${exception.stack}`,
      );
      message = exception.message;
      if (process.env.NODE_ENV === 'production')
        message = 'something went wrong! Please try again later';
    }

    const responseData: ResponseDto = {
      code,
      success: false,
      message: message,
      data,
    };
    response.status(code).send(responseData);
  }

  private errorLog = (errorString): void => {
    Logger.error(errorString);
  };
}
