import { Request, Response } from "express";
import { InvitationService } from "./invitation.service";
import { sendError, sendSuccess } from "../../lib/http";

const sendInvitation = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        req.body.senderId = user?.id;
        const result = await InvitationService.sendInvitation(req.body);
        sendSuccess(res, result, 201);
    } catch (e) {
        sendError(res, e instanceof Error ? e.message : "Failed to send invitation", 400);
    }
};

const getMyInvitations = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const result = await InvitationService.getMyInvitations(user?.id as string);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, "Failed to fetch invitations", 400);
    }
};

const acceptInvitation = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const invitationId = String(req.params.invitationId);
        const result = await InvitationService.acceptInvitation(invitationId, user?.id as string);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, e instanceof Error ? e.message : "Failed to accept invitation", 400);
    }
};

const declineInvitation = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const invitationId = String(req.params.invitationId);
        const result = await InvitationService.declineInvitation(invitationId, user?.id as string);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, e instanceof Error ? e.message : "Failed to decline invitation", 400);
    }
};

export const InvitationController = {
    sendInvitation,
    getMyInvitations,
    acceptInvitation,
    declineInvitation,
};