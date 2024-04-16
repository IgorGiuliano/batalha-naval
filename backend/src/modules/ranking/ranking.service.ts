import { Injectable } from '@nestjs/common';
import { prisma } from 'src/database/database';
import { RankingDto } from './dto/ranking.dto';

@Injectable()
export class RankingService {
  async retrieveTopPlayers() {
    const topPlayers = await prisma.gameScore.findMany({
      take: 10,
      orderBy: {
        score: 'desc',
      },
      include: {
        user: true,
      },
    });

    return topPlayers;
  }

  async addNewScore(data: RankingDto) {
    const { email, score } = data;

    let existsUser = await this.findUser(email);

    if (!existsUser) {
      existsUser = await this.createUser(email);
    }

    //registrar score
    return await this.recordScore(email, score);
  }

  async findUser(email: string) {
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    return user;
  }

  async createUser(email: string) {
    const user = await prisma.user.create({
      data: {
        email,
      },
    });

    return user;
  }

  async recordScore(id: string, score: number) {
    const record = await prisma.gameScore.create({
      data: {
        score,
        gameDate: Date(),
        userId: id,
      },
    });

    return record;
  }
}
