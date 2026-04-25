import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { sendError, sendSuccess } from "../../lib/http";

const getMe = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const result = await AuthService.getMe(user?.id as string);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, "Failed to fetch profile", 400);
    }
};

const updateProfile = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const result = await AuthService.updateProfile(user?.id as string, req.body);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, e instanceof Error ? e.message : "Profile update failed", 400);
    }
};

export const AuthController = {
    getMe,
    updateProfile,
};