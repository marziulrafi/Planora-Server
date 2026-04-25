import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { AdminController } from "../admin/admin.controller";

const router = Router() as any;

router.use(auth(UserRole.ADMIN));

router.get("/", AdminController.getAllUsers);
router.delete("/:userId", AdminController.deleteUser);

export default router;
