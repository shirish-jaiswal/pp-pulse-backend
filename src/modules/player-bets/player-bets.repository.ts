import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class PlayerBetsRepository {
  constructor(private readonly database: DatabaseService) {}

  async getPlayerBets(playerId: string, fromDate: Date, toDate: Date) {
    const schema = this.database.schema;

    return this.database.query(
      (request) =>
        request
          .input('playerid', sql.VarChar, playerId)
          .input('fromDate', sql.DateTime2, fromDate)
          .input('toDate', sql.DateTime2, toDate),
      `
        SELECT
          r.user_id AS PlayerId,
          r.game_id AS GameId,
          r.round_id AS RoundId,
          tpt.trans_date AS Time,
          tpt.currency_code AS Currency,
          tpt.amount AS Amount,
          CASE
            WHEN tpt.action_type = 'P' THEN 'Placed'
            WHEN tpt.action_type = 'S' THEN 'Settled'
            WHEN tpt.action_type = 'C' THEN 'Cancelled'
            WHEN tpt.action_type = 'W' THEN 'Prize Drop Win'
            WHEN tpt.action_type = 'A' THEN 'Adjusted'
            ELSE 'Unknown'
          END AS ActionType,
          CASE WHEN tpt.status_code = '0' THEN 'Success' ELSE 'Failed' END AS Status,
          tpt.status_code AS StatusCode,
          tpt.transaction_id AS TransactionId,
          tpt.third_party_txn_id AS ThirdPartyTxnId,
          tpt.platform_trans_id AS PlatformTransId,
          tpt.game_mode AS GameMode,
          tpt.error_code AS ErrorCode,
          tpt.error_description AS ErrorDescription,
          tpt.retry_counter AS RetryCounter
        FROM ${schema}.[round] r
        INNER JOIN ${schema}.ThirdPartyTransaction tpt ON r.user_id = tpt.user_id AND r.game_id = tpt.game_id
        WHERE tpt.user_id = @playerid
          AND tpt.trans_date BETWEEN @fromDate AND @toDate
        ORDER BY tpt.trans_date DESC
      `,
    );
  }
}
