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


export const PaymentController = {
    initiatePayment,
    
}