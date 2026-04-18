import { Router } from "express";
import { PaymentController } from "./payment.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router() as any;

router.post(
    "/initiate",
    auth(UserRole.USER, UserRole.ADMIN),
    PaymentController.initiatePayment
);


router.post("/success", PaymentController.handleSuccess);
router.post("/fail", PaymentController.handleFail);
router.post("/cancel", PaymentController.handleCancel);

export default router;