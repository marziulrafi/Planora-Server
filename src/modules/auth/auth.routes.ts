import { Router } from "express";
import { AuthController } from "./auth.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router() as any;

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