import { Request, Response } from "express";
import { AdminService } from "./admin.service";
import { sendError, sendSuccess } from "../../lib/http";

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await AdminService.getAllUsers(req.query as any);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, "Failed to fetch users", 400);
    }
};

const deleteUser = async (req: Request, res: Response) => {
    try {
        const userId = String(req.params.userId);
        const result = await AdminService.deleteUser(userId);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, "Failed to delete user", 400);
    }
};

const getAllEventsAdmin = async (req: Request, res: Response) => {
    try {
        const result = await AdminService.getAllEventsAdmin(req.query as any);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, "Failed to fetch events", 400);
    }
};

const deleteEventAdmin = async (req: Request, res: Response) => {
    try {
        const eventId = String(req.params.eventId);
        const result = await AdminService.deleteEventAdmin(eventId);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, "Failed to delete event", 400);
    }
};

const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const result = await AdminService.getDashboardStats();
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, "Failed to fetch dashboard stats", 400);
    }
};

export const AdminController = {
    getAllUsers,
    deleteUser,
    getAllEventsAdmin,
    deleteEventAdmin,
    getDashboardStats,
};