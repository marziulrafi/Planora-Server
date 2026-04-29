import { Request, Response } from "express";
import { ParticipantService } from "./participant.service";
import { sendError, sendSuccess } from "../../lib/http";

const joinFreePublicEvent = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) {
            return sendError(res, "Unauthorized", 401);
        }
        const eventId = String(req.params.eventId);
        const result = await ParticipantService.joinFreePublicEvent(req.user.id, eventId);
        sendSuccess(res, result, 201);
    } catch (e) {
        sendError(res, e instanceof Error ? e.message : "Failed to join event", 400);
    }
};

const createParticipant = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) {
            return sendError(res, "Unauthorized", 401);
        }
        const result = await ParticipantService.createParticipant(req.user.id, req.body);
        sendSuccess(res, result, 201);
    } catch (e) {
        sendError(res, e instanceof Error ? e.message : "Failed to create participant", 400);
    }
};

const requestToJoin = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) {
            return sendError(res, "Unauthorized", 401);
        }
        const eventId = String(req.params.eventId);
        const result = await ParticipantService.requestToJoin(req.user.id, eventId);
        sendSuccess(res, result, 201);
    } catch (e) {
        sendError(res, e instanceof Error ? e.message : "Failed to request join", 400);
    }
};

const approveParticipant = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) {
            return sendError(res, "Unauthorized", 401);
        }
        const eventId = String(req.params.eventId);
        const userId = String(req.params.userId);
        const result = await ParticipantService.approveParticipant(eventId, userId, req.user.id);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, e instanceof Error ? e.message : "Failed to approve participant", 400);
    }
};

const rejectParticipant = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) {
            return sendError(res, "Unauthorized", 401);
        }
        const eventId = String(req.params.eventId);
        const userId = String(req.params.userId);
        const result = await ParticipantService.rejectParticipant(eventId, userId, req.user.id);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, e instanceof Error ? e.message : "Failed to reject participant", 400);
    }
};

const banParticipant = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) {
            return sendError(res, "Unauthorized", 401);
        }
        const eventId = String(req.params.eventId);
        const userId = String(req.params.userId);
        const result = await ParticipantService.banParticipant(eventId, userId, req.user.id);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, e instanceof Error ? e.message : "Failed to ban participant", 400);
    }
};

const getParticipantsByEvent = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) {
            return sendError(res, "Unauthorized", 401);
        }
        const eventId = String(req.params.eventId);
        const result = await ParticipantService.getParticipantsByEvent(eventId, req.user.id);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, e instanceof Error ? e.message : "Failed to fetch participants", 400);
    }
};

const getMyJoinedEvents = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) {
            return sendError(res, "Unauthorized", 401);
        }
        const result = await ParticipantService.getMyJoinedEvents(req.user.id);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, "Failed to fetch joined events", 400);
    }
};

export const ParticipantController = {
    joinFreePublicEvent,
    createParticipant,
    requestToJoin,
    approveParticipant,
    rejectParticipant,
    banParticipant,
    getParticipantsByEvent,
    getMyJoinedEvents,
};