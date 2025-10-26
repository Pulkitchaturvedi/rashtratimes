import { IsIn, IsInt, IsNotEmpty, IsString, Matches, Max } from 'class-validator';

const MAX_SIZE = 10 * 1024 * 1024;

export class PresignRequestDto {
  @IsString()
  @IsNotEmpty()
  mime!: string;

  @IsInt()
  @Max(MAX_SIZE)
  size!: number;

  @IsString()
  @Matches(/^[a-zA-Z0-9]+$/)
  ext!: string;
}

export const ALLOWED_MIME = ['image/', 'video/mp4'];
export const MAX_FILE_SIZE = MAX_SIZE;
