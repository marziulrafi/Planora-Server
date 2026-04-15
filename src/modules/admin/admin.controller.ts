import { Request, Response } from "express";
import { AdminService } from "./admin.service";

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await AdminService.getAllUsers(req.query as any);
        res.status(200).json(result);
    } catch (e) {
        res.status(400).json({ error: "Failed to fetch users", details: e });
    }
};

const deleteUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const result = await AdminService.deleteUser(userId);
        res.status(200).json(result);
    } catch (e) {
        res.status(400).json({ error: "Failed to delete user", details: e });
    }
};

const getAllEventsAdmin = async (req: Request, res: Response) => {
    try {
        const result = await AdminService.getAllEventsAdmin(req.query as any);
        res.status(200).json(result);
    } catch (e) {
        res.status(400).json({ error: "Failed to fetch events", details: e });
    }
};

const deleteEventAdmin = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const result = await AdminService.deleteEventAdmin(eventId);
        res.status(200).json(result);
    } catch (e) {
        res.status(400).json({ error: "Failed to delete event", details: e });
    }
};

const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const result = await AdminService.getDashboardStats();
        res.status(200).json(result);
    } catch (e) {
        res.status(400).json({ error: "Failed to fetch dashboard stats", details: e });
    }
};

export const AdminController = {
    getAllUsers,
    deleteUser,
    getAllEventsAdmin,
    deleteEventAdmin,
    getDashboardStats,
};