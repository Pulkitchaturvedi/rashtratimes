import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { CitizenService } from './citizen.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { RejectSubmissionDto } from './dto/reject-submission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';

type StaffRequest = Request & { user: { sub: string } };

@Controller('citizen')
export class CitizenController {
  constructor(private readonly citizenService: CitizenService) {}

  @Post('submit')
  async submit(@Req() req: Request, @Body() dto: CreateSubmissionDto) {
    return this.citizenService.submit(dto, req.ip);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EDITOR, Role.PUBLISHER, Role.ADMIN)
  @Get('submissions')
  async list() {
    const submissions = await this.citizenService.list();
    return { data: submissions };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN)
  @Post(':id/triage')
  triage(@Param('id') id: string) {
    return this.citizenService.markTriaged(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN)
  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() dto: RejectSubmissionDto) {
    return this.citizenService.reject(id, dto.reason);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN)
  @Post(':id/promote')
  promote(@Param('id') id: string, @Req() req: StaffRequest) {
    return this.citizenService.promote(id, req.user.sub);
  }
}
