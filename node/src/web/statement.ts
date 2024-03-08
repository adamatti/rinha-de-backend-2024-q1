import { desc, eq, sql } from "drizzle-orm";
import { Request, Response } from "express";
import { DB, clientAlias, transactionAlias } from "../db";

export const buildStatement = ({ db }: { db: DB }) => {
	const clientQuery = db
		.select({
			balance: clientAlias.balance,
			limit: clientAlias.limit,
			value: transactionAlias.value,
			description: transactionAlias.description,
			createdAt: transactionAlias.createdAt,
		})
		.from(clientAlias)
		.leftJoin(transactionAlias, eq(transactionAlias.clientId, clientAlias.id))
		.where(eq(clientAlias.id, sql.placeholder("id")))
		.orderBy(desc(transactionAlias.id))
		.limit(10);;

	return async (req: Request<{ id: number }>, res: Response) => {
		try {
			const [clients] = await Promise.all([
				clientQuery.execute({ id: req.params.id }),
			]);

			if (clients.length === 0) {
				return res.status(404).json({ message: "Client not found" }).end();
			}

			const [client] = clients;
			const transactions  = clients.filter((c) => c.value !== null);

			res.json({
				saldo: {
					total: client.balance,
					data_extrato: new Date().toISOString(),
					limite: client.limit,
				},
				ultimas_transacoes: (transactions ?? []).map((t) => ({
					valor: Math.abs(t.value!),
					tipo: t.value! > 0 ? "c" : "d",
					descricao: t.description,
					realizada_em: t.createdAt!.toISOString(),
				})),
			});
		} catch (error) {
			console.error("Statement error: ", error);
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
};
