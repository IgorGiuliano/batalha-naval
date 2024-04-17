import { Module } from '@nestjs/common';
import { RankingModule } from '../ranking/ranking.module';

@Module({
  imports: [RankingModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
