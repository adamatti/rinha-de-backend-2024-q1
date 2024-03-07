import { pgTable, serial, text, varchar, integer, PgColumn, PgTableWithColumns, alias } from "drizzle-orm/pg-core";

export const clientTable = pgTable("clients", {
    id: integer("id").primaryKey(),
    limit: integer("limit").notNull(),
    balance: integer("balance").notNull().default(0),
})

export const clientAlias = alias(clientTable, "c");

