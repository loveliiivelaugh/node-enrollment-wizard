// TODO: Replace this stub with a real PostgreSQL client (e.g. pg, postgres.js)
// when DATABASE_URL is configured. For now all handlers use in-memory mock data.

export interface QueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount: number;
}

type DbClient = {
  query: <T = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
  ) => Promise<QueryResult<T>>;
};

function createMockClient(): DbClient {
  return {
    async query<T = Record<string, unknown>>(
      _sql: string,
      _params?: unknown[]
    ): Promise<QueryResult<T>> {
      // TODO: wire up real pg Pool here once DATABASE_URL is available
      console.warn('[db] DATABASE_URL not set – returning empty result set');
      return { rows: [], rowCount: 0 };
    },
  };
}

function createRealClient(_connectionString: string): DbClient {
  // TODO: import and initialise `pg` Pool or `postgres` client here
  // Example:
  //   import { Pool } from 'pg';
  //   const pool = new Pool({ connectionString });
  //   return { query: (sql, params) => pool.query(sql, params ?? []) };
  console.warn('[db] Real DB client not yet wired – falling back to mock');
  return createMockClient();
}

export const db: DbClient = Bun.env.DATABASE_URL
  ? createRealClient(Bun.env.DATABASE_URL)
  // Intentional fallback: when DATABASE_URL is absent the app runs against mock
  // data so routes can still be exercised without a live database.
  // TODO: remove this comment once real pg integration lands.
  : createMockClient();
