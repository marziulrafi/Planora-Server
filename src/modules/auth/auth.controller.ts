import { Request, Response } from "express";
import { AuthService } from "./auth.service";

const register = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.register(req.body);
        res.status(201).json(result);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Registration failed";
        res.status(400).json({ error: msg, details: e });
    }
};

const login = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.login(req.body);
        res.status(200).json(result);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Login failed";
        res.status(400).json({ error: msg, details: e });
    }
};

const getMe = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const result = await AuthService.getMe(user?.id as string);
        res.status(200).json(result);
    } catch (e) {
        res.status(400).json({ error: "Failed to fetch profile", details: e });
    }
};

const updateProfile = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const result = await AuthService.updateProfile(user?.id as string, req.body);
        res.status(200).json(result);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Profile update failed";
        res.status(400).json({ error: msg, details: e });
    }
};

export const AuthController = {
    register,
    login,
    getMe,
    updateProfile,
};