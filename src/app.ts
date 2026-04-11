import express, { Application } from 'express';
import { toNodeHandler } from "better-auth/node";
import { auth } from './lib/auth';
import cors from 'cors';

const app : Application =  express();

app.use(cors ({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true,
}))
app.use("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to Planora');
});


export default app;