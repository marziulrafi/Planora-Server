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

const normalizeOrigin = (origin?: string) => origin?.replace(/\/$/, "") || "";
const allowedOrigins = [
  normalizeOrigin(process.env.FRONTEND_URL || process.env.CLIENT_URL || process.env.APP_URL),
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(normalizeOrigin(origin))) return callback(null, true);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", toNodeHandler(auth));
app.use("/auth", toNodeHandler(auth));
app.use("/api/v1/auth", toNodeHandler(auth));
app.use("/api/account", authRoutes);
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
