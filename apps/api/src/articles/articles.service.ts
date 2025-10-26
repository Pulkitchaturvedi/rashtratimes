import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { ConfigService } from '@nestjs/config';
import { Status, Prisma } from '@prisma/client';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticlesDto } from './dto/query-articles.dto';

const ALLOWED_TRANSITIONS: Record<Status, Status[]> = {
  [Status.DRAFT]: [Status.IN_REVIEW],
  [Status.IN_REVIEW]: [Status.CHANGES_REQUESTED, Status.APPROVED],
  [Status.CHANGES_REQUESTED]: [Status.IN_REVIEW],
  [Status.APPROVED]: [Status.PUBLISHED],
  [Status.PUBLISHED]: [Status.ARCHIVED],
  [Status.ARCHIVED]: []
};

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService
  ) {}

  async create(authorId: string, dto: CreateArticleDto) {
    const slug = await this.generateSlug(dto.title);
    return this.prisma.article.create({
      data: {
        slug,
        title: dto.title,
        body: this.wrapBody(dto.body),
        section: dto.section,
        tags: dto.tags,
        excerpt: dto.excerpt,
        location: dto.location,
        lang: dto.lang ?? 'en',
        heroImageId: dto.heroImageId,
        heroImageUrl: dto.heroImageUrl,
        authorId
      }
    });
  }

  async findAll(query: QueryArticlesDto) {
    const { page = 1, pageSize = 20, status, section, authorId, q } = query;
    const where: Prisma.ArticleWhereInput = {
      status,
      section,
      authorId,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { excerpt: { contains: q, mode: 'insensitive' } }
            ]
          }
        : {})
    };
    const [data, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: 'desc' }
      }),
      this.prisma.article.count({ where })
    ]);
    return { data, total, page, pageSize };
  }

  async findOne(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id }, include: { author: true } });
    if (article) {
      await this.incrementView(article);
    }
    return article;
  }

  async findBySlug(slug: string) {
    const article = await this.prisma.article.findUnique({ where: { slug }, include: { author: true } });
    if (article) {
      await this.incrementView(article);
    }
    return article;
  }

  async update(id: string, dto: UpdateArticleDto) {
    return this.prisma.article.update({
      where: { id },
      data: {
        ...dto,
        body: dto.body ? this.wrapBody(dto.body) : undefined
      }
    });
  }

  async submit(id: string, userId: string) {
    return this.transition(id, Status.IN_REVIEW, userId, 'Submitted for review');
  }

  async requestChanges(id: string, userId: string, note: string) {
    return this.transition(id, Status.CHANGES_REQUESTED, userId, note);
  }

  async approve(id: string, userId: string) {
    return this.transition(id, Status.APPROVED, userId, 'Approved');
  }

  async publish(id: string, userId: string) {
    const article = await this.transition(id, Status.PUBLISHED, userId, 'Published', {
      publishedAt: new Date(),
      scheduledAt: null
    });
    this.triggerRevalidation(article.slug).catch(() => undefined);
    return article;
  }

  async schedule(id: string, userId: string, scheduledAt: Date) {
    await this.ensureTransitionAllowed(id, Status.PUBLISHED);
    return this.prisma.$transaction(async (tx) => {
      const article = await tx.article.update({
        where: { id },
        data: {
          scheduledAt,
          status: Status.APPROVED
        }
      });
      await tx.revision.create({
        data: {
          articleId: id,
          userId,
          from: article.status,
          to: Status.APPROVED,
          note: `Scheduled for ${scheduledAt.toISOString()}`
        }
      });
      return article;
    });
  }

  private wrapBody(body: string) {
    try {
      return JSON.parse(body);
    } catch {
      return { blocks: [{ type: 'paragraph', content: body }] };
    }
  }

  private async generateSlug(title: string) {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    let slug = base;
    let counter = 1;
    while (await this.prisma.article.findUnique({ where: { slug } })) {
      slug = `${base}-${counter++}`;
    }
    return slug;
  }

  private async ensureTransitionAllowed(id: string, next: Status) {
    const article = await this.prisma.article.findUnique({ where: { id }, include: { author: true } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    const allowed = ALLOWED_TRANSITIONS[article.status as Status];
    if (!allowed.includes(next)) {
      throw new ConflictException('Invalid status transition');
    }
    return article;
  }

  async incrementView(article: { id: string; status: Status }) {
    if (article.status !== Status.PUBLISHED) {
      return;
    }
    const redis = this.redisService.getClient();
    const key = 'article:views:24h';
    await redis.zincrby(key, 1, article.id);
    await redis.expire(key, 60 * 60 * 24);
  }

  private async transition(
    id: string,
    next: Status,
    userId: string,
    note?: string,
    extraData: Prisma.ArticleUpdateInput = {}
  ) {
    const article = await this.ensureTransitionAllowed(id, next);
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.article.update({
        where: { id },
        data: {
          status: next,
          ...extraData
        }
      });
      await tx.revision.create({
        data: {
          articleId: id,
          userId,
          from: article.status,
          to: next,
          note
        }
      });
      return updated;
    });
  }
}

  private async triggerRevalidation(slug: string) {
    const secret = this.configService.get<string>('next.revalidationSecret');
    const siteUrl = this.configService.get<string>('next.siteUrl');
    if (!secret || !siteUrl) return;
    await fetch(`${siteUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, path: `/news/${slug}` })
    });
  }
