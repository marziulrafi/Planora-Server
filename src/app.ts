import express, { Application } from 'express';
import { toNodeHandler } from "better-auth/node";
import { auth } from './lib/auth';
import cors from 'cors';
import authRoutes from "./modules/auth/auth.routes";

const app: Application = express();

app.use(cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true,
}))


app.use(express.json());

app.use("/api/auth", authRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to Planora');
});


app.use("/api/auth/*splat", toNodeHandler(auth));
export default app;