import { Request, Response } from "express";
import { PaymentService } from "./payment.service";
import { sendError, sendSuccess } from "../../lib/http";

const normalizeUrl = (value?: string) =>
    String(value || "").trim().replace(/\/+$/, "").replace(/\/api$/i, "");

const getClientUrl = () =>
    normalizeUrl(
        process.env.CLIENT_URL ||
        process.env.APP_URL ||
        process.env.FRONTEND_URL ||
        "http://localhost:3000"
    );

const safeString = (value: unknown): string => {
    if (typeof value === "string") return value.trim();
    if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
    if (Array.isArray(value)) {
        for (const item of value) {
            const normalized = safeString(item);
            if (normalized) return normalized;
        }
    }
    return "";
};

const pickValue = (source: Record<string, unknown>, keys: string[]): string => {
    for (const key of keys) {
        const value = safeString(source[key]);
        if (value) return value;
    }
    return "";
};


const initiatePayment = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const eventId = safeString((req.body as Record<string, unknown>)?.eventId);
        if (!eventId) {
            return sendError(res, "Missing event id", 400);
        }
        const result = await PaymentService.initiatePayment(user?.id as string, eventId);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, e instanceof Error ? e.message : "Payment initiation failed", 400);
    }
};

const handleWebhook = async (req: Request, res: Response) => {
    const signature = safeString(req.headers["stripe-signature"]);

    if (!signature) {
        return sendError(res, "Missing Stripe signature", 400);
    }

    try {
        await PaymentService.handleWebhook(req.body as Buffer, signature);
        return sendSuccess(res, { received: true });
    } catch (e) {
        const message = e instanceof Error ? e.message : "Webhook processing failed";
        console.error("[payment/webhook] failed", { error: message });
        return sendError(res, message, 400);
    }
};

const handleSuccess = async (req: Request, res: Response) => {
    const querySource = (req.query ?? {}) as Record<string, unknown>;
    const tranId = pickValue(querySource, ["tran_id", "tranId"]);
    const sessionIdRaw = pickValue(querySource, ["session_id", "sessionId"]);

    const sessionId: string | undefined = sessionIdRaw || undefined;

    if (!tranId) {
        return sendError(res, "Missing transaction id", 400);
    }

    try {
        await PaymentService.handleSuccess(
            sessionId ? { tranId, sessionId } : { tranId }
        );
        return sendSuccess(res, { tranId, status: "SUCCESS" });
    } catch (e) {
        const message = e instanceof Error ? e.message : "Payment success processing failed";
        console.error("[payment/success] failed", { tranId, sessionId, error: message });
        return sendError(res, message, 400);
    }
};

const handleCancel = async (req: Request, res: Response) => {
    const querySource = (req.query ?? {}) as Record<string, unknown>;
    const tranId = pickValue(querySource, ["tran_id", "tranId"]);

    try {
        if (tranId) await PaymentService.handleCancel(tranId);
        return sendSuccess(res, { tranId: tranId || null, status: "CANCELLED" });
    } catch (e) {
        const message = e instanceof Error ? e.message : "Payment cancel processing failed";
        console.error("[payment/cancel] failed", { tranId, error: message });
        return sendError(res, message, 400);
    }
};


const verifyPayment = async (req: Request, res: Response) => {
    try {
        const querySource = (req.query ?? {}) as Record<string, unknown>;
        const bodySource =
            req.body && typeof req.body === "object"
                ? (req.body as Record<string, unknown>)
                : ({} as Record<string, unknown>);

        const tranId = pickValue({ ...querySource, ...bodySource }, ["tran_id", "tranId"]);
        if (!tranId) {
            return sendError(res, "Missing transaction id", 400);
        }

        const payment = await PaymentService.getPaymentByTranId(tranId);
        if (!payment) return sendError(res, "Payment not found", 404);
        sendSuccess(res, payment);
    } catch (e) {
        sendError(res, e instanceof Error ? e.message : "Verification failed", 400);
    }
};

const getMyPayments = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const result = await PaymentService.getMyPayments(user?.id as string);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, "Failed to fetch payments", 400);
    }
};

export const PaymentController = {
    initiatePayment,
    handleWebhook,
    handleSuccess,
    handleCancel,
    getMyPayments,
    verifyPayment,
};