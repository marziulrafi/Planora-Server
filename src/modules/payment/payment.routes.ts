import express, { Router } from "express";
import { PaymentController } from "./payment.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router() as any;

// ─── Authenticated Routes ─────────────────────────────────────────────────────

router.post(
    "/initiate",
    auth(UserRole.USER, UserRole.ADMIN),
    PaymentController.initiatePayment
);

// Alias kept for backward compatibility
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

// ─── Stripe Webhook ───────────────────────────────────────────────────────────
// CRITICAL: This route MUST use express.raw() so the raw Buffer is available.
// Stripe verifies the webhook signature against the raw body — any other parser
// (json, urlencoded, text) will mutate the body and break verification.

router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    PaymentController.handleWebhook
);

// ─── Frontend Redirect Callbacks ──────────────────────────────────────────────
// Stripe redirects the user's browser back to CLIENT_URL/payment/success or cancel.
// These API routes are called by the frontend to confirm the outcome server-side.

router.get("/success", PaymentController.handleSuccess);
router.get("/cancel", PaymentController.handleCancel);

// ─── Verification ─────────────────────────────────────────────────────────────

router.get("/verify", PaymentController.verifyPayment);

export default router;