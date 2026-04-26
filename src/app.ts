import express, { Application } from 'express';
import { toNodeHandler } from "better-auth/node";
import { auth } from './lib/auth';
import cors from 'cors';

import authRoutes from "./modules/auth/auth.routes";
import eventRoutes from "./modules/event/event.routes";
import participantRoutes from "./modules/participant/participant.routes";
import reviewRoutes from "./modules/review/review.routes";
import adminRoutes from "./modules/admin/admin.routes";
import invitationRoutes from "./modules/invitation/invitation.routes";
import paymentRoutes from "./modules/payment/payment.routes";
import userRoutes from "./modules/users/user.routes";

const app: Application = express();

app.set("trust proxy", 1);

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    process.env.CLIENT_URL,
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth/*splat", toNodeHandler(auth));

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/users", userRoutes);


app.get('/', (_req, res) => {
    res.json({ success: true, data: "Welcome to Planora" });
});

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use("/api/*path", (_req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

export default app;
