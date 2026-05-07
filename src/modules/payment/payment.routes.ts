import express, { Router } from "express";
import { PaymentController } from "./payment.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router() as any;

router.post(
    "/initiate",
    auth(UserRole.USER, UserRole.ADMIN),
    PaymentController.initiatePayment
);

router.post(
    "/init",
    auth(UserRole.USER, UserRole.ADMIN),
    PaymentController.initiatePayment
);

router.get(
    "/my",
    auth(UserRole.USER, UserRole.ADMIN),
    PaymentController.getMyPayments
);

router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    PaymentController.handleWebhook
);

router.get("/success", PaymentController.handleSuccess);
router.get("/cancel", PaymentController.handleCancel);
router.get("/verify", PaymentController.verifyPayment);

export default router;