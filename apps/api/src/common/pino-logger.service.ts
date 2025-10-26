import { Injectable, LoggerService } from '@nestjs/common';
import pino from 'pino';

@Injectable()
export class PinoLogger implements LoggerService {
  private readonly logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

  log(message: any, ...optionalParams: any[]) {
    this.logger.info({ optionalParams }, message);
  }

  error(message: any, ...optionalParams: any[]) {
    this.logger.error({ optionalParams }, message);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn({ optionalParams }, message);
  }

  debug?(message: any, ...optionalParams: any[]) {
    this.logger.debug({ optionalParams }, message);
  }

  verbose?(message: any, ...optionalParams: any[]) {
    this.logger.trace({ optionalParams }, message);
  }
}
