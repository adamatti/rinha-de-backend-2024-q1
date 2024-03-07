import express from "express";
import { buildTransactionRoute } from "./transaction";

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

export const buildServer = async ({db} : {db: DB}) => {
    app.get('/', (req, res) => {
        res.json({ message: 'Hello World' }).end();
    });

    app.post('/clientes/:id/transacoes', buildTransactionRoute({db}));

    app.listen(PORT, async () => {
        console.log('App started')
    });
};

