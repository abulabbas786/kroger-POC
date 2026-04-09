import { Pool, type QueryResultRow } from "pg";

const defaultPort = Number(process.env.DB_PORT ?? 5432);
const connectionTimeoutMs = Number(process.env.DB_CONNECTION_TIMEOUT_MS ?? 30000);
const idleTimeoutMs = Number(process.env.DB_IDLE_TIMEOUT_MS ?? 30000);
const maxRetries = Number(process.env.DB_QUERY_RETRIES ?? 1);

function isTimeoutError(error: unknown): boolean {
    const err = error as { message?: string; code?: string };
    return err?.message?.includes("Connection terminated due to connection timeout")
        || err?.message?.includes("timeout expired")
        || err?.code === "ETIMEDOUT";
}

function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: 10,
            connectionTimeoutMillis: Number.isNaN(connectionTimeoutMs) ? 30000 : connectionTimeoutMs,
            idleTimeoutMillis: Number.isNaN(idleTimeoutMs) ? 30000 : idleTimeoutMs,
        }
        : {
            host: process.env.DB_HOST ?? "localhost",
            port: Number.isNaN(defaultPort) ? 5432 : defaultPort,
            database: process.env.DB_NAME ?? "neondb",
            user: process.env.DB_USER ?? "neondb_owner",
            password: process.env.DB_PASSWORD,
            ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false },
            max: 10,
            connectionTimeoutMillis: Number.isNaN(connectionTimeoutMs) ? 30000 : connectionTimeoutMs,
            idleTimeoutMillis: Number.isNaN(idleTimeoutMs) ? 30000 : idleTimeoutMs,
        }
);

pool.on("error", (error) => {
    console.error("Postgres pool error", error);
});

export async function query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params: unknown[] = []
) {
    let attempt = 0;

    while (true) {
        try {
            return await pool.query<T>(text, params);
        } catch (error: any) {
            if (error?.code === "ECONNRESET") {
                throw new Error("Database connection reset. Verify Neon DATABASE_URL and network access.");
            }

            const retries = Number.isNaN(maxRetries) ? 1 : Math.max(0, maxRetries);
            if (isTimeoutError(error) && attempt < retries) {
                attempt += 1;
                await wait(500 * attempt);
                continue;
            }

            if (isTimeoutError(error)) {
                throw new Error("Database connection timeout. Verify Neon connection string/network and retry. If Neon was idle, wait a few seconds and try again.");
            }

            throw error;
        }
    }
}

export default pool;