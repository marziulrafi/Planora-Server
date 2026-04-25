import { Request, Response } from "express";
import { PaymentService } from "./payment.service";
import { sendError, sendSuccess } from "../../lib/http";

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
    const bodyTranId = typeof req.body?.tran_id === "string" ? req.body.tran_id : undefined;
    const queryTranId = typeof req.query?.tran_id === "string" ? req.query.tran_id : undefined;
    const tranId = bodyTranId || queryTranId;
    try {
        if (!tranId) {
            throw new Error("Missing transaction id");
        }
        await PaymentService.handleSuccess(tranId);
        const clientUrl = process.env.CLIENT_URL || process.env.APP_URL || "http://localhost:3000";
        res.redirect(`${clientUrl}/payment/success?tran_id=${tranId}`);
    } catch (e) {
        const clientUrl = process.env.CLIENT_URL || process.env.APP_URL || "http://localhost:3000";
        const query = tranId ? `?tran_id=${tranId}` : "";
        res.redirect(`${clientUrl}/payment/fail${query}`);
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
    const tranId =
        typeof req.body?.tran_id === "string"
            ? req.body.tran_id
            : typeof req.query?.tran_id === "string"
              ? req.query.tran_id
              : undefined;
    try {
        if (tranId) await PaymentService.handleFail(tranId);
    } catch {
       
    } finally {
        const clientUrl = process.env.APP_URL || process.env.CLIENT_URL || "http://localhost:3000";
        const query = tranId ? `?tran_id=${tranId}` : "";
        res.redirect(`${clientUrl}/payment/fail${query}`);
    }
};

const handleCancel = async (req: Request, res: Response) => {
    const tranId =
        typeof req.body?.tran_id === "string"
            ? req.body.tran_id
            : typeof req.query?.tran_id === "string"
              ? req.query.tran_id
              : undefined;
    try {
        if (tranId) await PaymentService.handleCancel(tranId);
    } catch {
       
    } finally {
        const clientUrl = process.env.APP_URL || process.env.CLIENT_URL || "http://localhost:3000";
        const query = tranId ? `?tran_id=${tranId}` : "";
        res.redirect(`${clientUrl}/payment/cancel${query}`);
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