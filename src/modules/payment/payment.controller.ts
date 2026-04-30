import { Request, Response } from "express";
import { PaymentService } from "./payment.service";
import { sendError, sendSuccess } from "../../lib/http";

const getClientUrl = () =>
    process.env.CLIENT_URL || process.env.APP_URL || process.env.FRONTEND_URL || "http://localhost:3000";

const safeString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const getCallbackPayload = (req: Request) => {
    const bodySource =
        req.body && typeof req.body === "object"
            ? (req.body as Record<string, unknown>)
            : ({} as Record<string, unknown>);
    const querySource =
        req.query && typeof req.query === "object"
            ? (req.query as Record<string, unknown>)
            : ({} as Record<string, unknown>);
    const merged = { ...querySource, ...bodySource };

    return {
        tranId: safeString(merged.tran_id),
        status: safeString(merged.status),
        valId: safeString(merged.val_id),
    };
};

const shouldRedirect = (req: Request) => {
    const accept = safeString(req.headers.accept);
    const userAgent = safeString(req.headers["user-agent"]);
    return accept.includes("text/html") || userAgent.toLowerCase().includes("mozilla");
};

const redirectWithQuery = (res: Response, path: string, tranId?: string) => {
    const clientUrl = getClientUrl().replace(/\/$/, "");
    const query = tranId ? `?tran_id=${encodeURIComponent(tranId)}` : "";
    return res.redirect(`${clientUrl}${path}${query}`);
};

const initiatePayment = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { eventId } = req.body;
        const result = await PaymentService.initiatePayment(user?.id as string, eventId);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, e instanceof Error ? e.message : "Payment initiation failed", 400);
    }
};

const handleSuccess = async (req: Request, res: Response) => {
    const { tranId, status, valId } = getCallbackPayload(req);
    try {
        if (!tranId) {
            const message = "Missing transaction id in payment success callback";
            console.error("[payment/success] invalid callback payload", { body: req.body, query: req.query });
            if (shouldRedirect(req)) {
                return redirectWithQuery(res, "/payment/fail");
            }
            return sendError(res, message, 400);
        }

        await PaymentService.handleSuccess({ tranId, status, valId });
        if (shouldRedirect(req)) {
            return redirectWithQuery(res, "/payment/success", tranId);
        }
        return sendSuccess(res, { tranId, status: "SUCCESS" });
    } catch (e) {
        const message = e instanceof Error ? e.message : "Payment success processing failed";
        console.error("[payment/success] failed to process callback", {
            tranId,
            status,
            valId,
            body: req.body,
            query: req.query,
            error: message,
        });
        if (shouldRedirect(req)) {
            return redirectWithQuery(res, "/payment/fail", tranId || undefined);
        }
        return sendError(res, message, 400);
    }
};

const verifyPayment = async (req: Request, res: Response) => {
    try {
        const tranId = req.query?.tran_id;
        if (!tranId || typeof tranId !== "string") {
            return sendError(res, "Missing transaction id", 400);
        }
        const payment = await PaymentService.getPaymentByTranId(tranId);
        if (!payment) return sendError(res, "Payment not found", 404);
        sendSuccess(res, payment);
    } catch (e) {
        sendError(res, e instanceof Error ? e.message : "Verification failed", 400);
    }
};

const handleFail = async (req: Request, res: Response) => {
    const { tranId } = getCallbackPayload(req);
    try {
        if (tranId) await PaymentService.handleFail(tranId);
    } catch (e) {
        const message = e instanceof Error ? e.message : "Payment fail processing failed";
        console.error("[payment/fail] failed to process callback", {
            tranId,
            body: req.body,
            query: req.query,
            error: message,
        });
        if (!shouldRedirect(req)) {
            return sendError(res, message, 400);
        }
    } finally {
        if (shouldRedirect(req)) {
            return redirectWithQuery(res, "/payment/fail", tranId || undefined);
        }
        return sendSuccess(res, { tranId: tranId || null, status: "FAILED" });
    }
};

const handleCancel = async (req: Request, res: Response) => {
    const { tranId } = getCallbackPayload(req);
    try {
        if (tranId) await PaymentService.handleCancel(tranId);
    } catch (e) {
        const message = e instanceof Error ? e.message : "Payment cancel processing failed";
        console.error("[payment/cancel] failed to process callback", {
            tranId,
            body: req.body,
            query: req.query,
            error: message,
        });
        if (!shouldRedirect(req)) {
            return sendError(res, message, 400);
        }
    } finally {
        if (shouldRedirect(req)) {
            return redirectWithQuery(res, "/payment/cancel", tranId || undefined);
        }
        return sendSuccess(res, { tranId: tranId || null, status: "CANCELLED" });
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
    handleSuccess,
    handleFail,
    handleCancel,
    getMyPayments,
    verifyPayment,
};