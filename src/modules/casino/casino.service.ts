import { Injectable } from '@nestjs/common';
import { ApiListResponse } from '../../common/types/api-response';
import { CasinoRepository } from './casino.repository';

@Injectable()
export class CasinoService {
  constructor(private readonly repository: CasinoRepository) {}
async getDetails(casinoId: string): Promise<ApiListResponse<any>> {
    const result = await this.repository.getCasinoDetails(casinoId);

    return {
      success: true,
      api: 'casinodetails',
      count: result.recordset.length,
      data: result.recordset,
    };
  }
}
