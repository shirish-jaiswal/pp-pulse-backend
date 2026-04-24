import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';

export type AuthPortalUser = {
  userId: string | null;
  emailAddress: string | null;
  screenName: string | null;
  casinoId: string | null;
  passhash: string | null;
  status: string | null;
};

@Injectable()
export class AuthRepository {
  constructor(private readonly database: DatabaseService) {}

  async findByEmail(emailAddress: string): Promise<AuthPortalUser | null> {
    const schema = this.database.schema;
    const identifier = (emailAddress ?? '').trim().toLowerCase();

    const result = await this.database.query<AuthPortalUser>(
      (request) =>
        request.input('email_address', sql.VarChar(100), identifier),
      `
      IF OBJECT_ID('${schema}.casinouser') IS NULL
      BEGIN
        SELECT
          CAST(NULL AS VARCHAR(100)) AS userId,
          CAST(NULL AS VARCHAR(100)) AS emailAddress,
          CAST(NULL AS VARCHAR(200)) AS screenName,
          CAST(NULL AS VARCHAR(100)) AS casinoId,
          CAST(NULL AS VARCHAR(255)) AS passhash,
          'Required table not found' AS status;
        RETURN;
      END;

      SELECT TOP 1
        TRY_CONVERT(VARCHAR(100), cu.user_id) AS userId,
        LTRIM(RTRIM(TRY_CONVERT(VARCHAR(100), cu.email_address))) AS emailAddress,
        LTRIM(RTRIM(TRY_CONVERT(VARCHAR(200), cu.screen_name))) AS screenName,
        TRY_CONVERT(VARCHAR(100), cu.casino_id) AS casinoId,
        LOWER(LTRIM(RTRIM(TRY_CONVERT(VARCHAR(255), cu.passhash)))) AS passhash,
        'FOUND' AS status
      FROM ${schema}.casinouser cu
      WHERE LOWER(LTRIM(RTRIM(TRY_CONVERT(VARCHAR(100), cu.email_address)))) = @email_address;
      `,
    );

    const user = (result.recordset?.[0] as AuthPortalUser | undefined) ?? null;
    return user;
  }
}