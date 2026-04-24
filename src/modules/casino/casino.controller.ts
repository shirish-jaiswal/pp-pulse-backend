import type { Request } from 'express';
import { Controller, Get, Query, Req } from '@nestjs/common';
import { CasinoLookupDto } from '../../common/dto/lookup.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CasinoService } from './casino.service';

@Controller()
export class CasinoController {
  constructor(
    private readonly casinoService: CasinoService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get('casinodetails')
  async getDetails(@Query() dto: CasinoLookupDto, @Req() request: Request) {
    const response = await this.casinoService.getDetails(dto.casinoid);

    this.auditLogService.capture(request, {
      action: 'CASINO_CONFIG_SEARCH',
      entityType: 'casino-config',
      entityValue: dto.casinoid,
      status: response.count ? 'SUCCESS' : 'NOT_FOUND',
    });

    return response;
  }
}
