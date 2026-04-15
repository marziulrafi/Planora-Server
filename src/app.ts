import express, { Application } from 'express';
import { toNodeHandler } from "better-auth/node";
import { auth } from './lib/auth';
import cors from 'cors';
import authRoutes from "./modules/auth/auth.routes";
import eventRoutes from "./modules/event/event.routes";
import participantRoutes from "./modules/participant/participant.routes";
import reviewRoutes from "./modules/review/review.routes";
import adminRoutes from "./modules/admin/admin.routes";



const app: Application = express();

app.use(cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true,
}))


app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);


app.get('/', (req, res) => {
    res.send('Welcome to Planora');
});


app.use("/api/auth/*splat", toNodeHandler(auth));
export default app;