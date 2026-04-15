import express, { Router } from "express";
import { AdminController } from "./admin.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router() as any;

router.use(auth(UserRole.ADMIN));

router.get("/stats", AdminController.getDashboardStats);
router.get("/users", AdminController.getAllUsers);
router.delete("/users/:userId", AdminController.deleteUser);
router.get("/events", AdminController.getAllEventsAdmin);
router.delete("/events/:eventId", AdminController.deleteEventAdmin);

export default router;