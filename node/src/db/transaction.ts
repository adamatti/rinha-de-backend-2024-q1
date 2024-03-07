import { pgTable, serial, text, varchar, integer } from "drizzle-orm/pg-core";
import { clientTable } from "./client";

export const transactionTable = pgTable("transactions", {
    id: serial("id").primaryKey(),
    value: integer("value").notNull(),
    description: text("description").notNull(),
    clientId: integer("client_id").notNull().references(() => clientTable.id)
});