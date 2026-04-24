import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class CasinoRepository {
  constructor(private readonly database: DatabaseService) {}

  async getCasinoDetails(casinoId: string) {
    const schema = this.database.schema;

    return this.database.query(
      (request) => request.input('casinoid', sql.VarChar, casinoId),
      `
;WITH SharedEnvCTE AS
(
    SELECT
        os.casino_id,
        os.env,
        en.name AS env_name,
        os.shardedCasinoId,
        os.shardedOperatorId,
        ROW_NUMBER() OVER (PARTITION BY os.casino_id ORDER BY os.env) AS rn
    FROM ${schema}.OneWalletCasino_ShardedEnv os WITH (NOLOCK)
    LEFT JOIN ${schema}.Environment en WITH (NOLOCK)
        ON en.env_id = os.env
)
SELECT
    c.casino_id,
    c.casino_desc,
    CONVERT(NVARCHAR(MAX), cc.conf_data) AS conf_data,
    oc.extra_data_on_bet,
    oc.extra_data_on_win,
    oc.extra_data_on_df,
    oc.env AS main_env_id,
    main_en.name AS main_env_name,

    MAX(CASE WHEN se.rn = 1 THEN se.env END) AS shared_env_1_id,
    MAX(CASE WHEN se.rn = 1 THEN se.env_name END) AS shared_env_1_name,
    MAX(CASE WHEN se.rn = 1 THEN se.shardedCasinoId END) AS shared_env_1_shardedCasinoId,
    MAX(CASE WHEN se.rn = 1 THEN se.shardedOperatorId END) AS shared_env_1_shardedOperatorId,

    MAX(CASE WHEN se.rn = 2 THEN se.env END) AS shared_env_2_id,
    MAX(CASE WHEN se.rn = 2 THEN se.env_name END) AS shared_env_2_name,
    MAX(CASE WHEN se.rn = 2 THEN se.shardedCasinoId END) AS shared_env_2_shardedCasinoId,
    MAX(CASE WHEN se.rn = 2 THEN se.shardedOperatorId END) AS shared_env_2_shardedOperatorId,

    MAX(CASE WHEN se.rn = 3 THEN se.env END) AS shared_env_3_id,
    MAX(CASE WHEN se.rn = 3 THEN se.env_name END) AS shared_env_3_name,
    MAX(CASE WHEN se.rn = 3 THEN se.shardedCasinoId END) AS shared_env_3_shardedCasinoId,
    MAX(CASE WHEN se.rn = 3 THEN se.shardedOperatorId END) AS shared_env_3_shardedOperatorId

FROM ${schema}.casino c WITH (NOLOCK)
LEFT JOIN ${schema}.casinoconfig cc WITH (NOLOCK)
    ON cc.casino_id = c.casino_id
LEFT JOIN ${schema}.onewalletcasino oc WITH (NOLOCK)
    ON oc.casino_id = c.casino_id
LEFT JOIN ${schema}.environment main_en WITH (NOLOCK)
    ON main_en.env_id = oc.env
LEFT JOIN SharedEnvCTE se
    ON se.casino_id = c.casino_id

WHERE c.casino_id = @casinoid
  AND oc.env <> 0

GROUP BY
    c.casino_id,
    c.casino_desc,
    CONVERT(NVARCHAR(MAX), cc.conf_data),
    oc.extra_data_on_bet,
    oc.extra_data_on_win,
    oc.extra_data_on_df,
    oc.env,
    main_en.name
      `,
    );
  }
}
