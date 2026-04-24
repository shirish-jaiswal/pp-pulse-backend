import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { AuditLogEntry } from './audit-log.types';

type PartialAuditLogEntry = Omit<AuditLogEntry, 'timestamp' | 'actorEmail' | 'actorName' | 'sourceIp'> & {
  actorEmail?: string;
  actorName?: string;
};

@Injectable()
export class AuditLogService {
  private readonly filePath: string;
  private readonly cookieName: string;

  constructor(private readonly config: ConfigService) {
    const runtimeDir = path.resolve(process.cwd(), 'runtime');
    fs.mkdirSync(runtimeDir, { recursive: true });
    this.filePath = path.join(runtimeDir, 'audit-log.jsonl');
    this.cookieName = this.config.get<string>('COOKIE_NAME', 'JSESSIONID');
  }

  private decodeUserFromRequest(request?: Request): { email: string; name: string } | null {
    const enrichedUser = (request as Request & { authUser?: { email?: string; name?: string } } | undefined)
      ?.authUser;

    if (enrichedUser?.email) {
      return {
        email: String(enrichedUser.email),
        name: String(enrichedUser.name ?? enrichedUser.email),
      };
    }

    const cookieValue = request?.signedCookies?.[this.cookieName] ?? request?.cookies?.[this.cookieName];
    if (!cookieValue) return null;

    return null;
  }

  private getIp(request?: Request): string {
    return (
      (request?.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
      request?.ip ||
      request?.socket?.remoteAddress ||
      ''
    );
  }

  record(action: PartialAuditLogEntry): AuditLogEntry {
    const entry: AuditLogEntry = {
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

  capture(request: Request | undefined, action: Omit<PartialAuditLogEntry, 'actorEmail' | 'actorName'>): AuditLogEntry {
    const user = this.decodeUserFromRequest(request);
    console.log('user', user);
    const entry: AuditLogEntry = {
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

  list(limit = 100): AuditLogEntry[] {
    if (!fs.existsSync(this.filePath)) return [];

    const lines = fs
      .readFileSync(this.filePath, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    return lines
      .map((line) => {
        try {
          return JSON.parse(line) as AuditLogEntry;
        } catch {
          return null;
        }
      })
      .filter((entry): entry is AuditLogEntry => Boolean(entry))
      .slice(-Math.max(1, limit))
      .reverse();
  }
}
