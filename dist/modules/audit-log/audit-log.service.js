"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = require("fs");
const path = require("path");
let AuditLogService = class AuditLogService {
    constructor(config) {
        this.config = config;
        const runtimeDir = path.resolve(process.cwd(), 'runtime');
        fs.mkdirSync(runtimeDir, { recursive: true });
        this.filePath = path.join(runtimeDir, 'audit-log.jsonl');
        this.cookieName = this.config.get('COOKIE_NAME', 'JSESSIONID');
    }
    decodeUserFromRequest(request) {
        const enrichedUser = request
            ?.authUser;
        if (enrichedUser?.email) {
            return {
                email: String(enrichedUser.email),
                name: String(enrichedUser.name ?? enrichedUser.email),
            };
        }
        const cookieValue = request?.signedCookies?.[this.cookieName] ?? request?.cookies?.[this.cookieName];
        if (!cookieValue)
            return null;
        return null;
    }
    getIp(request) {
        return (request?.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            request?.ip ||
            request?.socket?.remoteAddress ||
            '');
    }
    record(action) {
        const entry = {
            timestamp: new Date().toISOString(),
            actorEmail: action.actorEmail ?? 'system',
            actorName: action.actorName ?? action.actorEmail ?? 'system',
            action: action.action,
            entityType: action.entityType,
            entityValue: action.entityValue,
            status: action.status,
            sourceIp: '',
            metadata: action.metadata,
        };
        fs.appendFileSync(this.filePath, `${JSON.stringify(entry)}\n`, 'utf8');
        return entry;
    }
    capture(request, action) {
        const user = this.decodeUserFromRequest(request);
        console.log('user', user);
        const entry = {
            timestamp: new Date().toISOString(),
            actorEmail: user?.email ?? 'anonymous',
            actorName: user?.name ?? 'Anonymous User',
            action: action.action,
            entityType: action.entityType,
            entityValue: action.entityValue,
            status: action.status,
            sourceIp: this.getIp(request),
            metadata: action.metadata,
        };
        fs.appendFileSync(this.filePath, `${JSON.stringify(entry)}\n`, 'utf8');
        return entry;
    }
    list(limit = 100) {
        if (!fs.existsSync(this.filePath))
            return [];
        const lines = fs
            .readFileSync(this.filePath, 'utf8')
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
        return lines
            .map((line) => {
            try {
                return JSON.parse(line);
            }
            catch {
                return null;
            }
        })
            .filter((entry) => Boolean(entry))
            .slice(-Math.max(1, limit))
            .reverse();
    }
};
exports.AuditLogService = AuditLogService;
exports.AuditLogService = AuditLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AuditLogService);
//# sourceMappingURL=audit-log.service.js.map