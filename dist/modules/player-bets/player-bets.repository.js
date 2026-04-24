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
exports.PlayerBetsRepository = void 0;
const common_1 = require("@nestjs/common");
const sql = require("mssql");
const database_service_1 = require("../../database/database.service");
let PlayerBetsRepository = class PlayerBetsRepository {
    constructor(database) {
        this.database = database;
    }
    async getPlayerBets(playerId, fromDate, toDate) {
        const schema = this.database.schema;
        return this.database.query((request) => request
            .input('playerid', sql.VarChar, playerId)
            .input('fromDate', sql.DateTime2, fromDate)
            .input('toDate', sql.DateTime2, toDate), `
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
      `);
    }
};
exports.PlayerBetsRepository = PlayerBetsRepository;
exports.PlayerBetsRepository = PlayerBetsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], PlayerBetsRepository);
//# sourceMappingURL=player-bets.repository.js.map