import { PgColumn, PgTableWithColumns, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "./schema";

export const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres";

export const buildDB = async () => {
    const client = new Client({
        connectionString: DATABASE_URL,
    });

    await client.connect();
    const db = drizzle(client, {schema});
    // await migrate(db, { migrationsFolder: "../../db" });
    return db;
}
