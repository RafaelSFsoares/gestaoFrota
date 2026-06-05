import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const responseBody = exception instanceof HttpException ? exception.getResponse() : null;
    let message = 'Internal server error';
    let details: unknown[] = [];

    if (exception instanceof HttpException && responseBody) {
      if (typeof responseBody === 'string') {
        message = responseBody;
      } else if (typeof responseBody === 'object') {
        const body = responseBody as Record<string, unknown>;
        if (Array.isArray(body.message)) {
          details = body.message;
          message = 'Validation failed';
        } else if (typeof body.message === 'string') {
          message = body.message;
        } else if (body.error && typeof body.error === 'string') {
          message = body.error;
        }
      }
    }

    response.status(status).json({
      success: false,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
