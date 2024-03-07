import express from "express";

const PORT = process.env.PORT || 3000;
const app = express();

app.get('/', (req, res) => {
    res.json({ message: 'Hello World' }).end();
});

app.listen(PORT, () => {
    console.log('App started')
});
