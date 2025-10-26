import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';

type AuthenticatedRequest = Request & { user: { sub: string; role: string } };import { RequestChangesDto } from './dto/request-changes.dto';
import { ScheduleArticleDto } from './dto/schedule-article.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  async findAll(@Query() query: QueryArticlesDto) {
    return this.articlesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles(Role.REPORTER, Role.ADMIN)
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateArticleDto) {
    return this.articlesService.create(req.user['sub'], dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @Roles(Role.REPORTER, Role.EDITOR, Role.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateArticleDto) {
    return this.articlesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/submit')
  @Roles(Role.REPORTER, Role.ADMIN)
  async submit(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.articlesService.submit(id, req.user['sub']);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/request-changes')
  @Roles(Role.EDITOR, Role.ADMIN)
  async requestChanges(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: RequestChangesDto
  ) {
    return this.articlesService.requestChanges(id, req.user['sub'], dto.note);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/approve')
  @Roles(Role.EDITOR, Role.ADMIN)
  async approve(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.articlesService.approve(id, req.user['sub']);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/publish')
  @Roles(Role.PUBLISHER, Role.ADMIN)
  async publish(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.articlesService.publish(id, req.user['sub']);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/schedule')
  @Roles(Role.PUBLISHER, Role.ADMIN)
  async schedule(@Param('id') id: string, @Req() req: AuthenticatedRequest, @Body() dto: ScheduleArticleDto) {
    return this.articlesService.schedule(id, req.user['sub'], new Date(dto.scheduledAt));
  }
}
