import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma.module';
import { CommonModule } from './common/common.module';
import { PinoLogger } from './common/pino-logger.service';
import { LoggingInterceptor } from './common/logging.interceptor';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { ArticlesModule } from './articles/articles.module';
import { MediaModule } from './media/media.module';
import { CitizenModule } from './citizen/citizen.module';
import { HomepageModule } from './homepage/homepage.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      cache: true
    }),
    ThrottlerModule.forRoot([{ ttl: 60, limit: 60 }]),
    PrismaModule,
    CommonModule,
    AuthModule,
    ArticlesModule,
    MediaModule,
    CitizenModule,
    HomepageModule,
    HealthModule
  ],
  providers: [
    PinoLogger,
    LoggingInterceptor,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
