import { Module } from '@nestjs/common';
import { CitizenService } from './citizen.service';
import { CitizenController } from './citizen.controller';
import { ArticlesModule } from '../articles/articles.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ArticlesModule, AuthModule],
  controllers: [CitizenController],
  providers: [CitizenService]
})
export class CitizenModule {}
