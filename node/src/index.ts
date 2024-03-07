import express from "express";
import { buildDB } from "./db";

const PORT = process.env.PORT || 3000;
const app = express();

const buildServer = async () => {
    app.get('/', (req, res) => {
        res.json({ message: 'Hello World' }).end();
    });

    app.listen(PORT, async () => {
        console.log('App started')
    });
};

const main = async () => {
    const db = await buildDB();
    await buildServer();
}

main();
