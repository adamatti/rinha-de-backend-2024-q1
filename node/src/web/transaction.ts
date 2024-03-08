import { eq, sql } from "drizzle-orm";
import express, { type Request, type Response } from "express";
import { z } from "zod";
import type { DB } from "../db";
import { clientAlias, clientTable, transactionTable } from "../db";

const transactionSchema = z.object({
	valor: z.number().int().positive(),
	tipo: z.enum(["d", "c"]),
	descricao: z.string().min(1).max(10),
});

const updateValueAndReturn = async ({
	db,
	value,
	description,
	clientId,
}: {
	value: number;
	description: string;
	clientId: number;
	db: DB;
}) => {
	return await db.transaction(
		async (tx) => {
			await tx.insert(transactionTable).values({
				value,
				description,
				clientId,
			});
			const entities = await tx
				.update(clientTable)
				.set({ balance: sql`${clientTable.balance} + ${value}` })
				.where(eq(clientTable.id, clientId))
				.returning({
					balance: clientTable.balance,
				});

			return entities[0];
		},
		{ deferrable: false },
	);
};

export const buildTransactionRoute =
	({ db }: { db: DB }) =>
	async (req: Request<{ id: number }>, res: Response) => {
		let client: null | { balance: number; limit: number } = null;
		try {
			const zodResult = transactionSchema.safeParse(req.body);
			if (!zodResult.success) {
				return res.status(400).json(zodResult.error).end();
			}

			const clients = await db
				.select()
				.from(clientAlias)
				.where(eq(clientAlias.id, req.params.id))
				.limit(1);

			if (clients.length === 0) {
				return res.status(404).json({ message: "Client not found" }).end();
			}

			client = clients[0];

			if (zodResult.data.tipo === "d") {
				if (client.balance - zodResult.data.valor < -client.limit) {
					return res
						.status(422)
						.json({
							message: "Insufficient funds",
							balance: client.balance,
							limit: client.limit,
						})
						.end();
				}

				const entity = await updateValueAndReturn({
					db,
					value: -zodResult.data.valor,
					description: zodResult.data.descricao,
					clientId: req.params.id,
				});
				return res.json({
					limite: client.limit,
					saldo: entity.balance,
				});
			}
			const entity = await updateValueAndReturn({
				db,
				value: zodResult.data.valor,
				description: zodResult.data.descricao,
				clientId: req.params.id,
			});
			return res.json({
				limite: client.limit,
				saldo: entity.balance,
			});
		} catch (error) {
			if (error.constraint_name === "current_balance_within_limit") {
				// concurrency error
				return res
					.status(422)
					.json({
						message: "Insufficient funds",
						balance: client?.balance,
						limit: client?.limit,
					})
					.end();
			}
			console.error("Transaction error: ", error);
			res
				.status(500)
				.json({
					message: "Internal server error",
					details: error.message,
					body: req.body,
					clientId: req.params.id,
				})
				.end();
		}
	};
