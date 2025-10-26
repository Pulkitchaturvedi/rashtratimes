import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PinoLogger } from './pino-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        this.logger.log(`${req.method} ${req.url} ${resStatus(context)} ${duration}ms`);
      })
    );
  }
}

function resStatus(context: ExecutionContext) {
  const res = context.switchToHttp().getResponse();
  return res?.statusCode ?? 200;
}
