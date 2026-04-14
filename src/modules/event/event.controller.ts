import { Request, Response } from "express";
import { EventService } from "./event.service";

const createEvent = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        req.body.ownerId = user?.id;
        const result = await EventService.createEvent(req.body);
        res.status(201).json(result);
    } catch (e) {
        res.status(400).json({ error: "Event creation failed", details: e });
    }
};

const getAllEvents = async (req: Request, res: Response) => {
    try {
        const result = await EventService.getAllEvents(req.query as any);
        res.status(200).json(result);
    } catch (e) {
        res.status(400).json({ error: "Failed to fetch events", details: e });
    }
};

const getFeaturedEvent = async (req: Request, res: Response) => {
    try {
        const result = await EventService.getFeaturedEvent();
        res.status(200).json(result);
    } catch (e) {
        res.status(400).json({ error: "Failed to fetch featured event", details: e });
    }
};

const getUpcomingEvents = async (req: Request, res: Response) => {
    try {
        const result = await EventService.getUpcomingEvents();
        res.status(200).json(result);
    } catch (e) {
        res.status(400).json({ error: "Failed to fetch upcoming events", details: e });
    }
};

const getEventById = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const result = await EventService.getEventById(eventId);
        res.status(200).json(result);
    } catch (e) {
        res.status(404).json({ error: "Event not found", details: e });
    }
};

const updateEvent = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { eventId } = req.params;
        const result = await EventService.updateEvent(eventId, user?.id as string, req.body);
        res.status(200).json(result);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Event update failed";
        res.status(400).json({ error: msg, details: e });
    }
};

const deleteEvent = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { eventId } = req.params;
        const result = await EventService.deleteEvent(eventId, user?.id as string, user?.role as string);
        res.status(200).json(result);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Event delete failed";
        res.status(400).json({ error: msg, details: e });
    }
};

const setFeaturedEvent = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const result = await EventService.setFeaturedEvent(eventId);
        res.status(200).json(result);
    } catch (e) {
        res.status(400).json({ error: "Failed to set featured event", details: e });
    }
};

export const EventController = {
    createEvent,
    getAllEvents,
    getFeaturedEvent,
    getUpcomingEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    setFeaturedEvent,
};