
import { buildDB } from "./db";
import { buildServer } from "./web";

const main = async () => {
    const db = await buildDB();
    await buildServer({db});
}

main();
