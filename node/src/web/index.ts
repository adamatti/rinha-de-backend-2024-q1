import express from "express";
import type { DB } from "../db";
import { buildStatement } from "./statement";
import { buildTransactionRoute } from "./transaction";

const PORT = process.env.PORT || 9999;
const app = express();
app.use(express.json());

export const buildServer = async ({ db }: { db: DB }) => {
	app.get("/", (req, res) => {
		res.json({ message: "Hello World" }).end();
	});

	app.post("/clientes/:id/transacoes", buildTransactionRoute({ db }));
	app.get("/clientes/:id/extrato", buildStatement({ db }));

	app.use((err, req, res, next) => {
		console.error("ERROR: ", err);
		res.status(500).json({ message: "Internal server error" }).end();
	});

	app.listen(PORT, async () => {
		console.log(`App started on port ${PORT}`);
	});
};
