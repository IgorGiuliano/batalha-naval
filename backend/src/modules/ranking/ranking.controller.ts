import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { RankingService } from './ranking.service';
import { RankingDto } from './dto/ranking.dto';

@ApiTags('Ranking')
@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @ApiConsumes('application/json')
  @ApiBody({ type: RankingDto })
  @Post('/add-new-score')
  @HttpCode(200)
  addNewScore(@Body() data: RankingDto) {
    return this.rankingService.addNewScore(data);
  }

  @ApiConsumes('application/json')
  @Get('/retrieve-top-players')
  @HttpCode(200)
  retrieveTopPlayers() {
    return this.rankingService.retrieveTopPlayers();
  }
}
