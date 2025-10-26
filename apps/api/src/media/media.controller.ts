import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MediaService } from './media.service';
import { PresignRequestDto } from './dto/presign-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('presign')
  @Roles(Role.REPORTER, Role.EDITOR, Role.PUBLISHER, Role.ADMIN)
  presign(@Body() dto: PresignRequestDto) {
    return this.mediaService.createPresignedUpload(dto);
  }
}
