import { Request, Response } from "express";
import { InvitationService } from "./invitation.service";

const sendInvitation = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        req.body.senderId = user?.id;
        const result = await InvitationService.sendInvitation(req.body);
        res.status(201).json(result);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to send invitation";
        res.status(400).json({ error: msg, details: e });
    }
};

const getMyInvitations = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const result = await InvitationService.getMyInvitations(user?.id as string);
        res.status(200).json(result);
    } catch (e) {
        res.status(400).json({ error: "Failed to fetch invitations", details: e });
    }
};

const acceptInvitation = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { invitationId } = req.params;
        const result = await InvitationService.acceptInvitation(invitationId, user?.id as string);
        res.status(200).json(result);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to accept invitation";
        res.status(400).json({ error: msg, details: e });
    }
};

const declineInvitation = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { invitationId } = req.params;
        const result = await InvitationService.declineInvitation(invitationId, user?.id as string);
        res.status(200).json(result);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to decline invitation";
        res.status(400).json({ error: msg, details: e });
    }
};

export const InvitationController = {
    sendInvitation,
    getMyInvitations,
    acceptInvitation,
    declineInvitation,
};