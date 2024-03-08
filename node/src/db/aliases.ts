import { alias } from "drizzle-orm/pg-core";
import { clientTable } from "./client";
import { transactionTable } from "./transaction";

export const transactionAlias = alias(transactionTable, "t");
export const clientAlias = alias(clientTable, "c");
