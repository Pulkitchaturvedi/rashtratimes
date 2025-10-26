import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { HomepageService } from './homepage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('homepage')
export class HomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  @Get()
  async index() {
    return this.homepageService.getSlots();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PUBLISHER, Role.ADMIN)
  @Patch()
  async update(@Body() body: { slot: number; articleId?: string | null; override?: boolean }) {
    return this.homepageService.updateSlot(body.slot, body.articleId ?? null, body.override ?? true);
  }
}
