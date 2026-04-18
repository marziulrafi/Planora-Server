import { Request, Response } from "express";
import { PaymentService } from "./payment.service";

const initiatePayment = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { eventId } = req.body;
        const result = await PaymentService.initiatePayment(user?.id as string, eventId);
        res.status(200).json(result);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Payment initiation failed";
        res.status(400).json({ error: msg, details: e });
    }
};

const handleSuccess = async (req: Request, res: Response) => {
    try {
        const { tran_id } = req.body;
        await PaymentService.handleSuccess(tran_id);
        res.redirect(`${process.env.CLIENT_URL}/payment/success?tran_id=${tran_id}`);
    } catch (e) {
        res.redirect(`${process.env.CLIENT_URL}/payment/fail`);
    }
};

const handleFail = async (req: Request, res: Response) => {
    try {
        const { tran_id } = req.body;
        await PaymentService.handleFail(tran_id);
        res.redirect(`${process.env.CLIENT_URL}/payment/fail`);
    } catch (e) {
        res.redirect(`${process.env.CLIENT_URL}/payment/fail`);
    }
};

const handleCancel = async (req: Request, res: Response) => {
    try {
        const { tran_id } = req.body;
        await PaymentService.handleCancel(tran_id);
        res.redirect(`${process.env.CLIENT_URL}/payment/cancel`);
    } catch (e) {
        res.redirect(`${process.env.CLIENT_URL}/payment/cancel`);
    }
};


export const PaymentController = {
    initiatePayment,
    handleSuccess,
    handleFail,
    handleCancel
}