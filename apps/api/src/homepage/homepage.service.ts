import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';

@Injectable()
export class HomepageService {
  constructor(private readonly prisma: PrismaService, private readonly redisService: RedisService) {}

  async getSlots() {
    const manualSlots = await this.prisma.homepageSlot.findMany({
      orderBy: { slot: 'asc' },
      include: { article: true }
    });
    const redis = this.redisService.getClient();
    const trending = await redis.zrevrange('article:views:24h', 0, 10, 'WITHSCORES');
    const trendingArticleIds = trending.filter((_, index) => index % 2 === 0);

    const trendingArticles = await this.prisma.article.findMany({
      where: { id: { in: trendingArticleIds } }
    });

    const latestDelhi = await this.prisma.article.findMany({
      where: { status: 'APPROVED', section: 'Delhi' },
      orderBy: { updatedAt: 'desc' },
      take: 4
    });

    const slots = Array.from({ length: 8 }, (_, index) => {
      const manual = manualSlots.find((slot) => slot.slot === index + 1);
      if (manual?.override && manual.article) {
        return { slot: index + 1, article: manual.article, override: true };
      }
      if (index === 0 && manual?.article) {
        return { slot: 1, article: manual.article, override: manual.override };
      }
      if (index >= 1 && index <= 4) {
        return { slot: index + 1, article: latestDelhi[index - 1] ?? null, override: false };
      }
      const trendingArticle = trendingArticles[index - 5] ?? null;
      return { slot: index + 1, article: trendingArticle, override: false };
    });

    return { slots };
  }

  async updateSlot(slot: number, articleId: string | null, override = true) {
    return this.prisma.homepageSlot.upsert({
      where: { slot },
      update: { articleId, override },
      create: { slot, articleId, override }
    });
  }
}
