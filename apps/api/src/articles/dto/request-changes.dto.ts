import { IsNotEmpty, IsString } from 'class-validator';

export class RequestChangesDto {
  @IsString()
  @IsNotEmpty()
  note!: string;
}
