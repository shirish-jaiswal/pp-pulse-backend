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
exports.RoundRepository = void 0;
const common_1 = require("@nestjs/common");
const round_lookup_1 = require("../../common/lookup/round-lookup");
const database_service_1 = require("../../database/database.service");
let RoundRepository = class RoundRepository {
    constructor(database) {
        this.database = database;
    }
    async getBetTable(params) {
        const schema = this.database.schema;
        const mode = (0, round_lookup_1.resolveRoundLookupMode)(params);
        return this.database.query((request) => (0, round_lookup_1.configureRoundLookupRequest)(request, params), mode === 'RoundId'
            ? `
          SELECT
            b.game_id,
            b.user_id,
            r.round_id,
            b.betcode_id,
            bc.description,
            b.betting_req_time,
            b.place_time,
            b.settle_time,
            b.game_mode,
            b.amount,
            b.payoff,
            b.currency_code,
            b.status,
            cu.casino_id,
            c.casino_desc
          FROM ${schema}.bet b
          INNER JOIN ${schema}.[round] r ON b.user_id = r.user_id AND b.game_id = r.game_id
          INNER JOIN ${schema}.casinouser cu ON cu.user_id = r.user_id
          INNER JOIN ${schema}.casino c ON c.casino_id = cu.casino_id
          INNER JOIN ${schema}.betcode bc ON bc.betcode_id = b.betcode_id
          WHERE r.round_id = @RoundId
        `
            : `
          SELECT
            b.game_id,
            b.user_id,
            r.round_id,
            b.betcode_id,
            bc.description,
            b.betting_req_time,
            b.place_time,
            b.settle_time,
            b.game_mode,
            b.amount,
            b.payoff,
            b.currency_code,
            b.status,
            cu.casino_id,
            c.casino_desc
          FROM ${schema}.bet b
          INNER JOIN ${schema}.[round] r ON b.user_id = r.user_id AND b.game_id = r.game_id
          INNER JOIN ${schema}.casinouser cu ON cu.user_id = r.user_id
          INNER JOIN ${schema}.casino c ON c.casino_id = cu.casino_id
          INNER JOIN ${schema}.betcode bc ON bc.betcode_id = b.betcode_id
          WHERE RTRIM(r.game_id) = @GameId AND RTRIM(r.user_id) = @UserId
        `);
    }
    async getTptTable(params) {
        const schema = this.database.schema;
        const mode = (0, round_lookup_1.resolveRoundLookupMode)(params);
        return this.database.query((request) => (0, round_lookup_1.configureRoundLookupRequest)(request, params), mode === 'RoundId'
            ? `
          SELECT
            r.game_id,
            r.round_id,
            r.user_id,
            tpt.amount,
            tpt.currency_code,
            CASE
              WHEN tpt.action_type = 'P' THEN 'Placed'
              WHEN tpt.action_type = 'S' THEN 'Settled'
              WHEN tpt.action_type = 'C' THEN 'Cancelled'
              WHEN tpt.action_type = 'W' THEN 'Prize Drop Win'
              WHEN tpt.action_type = 'A' THEN 'Adjusted'
              ELSE 'Unknown'
            END AS action_type,
            tpt.status_code,
            tpt.transaction_id,
            tpt.third_party_txn_id,
            tpt.platform_trans_id,
            tpt.game_mode,
            tpt.error_code,
            tpt.error_description,
            tpt.retry_counter,
            tpt.trans_date,
            tpt.amount AS payoff
          FROM ${schema}.[round] r
          INNER JOIN ${schema}.ThirdPartyTransaction tpt ON r.user_id = tpt.user_id AND r.game_id = tpt.game_id
          WHERE r.round_id = @RoundId
          ORDER BY tpt.trans_date ASC
        `
            : `
          SELECT
            r.game_id,
            r.round_id,
            r.user_id,
            tpt.amount,
            tpt.currency_code,
            CASE
              WHEN tpt.action_type = 'P' THEN 'Placed'
              WHEN tpt.action_type = 'S' THEN 'Settled'
              WHEN tpt.action_type = 'C' THEN 'Cancelled'
              WHEN tpt.action_type = 'W' THEN 'Prize Drop Win'
              WHEN tpt.action_type = 'A' THEN 'Adjusted'
              ELSE 'Unknown'
            END AS action_type,
            tpt.status_code,
            tpt.transaction_id,
            tpt.third_party_txn_id,
            tpt.platform_trans_id,
            tpt.game_mode,
            tpt.error_code,
            tpt.error_description,
            tpt.retry_counter,
            tpt.trans_date,
            tpt.amount AS payoff
          FROM ${schema}.[round] r
          INNER JOIN ${schema}.ThirdPartyTransaction tpt ON r.user_id = tpt.user_id AND r.game_id = tpt.game_id
          WHERE RTRIM(r.game_id) = @GameId AND RTRIM(r.user_id) = @UserId
          ORDER BY tpt.trans_date ASC
        `);
    }
    async getCardDetails(params) {
        const schema = this.database.schema;
        const mode = (0, round_lookup_1.resolveRoundLookupMode)(params);
        return this.database.query((request) => (0, round_lookup_1.configureRoundLookupRequest)(request, params), mode === 'RoundId'
            ? `
          SELECT
              r.game_id,
              CASE
                  WHEN TRY_CAST(gr.state_indicator AS INT) < 0 THEN 'Dealer'
                  WHEN FLOOR(ABS(TRY_CAST(gr.state_indicator AS INT)) / 100) = 0 THEN 'Seat 7'
                  ELSE 'Seat ' + CAST(7 - FLOOR(ABS(TRY_CAST(gr.state_indicator AS INT)) / 100) AS VARCHAR(10))
              END AS seat_number,
              FLOOR((ABS(TRY_CAST(gr.state_indicator AS INT)) % 100) / 10) AS hand_number,
              CASE
                  WHEN TRY_CAST(gr.state_indicator AS INT) = -100 THEN 'DEALER_CARD_DEALT'
                  WHEN TRY_CAST(gr.state_indicator AS INT) = -101 THEN 'DEALER_HIDDEN_CARD'
                  WHEN TRY_CAST(gr.state_indicator AS INT) = -102 THEN 'DEALER_INSURENCE'
                  WHEN (ABS(TRY_CAST(gr.state_indicator AS INT)) % 10) = 0 THEN 'CARD_DEALT'
                  WHEN (ABS(TRY_CAST(gr.state_indicator AS INT)) % 10) = 1 THEN 'PLAYER_DECISION'
                  ELSE 'OTHER'
              END AS event_type,
              CASE
                  WHEN (ABS(TRY_CAST(gr.state_indicator AS INT)) % 10) = 0 THEN rc.scan_code
                  WHEN (ABS(TRY_CAST(gr.state_indicator AS INT)) % 10) = 1 THEN REPLACE(rc.description, 'Decision: ', '')
                  WHEN TRY_CAST(gr.state_indicator AS INT) = -100 THEN rc.scan_code
                  WHEN TRY_CAST(gr.state_indicator AS INT) = -101 THEN rc.description
                  ELSE rc.description
              END AS event_value,
              gr.result_time,
              gr.state_indicator,
              gr.resultcode_id
          FROM ${schema}.[round] r
          INNER JOIN ${schema}.gameresult gr
              ON r.game_id = gr.game_id
          LEFT JOIN ${schema}.resultcode rc
              ON gr.resultcode_id = rc.resultcode_id
          WHERE r.round_id = @RoundId
            AND (
                  gr.state_indicator IS NULL
                  OR TRY_CAST(gr.state_indicator AS INT) IN (0, 1, -100, -101, -102)
                  OR FLOOR(ABS(TRY_CAST(gr.state_indicator AS INT)) / 100) BETWEEN 1 AND 7
                )
          ORDER BY
              CASE WHEN TRY_CAST(gr.state_indicator AS INT) < 0 THEN 0 ELSE 1 END,
              CASE
                  WHEN TRY_CAST(gr.state_indicator AS INT) < 0 THEN 0
                  WHEN FLOOR(ABS(TRY_CAST(gr.state_indicator AS INT)) / 100) = 0 THEN 7
                  ELSE 7 - FLOOR(ABS(TRY_CAST(gr.state_indicator AS INT)) / 100)
              END DESC,
              FLOOR((ABS(TRY_CAST(gr.state_indicator AS INT)) % 100) / 10),
              gr.result_time ASC
        `
            : `
          SELECT
              r.game_id,
              CASE
                  WHEN TRY_CAST(gr.state_indicator AS INT) < 0 THEN 'Dealer'
                  WHEN FLOOR(ABS(TRY_CAST(gr.state_indicator AS INT)) / 100) = 0 THEN 'Seat 7'
                  ELSE 'Seat ' + CAST(7 - FLOOR(ABS(TRY_CAST(gr.state_indicator AS INT)) / 100) AS VARCHAR(10))
              END AS seat_number,
              FLOOR((ABS(TRY_CAST(gr.state_indicator AS INT)) % 100) / 10) AS hand_number,
              CASE
                  WHEN TRY_CAST(gr.state_indicator AS INT) = -100 THEN 'DEALER_CARD_DEALT'
                  WHEN TRY_CAST(gr.state_indicator AS INT) = -101 THEN 'DEALER_HIDDEN_CARD'
                  WHEN TRY_CAST(gr.state_indicator AS INT) = -102 THEN 'DEALER_INSURENCE'
                  WHEN (ABS(TRY_CAST(gr.state_indicator AS INT)) % 10) = 0 THEN 'CARD_DEALT'
                  WHEN (ABS(TRY_CAST(gr.state_indicator AS INT)) % 10) = 1 THEN 'PLAYER_DECISION'
                  ELSE 'OTHER'
              END AS event_type,
              CASE
                  WHEN (ABS(TRY_CAST(gr.state_indicator AS INT)) % 10) = 0 THEN rc.scan_code
                  WHEN (ABS(TRY_CAST(gr.state_indicator AS INT)) % 10) = 1 THEN REPLACE(rc.description, 'Decision: ', '')
                  WHEN TRY_CAST(gr.state_indicator AS INT) = -100 THEN rc.scan_code
                  WHEN TRY_CAST(gr.state_indicator AS INT) = -101 THEN rc.description
                  ELSE rc.description
              END AS event_value,
              gr.result_time,
              gr.state_indicator,
              gr.resultcode_id
          FROM ${schema}.[round] r
          INNER JOIN ${schema}.gameresult gr
              ON r.game_id = gr.game_id
          LEFT JOIN ${schema}.resultcode rc
              ON gr.resultcode_id = rc.resultcode_id
          WHERE RTRIM(r.game_id) = @GameId
            AND RTRIM(r.user_id) = @UserId
            AND (
                  gr.state_indicator IS NULL
                  OR TRY_CAST(gr.state_indicator AS INT) IN (0, 1, -100, -101, -102)
                  OR FLOOR(ABS(TRY_CAST(gr.state_indicator AS INT)) / 100) BETWEEN 1 AND 7
                )
          ORDER BY
              CASE WHEN TRY_CAST(gr.state_indicator AS INT) < 0 THEN 0 ELSE 1 END,
              CASE
                  WHEN TRY_CAST(gr.state_indicator AS INT) < 0 THEN 0
                  WHEN FLOOR(ABS(TRY_CAST(gr.state_indicator AS INT)) / 100) = 0 THEN 7
                  ELSE 7 - FLOOR(ABS(TRY_CAST(gr.state_indicator AS INT)) / 100)
              END DESC,
              FLOOR((ABS(TRY_CAST(gr.state_indicator AS INT)) % 100) / 10),
              gr.result_time ASC
        `);
    }
    async getGameDetails(params) {
        const schema = this.database.schema;
        const mode = (0, round_lookup_1.resolveRoundLookupMode)(params);
        if (mode === 'RoundId') {
            return this.database.query((request) => (0, round_lookup_1.configureRoundLookupRequest)(request, params), `
          SELECT
                 RTRIM(r.round_id)               AS round_id
                ,RTRIM(r.game_id)                AS game_id
                ,RTRIM(r.user_id)                AS user_id
                ,RTRIM(gt.table_id)              AS table_id
                ,gt.table_name
                ,gcf.conf_desc                  AS game_type
                ,g.game_start                   AS game_time
                ,RTRIM(r.created_ip_address)    AS IP
                ,rc.description                 AS Description
                ,g.cancelReason
                ,gr.resultcode_id
                ,gr.result_time
			 ,gr.state_indicator
            FROM ${schema}.round r WITH(NOLOCK)
            INNER JOIN ${schema}.game g WITH(NOLOCK)
                ON g.game_id = r.game_id
            INNER JOIN ${schema}.gametable gt WITH(NOLOCK)
                ON gt.table_id = g.table_id
            INNER JOIN ${schema}.gameconfig gcf WITH(NOLOCK)
                ON gcf.conf_id = gt.conf_id
            LEFT JOIN ${schema}.gameresult gr WITH(NOLOCK)
                ON gr.game_id = g.game_id
            LEFT JOIN ${schema}.ResultCode rc WITH(NOLOCK)
                ON gr.resultcode_id = rc.resultcode_id
            WHERE r.round_id = @RoundId
            ORDER BY gr.result_time DESC
        `);
        }
        return this.database.query((request) => (0, round_lookup_1.configureRoundLookupRequest)(request, params), `
         SELECT
                 RTRIM(r.round_id)               AS round_id
                ,RTRIM(r.game_id)                AS game_id
                ,RTRIM(r.user_id)                AS user_id
                ,RTRIM(gt.table_id)              AS table_id
                ,gt.table_name
                ,gcf.conf_desc                  AS game_type
                ,g.game_start                   AS game_time
                ,RTRIM(r.created_ip_address)    AS IP
                ,rc.description                 AS Description
                ,g.cancelReason
                ,gr.resultcode_id
                ,gr.result_time
			 ,gr.state_indicator
            FROM ${schema}.round r WITH(NOLOCK)
            INNER JOIN ${schema}.game g WITH(NOLOCK)
                ON g.game_id = r.game_id
            INNER JOIN ${schema}.gametable gt WITH(NOLOCK)
                ON gt.table_id = g.table_id
            INNER JOIN ${schema}.gameconfig gcf WITH(NOLOCK)
                ON gcf.conf_id = gt.conf_id
            LEFT JOIN ${schema}.gameresult gr WITH(NOLOCK)
                ON gr.game_id = g.game_id
            LEFT JOIN ${schema}.ResultCode rc WITH(NOLOCK)
                ON gr.resultcode_id = rc.resultcode_id
            WHERE r.game_id = @GameId AND r.user_id = @UserId
            ORDER BY gr.result_time DESC;
      `);
    }
};
exports.RoundRepository = RoundRepository;
exports.RoundRepository = RoundRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], RoundRepository);
//# sourceMappingURL=round.repository.js.map