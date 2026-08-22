import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';
import { RequestContextStore } from './request-context';

export const REQUEST_ID_HEADER = 'x-request-id';

/** Honours an inbound correlation id (from the Ingress) or mints a new one. */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const inbound = req.header(REQUEST_ID_HEADER);
    const requestId = inbound && inbound.length <= 128 ? inbound : randomUUID();
    res.setHeader(REQUEST_ID_HEADER, requestId);
    RequestContextStore.run({ requestId }, () => next());
  }
}
