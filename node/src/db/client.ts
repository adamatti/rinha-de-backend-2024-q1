import {
	PgColumn,
	PgTableWithColumns,
	alias,
	index,
	integer,
	pgTable,
	serial,
	text,
	varchar,
} from "drizzle-orm/pg-core";

export const clientTable = pgTable(
	"clients",
	{
		id: integer("id").primaryKey(),
		limit: integer("limit").notNull(),
		balance: integer("balance").notNull().default(0),
	},
	(t) => ({
		idIdx: index("client_id_idx").on(t.id),
	}),
);
