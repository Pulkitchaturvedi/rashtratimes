import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService, private readonly redisService: RedisService) {}

  @Get()
  async index() {
    await this.prisma.$queryRaw`SELECT 1`;
    await this.redisService.getClient().ping();
    return { status: 'ok' };
  }
}
