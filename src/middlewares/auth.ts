import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";

export enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN",
}

export type AuthUser = {
    id: string;
    email?: string;
    role: UserRole;
};

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

const authMiddleware =
    (...roles: UserRole[]) =>
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const headers = fromNodeHeaders({
                    ...req.headers,
                    authorization: req.headers.authorization || "",
                });

                const session = await auth.api.getSession({
                    headers,
                });

                if (!session?.user) {
                    return res.status(401).json({ error: "Unauthorized" });
                }

                const user: AuthUser = {
                    id: session.user.id,
                    email: session.user.email,
                    role: session.user.role as UserRole,
                };

                if (roles.length && !roles.includes(user.role)) {
                    return res.status(403).json({ error: "Forbidden" });
                }

                req.user = user;

                return next();
            } catch (error) {
                console.error("Auth middleware error:", error);
                return res.status(401).json({ error: "Invalid session" });
            }
        };

export default authMiddleware;