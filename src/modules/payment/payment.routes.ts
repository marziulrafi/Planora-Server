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

const callbackBodyParser = express.text({ type: "*/*", limit: "1mb" });

router.all("/success", callbackBodyParser, PaymentController.handleSuccess);
router.all("/fail", callbackBodyParser, PaymentController.handleFail);
router.all("/cancel", callbackBodyParser, PaymentController.handleCancel);

router.get("/verify", PaymentController.verifyPayment);

export default router;