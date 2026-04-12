import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";

export enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN",
}

const authMiddleware = (
    ...roles: UserRole[]
) => async (req: Request, res: Response, next: NextFunction) => {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    if (roles.length && !roles.includes(session.user.role as UserRole)) {
        res.status(403).json({ error: "Forbidden" });
        return;
    }

    req.user = session.user;
    next();
};

export default authMiddleware;