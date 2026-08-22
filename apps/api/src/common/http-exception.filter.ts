import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ApiErrorBody, ErrorCode } from '@amazon-mvp/api-contract';
import { Response } from 'express';
import { RequestContextStore } from './request-context';
import { StructuredLogger } from './structured-logger';

interface NestValidationBody {
  message?: string | string[];
  code?: string;
  details?: Array<{ field: string; message: string }>;
}

/**
 * Every error leaves the API in exactly one shape:
 *   { error: { code, message, requestId, details? } }
 * Unexpected errors are logged with the stack but never leak it to the client.
 */
@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: StructuredLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const requestId = RequestContextStore.requestId();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const raw = exception.getResponse();
      const body: NestValidationBody =
        typeof raw === 'string' ? { message: raw } : (raw as NestValidationBody);

      const code = body.code ?? this.defaultCodeFor(status);
      const message = Array.isArray(body.message)
        ? 'Request validation failed'
        : (body.message ?? exception.message);

      const details =
        body.details ??
        (Array.isArray(body.message)
          ? body.message.map((m) => ({ field: this.fieldFromMessage(m), message: m }))
          : undefined);

      if (status >= 500) {
        this.logger.error(`${code}: ${message}`, exception.stack, 'HttpExceptionFilter');
      } else {
        this.logger.warn(`${status} ${code}: ${message}`, 'HttpExceptionFilter');
      }

      const payload: ApiErrorBody = { error: { code, message, requestId, ...(details && { details }) } };
      return response.status(status).json(payload);
    }

    this.logger.error(
      exception instanceof Error ? exception.message : 'Unhandled exception',
      exception instanceof Error ? exception.stack : undefined,
      'HttpExceptionFilter',
    );

    const payload: ApiErrorBody = {
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Something went wrong on our side',
        requestId,
      },
    };
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(payload);
  }

  private defaultCodeFor(status: number): string {
    if (status === HttpStatus.BAD_REQUEST) return ErrorCode.VALIDATION_FAILED;
    if (status === HttpStatus.UNAUTHORIZED) return ErrorCode.AUTH_SESSION_REQUIRED;
    if (status === HttpStatus.NOT_FOUND) return ErrorCode.RESOURCE_NOT_FOUND;
    return ErrorCode.INTERNAL_ERROR;
  }

  /** class-validator messages start with the property name. */
  private fieldFromMessage(message: string): string {
    return message.split(' ')[0] ?? 'unknown';
  }
}
