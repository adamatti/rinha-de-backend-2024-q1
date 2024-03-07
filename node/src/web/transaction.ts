import express, {Request, Response} from "express";
import { DB } from "../db";
import { clientAlias, clientTable } from "../db/client";
import {eq, sql} from 'drizzle-orm';
import {z} from 'zod'
import { transactionTable } from "../db/transaction";

const transactionSchema = z.object({
    valor: z.number().min(1),
    tipo: z.enum(['d', 'c']),
    descricao: z.string().min(1).max(10)
})

const updateValueAndReturn = async ({
    db, value, description, clientId
}: {
    value: number,
    description: string,
    clientId: number,
    db: DB,
}) => {
    return await db.transaction(async (tx) => {
        const [,entity] = await Promise.all([
            tx.insert(transactionTable).values({
                value,
                description,
                clientId,
            }),
            tx.update(clientTable)
                .set({balance: sql`${clientTable.balance} + ${value}`})
                .where(eq(clientTable.id, clientId))
                .returning({
                    balance: clientTable.balance
                })
        ]);
        return entity[0];
    });
}

export const buildTransactionRoute = ({db}: {db: DB}) => async (req: Request<{id: number}>, res: Response) => {
    const zodResult = transactionSchema.safeParse(req.body);
    if (!zodResult.success) {
        return res.status(400).json(zodResult.error).end();
    }
    
    const clients = await db.select()
        .from(clientAlias)
        .where(eq(clientAlias.id, req.params.id))
        .limit(1);

    if (clients.length === 0) {
        return res.status(404).json({message: 'Client not found'}).end();
    }
    
    const [client] = clients;

    if (zodResult.data.tipo === 'd' ) {
        if (client.balance - zodResult.data.valor < -client.limit) {
            return res.status(422).json({
                message: 'Insufficient funds',
                balance: client.balance,
                limit: client.limit,
            }).end();
        }

        const entity = await updateValueAndReturn({
            db,
            value: -zodResult.data.valor,
            description: zodResult.data.descricao,
            clientId: req.params.id,
        })
        return res.json({
            limite: client.limit,
            saldo: entity.balance,
        })

    } else {
        const entity = await updateValueAndReturn({
            db,
            value: zodResult.data.valor,
            description: zodResult.data.descricao,
            clientId: req.params.id,
        })
        return res.json({
            limite: client.limit,
            saldo: entity.balance,
        })
    }
}