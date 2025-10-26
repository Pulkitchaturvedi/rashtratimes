import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Status } from '@prisma/client';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;

  @IsString()
  @IsNotEmpty()
  section!: string;

  @IsArray()
  tags!: string[];

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  lang?: string;

  @IsString()
  @IsOptional()
  heroImageId?: string;

  @IsString()
  @IsOptional()
  heroImageUrl?: string;
}
