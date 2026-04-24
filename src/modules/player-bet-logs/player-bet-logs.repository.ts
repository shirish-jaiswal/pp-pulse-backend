import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PlayerBetLogsRepository {
  private headers() {
    return {
      'Content-Type': 'application/json',
      Accept: '*/*',
      'User-Agent': 'Mozilla/5.0',
      'kbn-xsrf': 'true',
      Authorization: `ApiKey ${process.env.KIBANA_API_KEY}`,
    };
  }

  private async searchFilebeatLogs(params: {
    query: string;
    from: string;
    to: string;
    size?: number;
    extraFilters?: any[];
  }) {
    const body = {
      size: params.size ?? 2000,
      sort: [{ '@timestamp': { order: 'asc' } }],
      _source: [
        '@timestamp',
        'message',
        'app',
        'service',
        'serviceName',
        'serviceMethod',
        'stage',
        'error',
        'responseLog',
        'requestLog',
        'log.level',
        'host',
        'contextMap',
      ],
      query: {
        bool: {
          must: [
            {
              query_string: {
                query: params.query,
                default_operator: 'AND',
              },
            },
          ],
          filter: [
            {
              range: {
                '@timestamp': {
                  gte: params.from,
                  lte: params.to,
                },
              },
            },
            ...(params.extraFilters ?? []),
          ],
        },
      },
    };

    const res = await axios.post(process.env.KIBANA_URL!, body, {
      headers: this.headers(),
      timeout: 30000,
    });

    return res.data?.hits?.hits?.map((x: any) => x._source) || [];
  }

  async searchRoundLogs(params: { roundId: string; from: string; to: string }) {
    return this.searchFilebeatLogs({
      query: `"${params.roundId}"`,
      from: params.from,
      to: params.to,
      size: 3000,
    });
  }

  async searchLateBetLogs(params: {
    gameId: string;
    userId: string;
    from: string;
    to: string;
  }) {
    return this.searchFilebeatLogs({
      query: `"ERROR : 1007 - LATE BET" AND "${params.gameId}" AND "${params.userId}"`,
      from: params.from,
      to: params.to,
      size: 500,
    });
  }

  async searchBlackjackGameLogs(params: {
    gameId: string;
    userId: string;
    from: string;
    to: string;
  }) {
    const query = `(
      ("${params.gameId}" AND "${params.userId}" AND "INCOMING message: <command channel=")
      OR
      ("${params.gameId}" AND timeout AND "On message")
      OR
      ("${params.gameId}" AND meta AND (decision OR decisioninc OR card))
      OR
      ("${params.userId}" AND "error-1007")
    )`;

    return this.searchFilebeatLogs({
      query,
      from: params.from,
      to: params.to,
      size: 3000,
    });
  }

  async searchBaccaratGameLogs(params: {
    gameId: string;
    userId: string;
    from: string;
    to: string;
  }) {
    const [byGameAndUser, byGameAndCard] = await Promise.all([
      this.searchFilebeatLogs({
        query: `"${params.gameId}" AND "${params.userId}"`,
        from: params.from,
        to: params.to,
        size: 2000,
      }),
      this.searchFilebeatLogs({
        query: `"${params.gameId}" AND card`,
        from: params.from,
        to: params.to,
        size: 2000,
      }),
    ]);

    return [...byGameAndUser, ...byGameAndCard];
  }

  async searchCrashGameLogs(params: {
    gameId: string;
    userId: string;
    from: string;
    to: string;
  }) {
    return this.searchFilebeatLogs({
      query: `"${params.gameId}"`,
      from: params.from,
      to: params.to,
      size: 3000,
      extraFilters: [
        {
          query_string: {
            query: `contextMap.userId:"${params.userId}"`,
          },
        },
      ],
    });
  }

  async searchGenericGameLogs(params: {
    gameId: string;
    userId: string;
    from: string;
    to: string;
  }) {
    return this.searchFilebeatLogs({
      query: `"${params.gameId}" AND "${params.userId}"`,
      from: params.from,
      to: params.to,
      size: 2000,
    });
  }
}
