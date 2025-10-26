import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';
import { PresignRequestDto, ALLOWED_MIME, MAX_FILE_SIZE } from './dto/presign-request.dto';
import { randomUUID } from 'node:crypto';

@Injectable()
export class MediaService {
  constructor(private readonly config: ConfigService, private readonly prisma: PrismaService) {}

  async createPresignedUpload(dto: PresignRequestDto) {
    if (dto.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File exceeds 10MB limit');
    }

    if (!ALLOWED_MIME.some((prefix) => dto.mime.startsWith(prefix))) {
      throw new BadRequestException('Unsupported mime type');
    }

    const key = `${new Date().getFullYear()}/${randomUUID()}.${dto.ext}`;
    const bucket = this.config.get<string>('storage.bucket') ?? 'rashtratimes-dev';
    const endpoint = this.config.get<string>('storage.endpoint') ?? 'https://uploads.local';
    const uploadUrl = `${endpoint}/${bucket}/${key}`;
    const cdnUrl = `${this.config.get<string>('next.siteUrl') ?? 'https://cdn.rashtratimes.com'}/${key}`;

    const asset = await this.prisma.media.create({
      data: {
        key,
        url: cdnUrl,
        mime: dto.mime,
        size: dto.size
      }
    });

    return {
      uploadUrl,
      cdnUrl,
      assetId: asset.id,
      headers: {
        'Content-Type': dto.mime
      }
    };
  }
}
