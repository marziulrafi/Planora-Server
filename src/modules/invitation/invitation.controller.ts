import { Request, Response } from "express";
import { InvitationService } from "./invitation.service";
import { sendError, sendSuccess } from "../../lib/http";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getErrorStatus = (error: unknown, fallback = 400) => {
    if (
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        typeof (error as { statusCode: unknown }).statusCode === "number"
    ) {
        return (error as { statusCode: number }).statusCode;
    }
    return fallback;
};

const sendInvitation = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) {
            return sendError(res, "Unauthorized", 401);
        }
        const { email, eventId } = req.body as { email?: string; eventId?: string };

        if (!email || !EMAIL_REGEX.test(email.trim())) {
            return sendError(res, "A valid email is required", 400);
        }
        if (!eventId || typeof eventId !== "string") {
            return sendError(res, "Event id is required", 400);
        }

        const result = await InvitationService.sendInvitation({
            senderId: req.user.id,
            email,
            eventId,
        });
        sendSuccess(res, result, 201);
    } catch (e) {
        sendError(
            res,
            e instanceof Error ? e.message : "Failed to send invitation",
            getErrorStatus(e, 400)
        );
    }
};

const getMyInvitations = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) {
            return sendError(res, "Unauthorized", 401);
        }
        const result = await InvitationService.getMyInvitations(req.user.id);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, "Failed to fetch invitations", 400);
    }
};

const acceptInvitation = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) {
            return sendError(res, "Unauthorized", 401);
        }
        const invitationId = String(req.params.invitationId);
        const result = await InvitationService.acceptInvitation(invitationId, req.user.id);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, e instanceof Error ? e.message : "Failed to accept invitation", getErrorStatus(e, 400));
    }
};

const declineInvitation = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) {
            return sendError(res, "Unauthorized", 401);
        }
        const invitationId = String(req.params.invitationId);
        const result = await InvitationService.declineInvitation(invitationId, req.user.id);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, e instanceof Error ? e.message : "Failed to decline invitation", getErrorStatus(e, 400));
    }
};

export const InvitationController = {
    sendInvitation,
    getMyInvitations,
    acceptInvitation,
    declineInvitation,
};