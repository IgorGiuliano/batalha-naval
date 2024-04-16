import { IsEmail } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RankingDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  score: number;
}
