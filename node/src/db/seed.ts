import { clientTable } from "./client";
import { buildDB } from "./index";
import { transactionTable } from "./transaction";

const main = async () => {
	const db = await buildDB();

	await db.delete(transactionTable);
	await db.delete(clientTable);

	await db.insert(clientTable).values([
		{ id: 1, limit: 100000 },
		{ id: 2, limit: 80000 },
		{ id: 3, limit: 1000000 },
		{ id: 4, limit: 10000000 },
		{ id: 5, limit: 500000 },
	]);
	console.log("Done");
	process.exit(0);
};

main();
