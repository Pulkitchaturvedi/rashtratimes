import { IsDateString } from 'class-validator';

export class ScheduleArticleDto {
  @IsDateString()
  scheduledAt!: string;
}
