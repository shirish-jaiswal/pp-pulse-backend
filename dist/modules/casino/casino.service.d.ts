import { ApiListResponse } from '../../common/types/api-response';
import { CasinoRepository } from './casino.repository';
export declare class CasinoService {
    private readonly repository;
    constructor(repository: CasinoRepository);
    getDetails(casinoId: string): Promise<ApiListResponse<any>>;
}
