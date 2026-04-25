import { Request, Response } from "express";
import { EventService } from "./event.service";
import { sendError, sendSuccess } from "../../lib/http";

const createEvent = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        req.body.ownerId = user?.id;
        const result = await EventService.createEvent(req.body);
        sendSuccess(res, result, 201);
    } catch (e) {
        sendError(res, e instanceof Error ? e.message : "Event creation failed", 400);
    }
};

const getAllEvents = async (req: Request, res: Response) => {
    try {
        const result = await EventService.getAllEvents(req.query as any);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, "Failed to fetch events", 400);
    }
};

const getFeaturedEvent = async (req: Request, res: Response) => {
    try {
        const result = await EventService.getFeaturedEvent();
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, "Failed to fetch featured event", 400);
    }
};

const getUpcomingEvents = async (req: Request, res: Response) => {
    try {
        const result = await EventService.getUpcomingEvents();
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, "Failed to fetch upcoming events", 400);
    }
};

const getMyEvents = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const result = await EventService.getMyEvents(user?.id as string);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, "Failed to fetch your events", 400);
    }
};

const getEventById = async (req: Request, res: Response) => {
    try {
        const eventId = String(req.params.eventId);
        const result = await EventService.getEventById(eventId);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, "Event not found", 404);
    }
};

const updateEvent = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const eventId = String(req.params.eventId);
        const result = await EventService.updateEvent(eventId, user?.id as string, req.body);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, e instanceof Error ? e.message : "Event update failed", 400);
    }
};

const deleteEvent = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const eventId = String(req.params.eventId);
        const result = await EventService.deleteEvent(eventId, user?.id as string, user?.role as string);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, e instanceof Error ? e.message : "Event delete failed", 400);
    }
};

const setFeaturedEvent = async (req: Request, res: Response) => {
    try {
        const eventId = String(req.params.eventId);
        const result = await EventService.setFeaturedEvent(eventId);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, "Failed to set featured event", 400);
    }
};

export const EventController = {
    createEvent,
    getAllEvents,
    getFeaturedEvent,
    getUpcomingEvents,
    getMyEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    setFeaturedEvent,
};