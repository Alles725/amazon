import { ConsoleLogger, Injectable, LoggerService, Scope } from '@nestjs/common';
import { RequestContextStore } from './request-context';

const LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const;
type Level = (typeof LEVELS)[number];

/**
 * One JSON object per line on stdout — the shape container log collectors expect.
 * The request/correlation id is pulled from AsyncLocalStorage, so call sites do
 * not have to thread it through every function signature.
 */
@Injectable({ scope: Scope.DEFAULT })
export class StructuredLogger implements LoggerService {
  private threshold = LEVELS.indexOf('info');

  setLevel(level: Level): void {
    this.threshold = LEVELS.indexOf(level);
  }

  private write(level: Level, message: unknown, context?: string, extra?: object) {
    if (LEVELS.indexOf(level) > this.threshold) return;
    const ctx = RequestContextStore.get();
    process.stdout.write(
      `${JSON.stringify({
        time: new Date().toISOString(),
        level,
        message: typeof message === 'string' ? message : JSON.stringify(message),
        context,
        requestId: ctx?.requestId,
        userId: ctx?.userId,
        ...extra,
      })}\n`,
    );
  }

  log(message: unknown, context?: string) { this.write('info', message, context); }
  error(message: unknown, stack?: string, context?: string) {
    this.write('error', message, context, stack ? { stack } : undefined);
  }
  warn(message: unknown, context?: string) { this.write('warn', message, context); }
  debug(message: unknown, context?: string) { this.write('debug', message, context); }
  verbose(message: unknown, context?: string) { this.write('trace', message, context); }
  fatal(message: unknown, context?: string) { this.write('fatal', message, context); }
}

/** Kept for the pre-bootstrap window, before config is validated. */
export const bootstrapLogger = new ConsoleLogger('Bootstrap');
