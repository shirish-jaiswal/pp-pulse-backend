import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditLogService } from './audit-log.service';

@Controller()
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Roles('ADMIN')
  @Get('audit-logs')
  getAuditLogs(@Query('limit') limit?: string) {
    const parsed = Number(limit ?? '100');
    const safeLimit = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 500) : 100;

    return {
      success: true,
      api: 'audit-logs',
      count: safeLimit,
      data: this.auditLogService.list(safeLimit),
    };
  }
}
