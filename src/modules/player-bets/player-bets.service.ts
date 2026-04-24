import { BadRequestException, Injectable } from '@nestjs/common';
import { PlayerRangeDto } from '../../common/dto/lookup.dto';
import { ApiListResponse } from '../../common/types/api-response';
import { PlayerBetsRepository } from './player-bets.repository';

@Injectable()
export class PlayerBetsService {
  constructor(private readonly repository: PlayerBetsRepository) {}

  async getInfo(dto: PlayerRangeDto): Promise<ApiListResponse<any>> {
    const fromDate = new Date(dto.from);
    const toDate = new Date(dto.to);
    const diff = toDate.getTime() - fromDate.getTime();

    if (!(diff > 0 && diff <= 60 * 60 * 1000)) {
      throw new BadRequestException('For DB scalability, player bets range must be within 1 hour only');
    }

    const result = await this.repository.getPlayerBets(dto.playerid, fromDate, toDate);

    return {
      success: true,
      api: 'playerbetsinfo',
      count: result.recordset.length,
      data: result.recordset,
    };
  }
}
