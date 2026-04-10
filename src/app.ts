import express, { Application } from 'express';
import { toNodeHandler } from "better-auth/node";
import { auth } from './lib/auth';


const app : Application =  express();

app.use("/auth", toNodeHandler(auth));
app.use("/api/auth", toNodeHandler(auth));

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to Planora');
});


export default app;