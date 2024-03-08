import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
export * from "./aliases";
export * from "./client";
export * from "./transaction";

export const DATABASE_URL =
	process.env.DATABASE_URL ||
	"postgres://postgres:postgres@localhost:5432/postgres"; // ?connection_limit=10000

export type DB = Awaited<ReturnType<typeof buildDB>>;

export const buildDB = async () => {
	const client = postgres(DATABASE_URL, {
		idle_timeout: 3000,
		prepare: false,
		max: (process.env.DATABASE_MAX ?? 25) as number,
	});
	const db = drizzle(client, {
		schema,
		logger: !!process.env.DB_LOGGER,
	});
	return db;
};
