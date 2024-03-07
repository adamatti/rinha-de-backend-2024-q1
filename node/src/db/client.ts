import { pgTable, serial, text, varchar, integer } from "drizzle-orm/pg-core";

export const clientTable = pgTable("clients", {
    id: integer("id").primaryKey(),
    limit: integer("limit").notNull(),
    balance: integer("balance").notNull().default(0),
})
