import { Request, Response } from "express";
import { ParticipantService } from "./participant.service";

const joinFreePublicEvent = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { eventId } = req.params;
        const result = await ParticipantService.joinFreePublicEvent(user?.id as string, eventId);
        res.status(201).json(result);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to join event";
        res.status(400).json({ error: msg, details: e });
    }
};

const requestToJoin = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { eventId } = req.params;
        const result = await ParticipantService.requestToJoin(user?.id as string, eventId);
        res.status(201).json(result);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to request join";
        res.status(400).json({ error: msg, details: e });
    }
};

const approveParticipant = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { eventId, userId } = req.params;
        const result = await ParticipantService.approveParticipant(eventId, userId, user?.id as string);
        res.status(200).json(result);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to approve participant";
        res.status(400).json({ error: msg, details: e });
    }
};

const rejectParticipant = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { eventId, userId } = req.params;
        const result = await ParticipantService.rejectParticipant(eventId, userId, user?.id as string);
        res.status(200).json(result);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to reject participant";
        res.status(400).json({ error: msg, details: e });
    }
};

const banParticipant = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { eventId, userId } = req.params;
        const result = await ParticipantService.banParticipant(eventId, userId, user?.id as string);
        res.status(200).json(result);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to ban participant";
        res.status(400).json({ error: msg, details: e });
    }
};

const getParticipantsByEvent = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { eventId } = req.params;
        const result = await ParticipantService.getParticipantsByEvent(eventId, user?.id as string);
        res.status(200).json(result);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to fetch participants";
        res.status(400).json({ error: msg, details: e });
    }
};

const getMyJoinedEvents = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const result = await ParticipantService.getMyJoinedEvents(user?.id as string);
        res.status(200).json(result);
    } catch (e) {
        res.status(400).json({ error: "Failed to fetch joined events", details: e });
    }
};

export const ParticipantController = {
    joinFreePublicEvent,
    requestToJoin,
    approveParticipant,
    rejectParticipant,
    banParticipant,
    getParticipantsByEvent,
    getMyJoinedEvents,
};