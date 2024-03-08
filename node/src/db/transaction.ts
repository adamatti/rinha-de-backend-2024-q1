import {
	alias,
	date,
	index,
	integer,
	pgTable,
	serial,
	text,
	time,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { clientTable } from "./client";

export const transactionTable = pgTable(
	"transactions",
	{
		id: serial("id").primaryKey(),
		value: integer("value").notNull(),
		description: text("description").notNull(),
		clientId: integer("client_id")
			.notNull()
			.references(() => clientTable.id),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
	},
	(t) => ({
		idIdx: index("transaction_id_idx").on(t.id),
		clientIdIdx: index("transaction_client_id_idx").on(t.clientId),
	}),
);
