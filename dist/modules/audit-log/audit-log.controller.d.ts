import { AuditLogService } from './audit-log.service';
export declare class AuditLogController {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    getAuditLogs(limit?: string): {
        success: boolean;
        api: string;
        count: number;
        data: import("./audit-log.types").AuditLogEntry[];
    };
}
