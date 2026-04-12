import express, { Router } from "express";
import { AuthController } from "./auth.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router() as any;

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

router.get(
    "/me",
    auth(UserRole.USER, UserRole.ADMIN),
    AuthController.getMe
);
router.patch(
    "/profile",
    auth(UserRole.USER, UserRole.ADMIN),
    AuthController.updateProfile
);

export default router;